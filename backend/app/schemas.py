from pydantic import BaseModel


class HealthCapabilities(BaseModel):
    speechbrain_asr: bool
    speechbrain_g2p: bool
    forced_alignment: bool


class HealthModels(BaseModel):
    asr: str
    g2p: str
    alignment: str


class HealthResponse(BaseModel):
    status: str
    capabilities: HealthCapabilities
    models: HealthModels


class PhonemeResult(BaseModel):
    index: int
    target: str
    heard: str | None = None
    score: int
    note: str


class AnalysisResponse(BaseModel):
    target_text: str
    transcript: str
    target_phoneme_string: str
    spoken_phoneme_string: str
    overall_score: int
    confidence: int
    word_distance: int
    alignment_mode: str
    summary: str
    phoneme_results: list[PhonemeResult]
    recommendations: list[str]
