from __future__ import annotations

import os
import re
import tempfile
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Iterable

from fastapi import UploadFile

try:
    from speechbrain.inference.ASR import EncoderASR
    from speechbrain.inference.text import GraphemeToPhoneme
except Exception:  # pragma: no cover
    EncoderASR = None
    GraphemeToPhoneme = None

try:
    from speechbrain.integrations.k2_fsa.align import CTCAligner
except Exception:  # pragma: no cover
    CTCAligner = None

from ..schemas import (
    AnalysisResponse,
    HealthCapabilities,
    HealthModels,
    HealthResponse,
    PhonemeResult,
)

ASR_MODEL_SOURCE = os.getenv('SPEECHBRAIN_ASR_SOURCE', 'speechbrain/asr-wav2vec2-commonvoice-en')
G2P_MODEL_SOURCE = os.getenv('SPEECHBRAIN_G2P_SOURCE', 'speechbrain/soundchoice-g2p')
MODEL_CACHE_DIR = Path(os.getenv('SPEECH_MODELS_DIR', Path.cwd() / '.cache' / 'speechbrain'))
ALIGNMENT_ENABLED = os.getenv('ENABLE_K2_ALIGNMENT', '0') == '1'

PHONEME_GROUPS = {
    'θ': {'ð', 'f', 't'},
    'ð': {'θ', 'd', 'z', 'v'},
    'r': {'l', 'w'},
    'l': {'r'},
    'v': {'w', 'f', 'b'},
    'w': {'v', 'r'},
    'ɪ': {'iː', 'ə'},
    'iː': {'ɪ'},
    'æ': {'ɛ', 'ʌ'},
    'ʌ': {'æ', 'ə', 'ɑː'},
    'ʃ': {'s', 'tʃ'},
    'tʃ': {'ʃ', 'dʒ'},
    'z': {'s', 'ð'},
    's': {'z', 'ʃ'},
}


def _normalize_text(text: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z'\s-]", ' ', text.lower())
    return re.sub(r'\s+', ' ', cleaned).strip()


def _flatten(phoneme_output: Iterable) -> list[str]:
    flat: list[str] = []
    for token in phoneme_output:
        if isinstance(token, (list, tuple)):
            flat.extend(_flatten(token))
        elif isinstance(token, str):
            cleaned = token.strip()
            if cleaned and cleaned not in {' ', '<spc>'}:
                flat.append(cleaned)
    return flat


def _levenshtein_alignment(reference: list[str], hypothesis: list[str]) -> list[tuple[str | None, str | None]]:
    rows = len(reference) + 1
    cols = len(hypothesis) + 1
    dp = [[0] * cols for _ in range(rows)]

    for i in range(rows):
        dp[i][0] = i
    for j in range(cols):
        dp[0][j] = j

    for i in range(1, rows):
        for j in range(1, cols):
            cost = 0 if reference[i - 1] == hypothesis[j - 1] else 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost,
            )

    alignment: list[tuple[str | None, str | None]] = []
    i = len(reference)
    j = len(hypothesis)
    while i > 0 or j > 0:
        if i > 0 and j > 0:
            cost = 0 if reference[i - 1] == hypothesis[j - 1] else 1
            if dp[i][j] == dp[i - 1][j - 1] + cost:
                alignment.append((reference[i - 1], hypothesis[j - 1]))
                i -= 1
                j -= 1
                continue
        if i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            alignment.append((reference[i - 1], None))
            i -= 1
            continue
        alignment.append((None, hypothesis[j - 1]))
        j -= 1

    alignment.reverse()
    return alignment


def _score_pair(target: str, heard: str | None) -> tuple[int, str]:
    if heard is None:
        return 15, f'Missing /{target}/ in the spoken output.'
    if heard == target:
        return 96, f'/{target}/ was recognized clearly.'
    if heard in PHONEME_GROUPS.get(target, set()):
        return 68, f'Heard /{heard}/ instead of /{target}/. This is a common near miss.'
    return 35, f'Heard /{heard}/ instead of /{target}/.'


@dataclass
class LoadedModels:
    asr: object | None
    g2p: object | None
    aligner: object | None


@lru_cache(maxsize=1)
def load_models() -> LoadedModels:
    MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)

    asr = None
    g2p = None
    aligner = None

    if EncoderASR is not None:
        asr = EncoderASR.from_hparams(
            source=ASR_MODEL_SOURCE,
            savedir=str(MODEL_CACHE_DIR / 'asr'),
            run_opts={'device': 'cpu'},
        )

    if GraphemeToPhoneme is not None:
        g2p = GraphemeToPhoneme.from_hparams(
            source=G2P_MODEL_SOURCE,
            savedir=str(MODEL_CACHE_DIR / 'g2p'),
            run_opts={'device': 'cpu'},
        )

    if ALIGNMENT_ENABLED and CTCAligner is not None and asr is not None and hasattr(asr, 'tokenizer'):
        try:
            aligner = CTCAligner(asr.hparams.decoding_function, asr.tokenizer)
        except Exception:
            aligner = None

    return LoadedModels(asr=asr, g2p=g2p, aligner=aligner)


def health() -> HealthResponse:
    try:
        models = load_models()
    except Exception:
        models = LoadedModels(asr=None, g2p=None, aligner=None)

    return HealthResponse(
        status='ok' if models.asr and models.g2p else 'degraded',
        capabilities=HealthCapabilities(
            speechbrain_asr=models.asr is not None,
            speechbrain_g2p=models.g2p is not None,
            forced_alignment=models.aligner is not None,
        ),
        models=HealthModels(
            asr=ASR_MODEL_SOURCE if models.asr else 'Unavailable',
            g2p=G2P_MODEL_SOURCE if models.g2p else 'Unavailable',
            alignment='SpeechBrain CTCAligner' if models.aligner else 'Disabled or unsupported',
        ),
    )


async def analyze_pronunciation(target_text: str, audio: UploadFile) -> AnalysisResponse:
    normalized_target = _normalize_text(target_text)
    if not normalized_target:
        raise ValueError('Target text cannot be empty.')

    models = load_models()
    if models.asr is None or models.g2p is None:
        raise RuntimeError(
            'SpeechBrain models are not available. Install backend dependencies and start the API server.'
        )

    suffix = Path(audio.filename or 'recording.webm').suffix or '.webm'
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as handle:
        payload = await audio.read()
        handle.write(payload)
        temp_path = Path(handle.name)

    try:
        transcript = _normalize_text(models.asr.transcribe_file(str(temp_path)))
        target_phonemes = _flatten(models.g2p.g2p(normalized_target))
        spoken_phonemes = _flatten(models.g2p.g2p(transcript or ''))
    finally:
        temp_path.unlink(missing_ok=True)

    alignment = _levenshtein_alignment(target_phonemes, spoken_phonemes)
    phoneme_results: list[PhonemeResult] = []

    target_index = 0
    for target, heard in alignment:
        if target is None:
            continue
        score, note = _score_pair(target, heard)
        phoneme_results.append(
            PhonemeResult(
                index=target_index,
                target=target,
                heard=heard,
                score=score,
                note=note,
            )
        )
        target_index += 1

    overall = round(sum(item.score for item in phoneme_results) / max(len(phoneme_results), 1))
    confidence = max(25, min(99, overall + (8 if transcript else -20)))
    word_distance = _word_distance(normalized_target, transcript)
    recommendations = _recommendations(phoneme_results)
    summary = _summary(overall, word_distance, transcript)

    return AnalysisResponse(
        target_text=normalized_target,
        transcript=transcript,
        target_phoneme_string=' '.join(target_phonemes),
        spoken_phoneme_string=' '.join(spoken_phonemes),
        overall_score=overall,
        confidence=confidence,
        word_distance=word_distance,
        alignment_mode='speechbrain-k2' if models.aligner else 'phoneme-sequence',
        summary=summary,
        phoneme_results=phoneme_results,
        recommendations=recommendations,
    )


def _word_distance(target_text: str, transcript: str) -> int:
    target_words = target_text.split()
    heard_words = transcript.split()
    edits = 0
    for target, heard in _levenshtein_alignment(target_words, heard_words):
        if target != heard:
            edits += 1
    return edits


def _recommendations(results: list[PhonemeResult]) -> list[str]:
    weak = [item for item in results if item.score < 70]
    if not weak:
        return [
            'Increase phrase length and test connected speech.',
            'Repeat at a faster pace to confirm the pronunciation is stable.',
            'Switch to sentence drills with mixed stress patterns.',
        ]

    top = weak[:3]
    return [f'Drill /{item.target}/ in isolation, then repeat the full word.' for item in top]


def _summary(overall: int, word_distance: int, transcript: str) -> str:
    if not transcript:
        return 'Speech was not recognized clearly enough to produce detailed feedback.'
    if overall >= 85 and word_distance == 0:
        return 'The utterance matches the target closely at both transcript and phoneme level.'
    if overall >= 65:
        return 'Core pronunciation is understandable, but a few phonemes still drift away from the target.'
    return 'The backend found several mismatches. Slow down, exaggerate the target sounds, and retry.'
