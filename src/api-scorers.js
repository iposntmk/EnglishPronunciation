// ─── SHARED HELPERS ───────────────────────────────────────────────────────

function whisperScoreFromTranscript(data, phonemes) {
  const transcript = (data.text || '').trim().toLowerCase().replace(/[.,!?]/g, '')
  const spokenWord = transcript.split(/\s+/)[0] || transcript
  const targetWord = phonemes.map(p => p.text).join('').toLowerCase()
  const words = data.words || []
  const avgProb = words.length > 0
    ? words.reduce((s, w) => s + (w.probability ?? 1), 0) / words.length
    : 0.5
  const wordMatch = spokenWord === targetWord || transcript.includes(targetWord)
  const baseScore = Math.round(avgProb * 100)
  const overall = wordMatch ? baseScore : Math.max(0, baseScore - 25)
  const scored = phonemes.map(p => ({
    ...p,
    score: overall,
    note: !wordMatch && overall < 70 ? `Nghe như "${spokenWord}"` : null,
  }))
  return { phonemes: scored, overall, spokenWord }
}

async function audioBlobToPcmWav(blob) {
  const arrayBuffer = await blob.arrayBuffer()
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const decoded = await ctx.decodeAudioData(arrayBuffer)
  ctx.close()

  let pcm
  if (decoded.sampleRate === 16000) {
    pcm = decoded.getChannelData(0)
  } else {
    const frames = Math.ceil(decoded.length / decoded.sampleRate * 16000)
    const offCtx = new OfflineAudioContext(1, frames, 16000)
    const src = offCtx.createBufferSource()
    src.buffer = decoded
    src.connect(offCtx.destination)
    src.start()
    const resampled = await offCtx.startRendering()
    pcm = resampled.getChannelData(0)
  }
  const wavBuf = new ArrayBuffer(44 + pcm.length * 2)
  const v = new DataView(wavBuf)
  const ws = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)) }
  ws(0, 'RIFF'); v.setUint32(4, 36 + pcm.length * 2, true)
  ws(8, 'WAVE'); ws(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, 16000, true); v.setUint32(28, 32000, true)
  v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  ws(36, 'data'); v.setUint32(40, pcm.length * 2, true)
  for (let i = 0; i < pcm.length; i++) {
    v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, pcm[i])) * 32767), true)
  }
  return new Blob([wavBuf], { type: 'audio/wav' })
}

// ─── OPENAI WHISPER ────────────────────────────────────────────────────────

export async function scoreWordOpenAI(audioBlob, phonemes, apiKey) {
  const ext = audioBlob.type.includes('ogg') ? 'ogg'
    : audioBlob.type.includes('mp4') ? 'mp4' : 'webm'
  const formData = new FormData()
  formData.append('file', audioBlob, `audio.${ext}`)
  formData.append('model', 'whisper-1')
  formData.append('response_format', 'verbose_json')
  formData.append('timestamp_granularities[]', 'word')

  const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.error?.message || `OpenAI API lỗi ${resp.status}`)
  }
  return whisperScoreFromTranscript(await resp.json(), phonemes)
}

// ─── GROQ WHISPER (FREE) ───────────────────────────────────────────────────

export async function scoreWordGroq(audioBlob, phonemes, apiKey) {
  const ext = audioBlob.type.includes('ogg') ? 'ogg'
    : audioBlob.type.includes('mp4') ? 'mp4' : 'webm'
  const formData = new FormData()
  formData.append('file', audioBlob, `audio.${ext}`)
  formData.append('model', 'whisper-large-v3')
  formData.append('response_format', 'verbose_json')
  formData.append('timestamp_granularities[]', 'word')

  const resp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.error?.message || `Groq API lỗi ${resp.status}`)
  }
  return whisperScoreFromTranscript(await resp.json(), phonemes)
}

// ─── GOOGLE CLOUD SPEECH (FREE 60 phút/tháng) ─────────────────────────────

export async function scoreWordGoogleCloud(audioBlob, phonemes, apiKey) {
  const arrayBuffer = await audioBlob.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  const base64 = btoa(binary)

  const mimeType = audioBlob.type || 'audio/webm'
  const encoding = mimeType.includes('ogg') ? 'OGG_OPUS'
    : mimeType.includes('mp4') || mimeType.includes('m4a') ? 'MP3'
    : 'WEBM_OPUS'

  const body = {
    config: {
      encoding,
      languageCode: 'en-US',
      enableWordConfidence: true,
      model: 'command_and_search',
      useEnhanced: true,
    },
    audio: { content: base64 },
  }

  const resp = await fetch(
    `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${encodeURIComponent(apiKey)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  )
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.error?.message || `Google Cloud API lỗi ${resp.status}`)
  }

  const data = await resp.json()
  if (!data.results?.length) throw new Error('Không nhận ra giọng nói. Thử nói to và rõ hơn.')

  const alt = data.results[0].alternatives[0]
  const transcript = (alt.transcript || '').trim().toLowerCase().replace(/[.,!?]/g, '')
  const spokenWord = transcript.split(/\s+/)[0] || transcript
  const targetWord = phonemes.map(p => p.text).join('').toLowerCase()
  const words = alt.words || []
  const avgConf = words.length > 0
    ? words.reduce((s, w) => s + (w.confidence ?? alt.confidence ?? 0.5), 0) / words.length
    : (alt.confidence ?? 0.5)
  const wordMatch = spokenWord === targetWord || transcript.includes(targetWord)
  const baseScore = Math.round(avgConf * 100)
  const overall = wordMatch ? baseScore : Math.max(0, baseScore - 25)
  const scored = phonemes.map(p => ({
    ...p,
    score: overall,
    note: !wordMatch && overall < 70 ? `Nghe như "${spokenWord}"` : null,
  }))
  return { phonemes: scored, overall, spokenWord }
}

// ─── AZURE SPEECH PRONUNCIATION ASSESSMENT ────────────────────────────────

import { recordAzureUsage } from './azureUsage.js'

const VOWEL_IPA_SET = new Set([
  'iː','ɪ','ɛ','æ','ʌ','ə','ɜː','uː','ʊ','ɔː','ɑː',
  'eɪ','aɪ','aʊ','oʊ','ɔɪ','ɛər','ɪər','ɑːr','ɔːr',
])

// 0-based index of stressed vowel (counting only vowel phonemes) for common EN words
const EN_STRESS_IDX = {
  about:1, after:0, again:1, always:0, another:1, answer:0,
  banana:1, beautiful:0, because:1, before:1, better:0,
  brother:0, butter:0, candy:0, careful:0, cheddar:0,
  city:0, computer:1, different:0, dinner:0, enjoy:1, enough:1,
  every:0, family:0, father:0, flower:0, funny:0, future:0,
  gentle:0, giggly:0, happy:0, hello:1, hippo:0, important:1,
  language:0, lazy:0, learning:0, lemon:0, little:0, lollipop:0,
  morning:0, mother:0, muddy:0, music:0, nature:0, necklace:0,
  nothing:0, only:0, open:0, other:0, people:0, photo:0,
  pretty:0, problem:0, pronunciation:3, question:0,
  really:0, shiny:0, sister:0, story:0, study:0, table:0,
  teacher:0, tiny:0, today:1, together:1, treasure:0, turtle:0,
  under:0, university:3, usual:0, vegetable:0, very:0,
  water:0, weather:0, wonderful:0, yogurt:0, yummy:0, zebra:0,
}

// Azure (en-US) returns lowercase ARPAbet-like phoneme names → IPA
const AZURE_TO_IPA_EN = {
  iy: 'iː', ih: 'ɪ', eh: 'ɛ', ae: 'æ', ah: 'ʌ', uw: 'uː', uh: 'ʊ',
  ao: 'ɔː', aa: 'ɑː', aw: 'aʊ', ay: 'aɪ', ow: 'oʊ', oy: 'ɔɪ',
  er: 'ɜː', ey: 'eɪ',
  p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g',
  f: 'f', v: 'v', th: 'θ', dh: 'ð', s: 's', z: 'z',
  sh: 'ʃ', zh: 'ʒ', hh: 'h', h: 'h', ch: 'tʃ', jh: 'dʒ',
  m: 'm', n: 'n', ng: 'ŋ', l: 'l', r: 'r', w: 'w', y: 'j',
}

// Azure es-ES phoneme IDs → IPA
const AZURE_TO_IPA_ES = {
  a: 'a', e: 'e', i: 'i', o: 'o', u: 'u',
  p: 'p', b: 'b', B: 'β', t: 't', d: 'd', D: 'ð',
  k: 'k', g: 'g', G: 'ɣ', f: 'f', s: 's', S: 'ʃ',
  x: 'x', tS: 'tʃ', jj: 'j', y: 'j', j: 'j',
  m: 'm', n: 'n', N: 'ɲ', l: 'l', L: 'ʎ',
  r: 'ɾ', rr: 'r', R: 'r',
  w: 'w',
}

// Azure it-IT phoneme IDs → IPA
const AZURE_TO_IPA_IT = {
  a: 'a', e: 'e', i: 'i', o: 'o', u: 'u',
  p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g',
  f: 'f', v: 'v', s: 's', z: 'z',
  tS: 'tʃ', dZ: 'dʒ', ts: 'ts', dz: 'dz',
  S: 'ʃ', r: 'r', l: 'l', L: 'ʎ',
  m: 'm', n: 'n', J: 'ɲ',
  w: 'w', j: 'j',
}

// Azure fr-FR phoneme IDs → IPA  (SAMPA-style IDs used by Azure)
const AZURE_TO_IPA_FR = {
  a: 'a', e: 'e', E: 'ɛ', i: 'i', o: 'o', O: 'ɔ', u: 'u', y: 'y',
  '2': 'ø', '9': 'œ', '@': 'ə',
  'a~': 'ɑ̃', 'E~': 'ɛ̃', 'o~': 'ɔ̃', '9~': 'œ̃',
  p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g',
  f: 'f', v: 'v', s: 's', z: 'z',
  S: 'ʃ', Z: 'ʒ',
  m: 'm', n: 'n', J: 'ɲ', N: 'ŋ',
  l: 'l', R: 'ʁ',
  j: 'j', w: 'w', H: 'ɥ',
}

const AZURE_PHONEME_MAPS = {
  'en-US': AZURE_TO_IPA_EN,
  'es-ES': AZURE_TO_IPA_ES,
  'it-IT': AZURE_TO_IPA_IT,
  'fr-FR': AZURE_TO_IPA_FR,
}

export async function scoreWordAzure(audioBlob, phonemes, subscriptionKey, region, language = 'en-US') {
  const wavBlob = await audioBlobToPcmWav(audioBlob)
  const targetWord = phonemes.map(p => p.text).join('')

  // Track usage: WAV is 16kHz 16-bit mono → 2 bytes/sample
  const wavDurationSeconds = wavBlob.size / (16000 * 2)
  recordAzureUsage(wavDurationSeconds)

  const assessmentCfg = {
    ReferenceText: targetWord,
    GradingSystem: 'HundredMark',
    Granularity: 'Phoneme',
    Dimension: 'Comprehensive',
    EnableMiscue: true,
  }
  // Strip any CR/LF that btoa may insert; also trim key to avoid whitespace from secrets
  const cleanKey = subscriptionKey.trim().replace(/[\r\n]/g, '')
  const cleanRegion = region.trim().replace(/[\r\n]/g, '')
  const assessmentHeader = btoa(JSON.stringify(assessmentCfg)).replace(/[\r\n]/g, '')

  const url = `https://${cleanRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${encodeURIComponent(language)}&format=detailed`
  console.log('[Azure] POST', url, '| word:', targetWord, '| keyLen:', cleanKey.length, '| keyPrefix:', cleanKey.slice(0, 6) + '...')
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': cleanKey,
      'Content-Type': 'audio/wav',
      'Pronunciation-Assessment': assessmentHeader,
    },
    body: wavBlob,
  })
  console.log('[Azure] response status:', resp.status, resp.statusText)

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '')
    console.error('[Azure] error body:', txt)
    const hint = resp.status === 401
      ? ' — Key sai hoặc hết hạn. Kiểm tra lại GitHub Secret AZUREKEY.'
      : resp.status === 403 ? ' — Không có quyền truy cập resource.'
      : resp.status === 0 ? ' — CORS bị chặn.'
      : ''
    throw new Error(`Azure ${resp.status}${hint} ${txt.slice(0, 150)}`)
  }

  const data = await resp.json()

  if (data.RecognitionStatus !== 'Success') {
    throw new Error(`Azure không nhận ra giọng nói: ${data.RecognitionStatus}`)
  }

  const nbest = data.NBest?.[0]
  const spokenWord = (nbest?.Lexical || '').trim().toLowerCase().replace(/[.,!?]/g, '').split(/\s+/)[0] || ''
  // Scores are directly on NBest[0], not nested under PronunciationAssessment
  const overallScore = Math.round(nbest?.PronScore ?? nbest?.AccuracyScore ?? 0)

  // Build IPA → score + timing maps from Azure per-phoneme data
  const phonemeMap = AZURE_PHONEME_MAPS[language] || AZURE_TO_IPA_EN
  const azurePhonemes = nbest?.Words?.[0]?.Phonemes || []
  const ipaScoreMap = {}
  const ipaTimingMap = {} // ipa → { offset, duration } in seconds
  for (const ap of azurePhonemes) {
    const rawId = ap.Phoneme || ''
    const ipa = phonemeMap[rawId] || phonemeMap[rawId.toLowerCase()]
    if (!ipa) continue
    const s = ap.AccuracyScore ?? ap.PronunciationAssessment?.AccuracyScore ?? 0
    if (!(ipa in ipaScoreMap) || s > ipaScoreMap[ipa]) {
      ipaScoreMap[ipa] = s
      // Azure Offset/Duration are in 100-nanosecond units
      ipaTimingMap[ipa] = {
        offset: (ap.Offset ?? 0) / 10_000_000,
        duration: (ap.Duration ?? 0) / 10_000_000,
      }
    }
  }

  const scored = phonemes.map(p => {
    const score = p.ipa in ipaScoreMap ? Math.round(ipaScoreMap[p.ipa]) : overallScore
    const timing = ipaTimingMap[p.ipa] ?? null
    return {
      ...p,
      score,
      audioOffset: timing?.offset ?? null,
      audioDuration: timing?.duration ?? null,
      note: score < 60 ? `Âm /${p.ipa}/ cần luyện thêm` : null,
    }
  })

  const overall = scored.length > 0
    ? Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length)
    : overallScore

  // Syllable stress detection — English only, words with ≥ 2 vowel phonemes
  let stress = null
  if (language === 'en-US') {
    const allVowels = scored.filter(p => VOWEL_IPA_SET.has(p.ipa))
    const expectedIdx = EN_STRESS_IDX[targetWord.toLowerCase()]
    if (allVowels.length >= 2 && expectedIdx !== undefined) {
      const vowelsWithTiming = allVowels.filter(p => p.audioDuration !== null && p.audioDuration > 0)
      if (vowelsWithTiming.length >= 2) {
        const longest = vowelsWithTiming.reduce((a, b) => (b.audioDuration > a.audioDuration ? b : a))
        const detectedIdx = allVowels.indexOf(longest)
        const correct = detectedIdx === expectedIdx
        stress = {
          correct,
          detected: detectedIdx,
          expected: expectedIdx,
          score: correct ? 100 : 30,
          detectedIpa: allVowels[detectedIdx]?.ipa,
          expectedIpa: allVowels[expectedIdx]?.ipa,
          note: correct
            ? 'Trọng âm đúng ✓'
            : `Cần nhấn mạnh âm /${allVowels[expectedIdx]?.ipa}/ (âm thứ ${expectedIdx + 1})`,
        }
      }
    }
  }

  return { phonemes: scored, overall, spokenWord, stress }
}
