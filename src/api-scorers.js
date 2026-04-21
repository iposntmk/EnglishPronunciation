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
  const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 })
  const decoded = await ctx.decodeAudioData(arrayBuffer)
  const pcm = decoded.getChannelData(0)
  ctx.close()
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

// Azure (en-US) returns lowercase ARPAbet-like phoneme names → IPA
const AZURE_TO_IPA = {
  iy: 'iː', ih: 'ɪ', eh: 'ɛ', ae: 'æ', ah: 'ʌ', uw: 'uː', uh: 'ʊ',
  ao: 'ɔː', aa: 'ɑː', aw: 'aʊ', ay: 'aɪ', ow: 'oʊ', oy: 'ɔɪ',
  er: 'ɜː', ey: 'eɪ',
  p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g',
  f: 'f', v: 'v', th: 'θ', dh: 'ð', s: 's', z: 'z',
  sh: 'ʃ', zh: 'ʒ', hh: 'h', h: 'h', ch: 'tʃ', jh: 'dʒ',
  m: 'm', n: 'n', ng: 'ŋ', l: 'l', r: 'r', w: 'w', y: 'j',
}

export async function scoreWordAzure(audioBlob, phonemes, subscriptionKey, region) {
  const wavBlob = await audioBlobToPcmWav(audioBlob)
  const targetWord = phonemes.map(p => p.text).join('')

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

  const url = `https://${cleanRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': cleanKey,
      'Content-Type': 'audio/wav',
      'Pronunciation-Assessment': assessmentHeader,
    },
    body: wavBlob,
  })

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '')
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
  const wordAssessment = nbest?.PronunciationAssessment
  const overallScore = Math.round(wordAssessment?.PronScore ?? wordAssessment?.AccuracyScore ?? 0)

  // Build IPA → score map from Azure per-phoneme data
  const azurePhonemes = nbest?.Words?.[0]?.Phonemes || []
  const ipaScoreMap = {}
  for (const ap of azurePhonemes) {
    const ipa = AZURE_TO_IPA[ap.Phoneme?.toLowerCase()]
    if (!ipa) continue
    const s = ap.PronunciationAssessment?.AccuracyScore ?? 0
    if (!(ipa in ipaScoreMap) || s > ipaScoreMap[ipa]) ipaScoreMap[ipa] = s
  }

  const scored = phonemes.map(p => {
    const score = p.ipa in ipaScoreMap ? Math.round(ipaScoreMap[p.ipa]) : overallScore
    return {
      ...p,
      score,
      note: score < 60 ? `Âm /${p.ipa}/ cần luyện thêm` : null,
    }
  })

  const overall = scored.length > 0
    ? Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length)
    : overallScore

  return { phonemes: scored, overall, spokenWord }
}
