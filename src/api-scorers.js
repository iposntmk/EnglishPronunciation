export async function scoreWordOpenAI(audioBlob, phonemes, apiKey) {
  const ext = audioBlob.type.includes('ogg') ? 'ogg'
    : audioBlob.type.includes('mp4') ? 'mp4'
    : 'webm'
  const formData = new FormData()
  formData.append('file', audioBlob, `audio.${ext}`)
  formData.append('model', 'whisper-1')
  formData.append('response_format', 'verbose_json')
  formData.append('timestamp_granularities[]', 'word')

  const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.error?.message || `OpenAI API lỗi ${resp.status}`)
  }

  const data = await resp.json()
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
    note: !wordMatch && overall < 70 ? `Nghe như "${spokenWord}"` : null
  }))

  return { phonemes: scored, overall, spokenWord }
}

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
      useEnhanced: true
    },
    audio: { content: base64 }
  }

  const resp = await fetch(
    `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${encodeURIComponent(apiKey)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.error?.message || `Google Cloud API lỗi ${resp.status}`)
  }

  const data = await resp.json()
  if (!data.results?.length) {
    throw new Error('Không nhận ra giọng nói. Thử nói to và rõ hơn.')
  }

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
    note: !wordMatch && overall < 70 ? `Nghe như "${spokenWord}"` : null
  }))

  return { phonemes: scored, overall, spokenWord }
}
