import { AutoProcessor, AutoModelForCTC, env } from '@huggingface/transformers'

env.allowLocalModels = false
env.useBrowserCache = true

const MODEL_ID = 'Xenova/wav2vec2-base-960h'

// Hardcoded vocab for wav2vec2-base-960h
const VOCAB = Object.fromEntries(
  ['<pad>','<unk>','|','E','T','A','O','I','N','S','R','H','L','D','C','U','M','F','P','G','W','Y','B','V','K','X','J','Q','Z']
  .map((c, i) => [c, i])
)

let _processor = null
let _model = null
let _loadPromise = null

export function isModelReady() {
  return _processor !== null && _model !== null
}

export async function ensureModelLoaded(onProgress) {
  if (isModelReady()) return
  if (!_loadPromise) {
    _loadPromise = (async () => {
      const opts = onProgress ? { progress_callback: onProgress } : {}
      _processor = await AutoProcessor.from_pretrained(MODEL_ID, opts)
      _model = await AutoModelForCTC.from_pretrained(MODEL_ID, opts)
    })().catch(e => { _loadPromise = null; throw e })
  }
  return _loadPromise
}

async function decodeAudioTo16kHz(blob) {
  const buf = await blob.arrayBuffer()
  const ctx = new AudioContext()
  const decoded = await ctx.decodeAudioData(buf)
  ctx.close()

  if (decoded.sampleRate === 16000) return decoded.getChannelData(0)

  const frames = Math.ceil(decoded.length / decoded.sampleRate * 16000)
  const offCtx = new OfflineAudioContext(1, frames, 16000)
  const src = offCtx.createBufferSource()
  src.buffer = decoded
  src.connect(offCtx.destination)
  src.start()
  const resampled = await offCtx.startRendering()
  return resampled.getChannelData(0)
}

// Returns [{pi, id}] — character token id per phoneme group
function buildCharMap(phonemes) {
  const result = []
  for (let pi = 0; pi < phonemes.length; pi++) {
    for (const c of phonemes[pi].text.toUpperCase()) {
      if (c >= 'A' && c <= 'Z') result.push({ pi, id: VOCAB[c] ?? VOCAB['<unk>'] })
    }
  }
  return result
}

function logSoftmax(data, T, V) {
  const out = new Float32Array(T * V)
  for (let t = 0; t < T; t++) {
    const off = t * V
    let mx = -Infinity
    for (let v = 0; v < V; v++) if (data[off + v] > mx) mx = data[off + v]
    let sum = 0
    for (let v = 0; v < V; v++) sum += Math.exp(data[off + v] - mx)
    const logSum = mx + Math.log(sum)
    for (let v = 0; v < V; v++) out[off + v] = data[off + v] - logSum
  }
  return out
}

// CTC forced alignment via Viterbi. Returns state-index sequence (length T).
// Even state indices = blank; odd state 2i+1 = targets[i].
function ctcForcedAlign(lp, targets, T, V, blank = 0) {
  const N = targets.length
  if (N === 0) return new Int16Array(T)

  const ext = new Int32Array(2 * N + 1)
  for (let i = 0; i <= N; i++) ext[2 * i] = blank
  for (let i = 0; i < N; i++) ext[2 * i + 1] = targets[i]
  const S = ext.length
  const NEG = -1e30

  let alpha = new Float64Array(S).fill(NEG)
  const bp = new Int16Array(T * S).fill(-1)
  const get = (t, v) => lp[t * V + v]

  alpha[0] = get(0, blank)
  if (S > 1) alpha[1] = get(0, ext[1])

  for (let t = 1; t < T; t++) {
    const prev = alpha.slice()
    alpha.fill(NEG)
    const base = t * S
    for (let s = 0; s < S; s++) {
      let best = prev[s], from = s
      if (s > 0 && prev[s - 1] > best) { best = prev[s - 1]; from = s - 1 }
      if (s > 1 && ext[s] !== blank && ext[s] !== ext[s - 2] && prev[s - 2] > best) {
        best = prev[s - 2]; from = s - 2
      }
      if (best > NEG) { alpha[s] = best + get(t, ext[s]); bp[base + s] = from }
    }
  }

  let s = S < 2 ? 0 : (alpha[S - 1] >= alpha[S - 2] ? S - 1 : S - 2)
  const seq = new Int16Array(T)
  seq[T - 1] = s
  for (let t = T - 1; t > 0; t--) {
    const from = bp[t * S + s]
    if (from >= 0) s = from
    seq[t - 1] = s
  }
  return seq
}

export async function scoreWord(audioBlob, phonemes) {
  await ensureModelLoaded()

  const pcm = await decodeAudioTo16kHz(audioBlob)
  const inputs = await _processor(pcm, { sampling_rate: 16000 })
  const { logits } = await _model(inputs)   // [1, T, V]
  const [, T, V] = logits.dims
  const lp = logSoftmax(logits.data, T, V)

  const charMap = buildCharMap(phonemes)
  if (charMap.length === 0) throw new Error('Từ không có ký tự nhận dạng được')

  const targets = charMap.map(x => x.id)
  const stateSeq = ctcForcedAlign(lp, targets, T, V)

  // Collect per-character log-probs
  const charLps = Array.from({ length: charMap.length }, () => [])
  for (let t = 0; t < T; t++) {
    const s = stateSeq[t]
    if (s % 2 === 1) {
      const ci = (s - 1) / 2
      if (ci < charMap.length) charLps[ci].push(lp[t * V + targets[ci]])
    }
  }
  const charAvg = charLps.map(lps =>
    lps.length ? lps.reduce((a, b) => a + b, 0) / lps.length : -9
  )

  // Aggregate characters → phonemes
  const phonemeLps = phonemes.map(() => [])
  charMap.forEach(({ pi }, ci) => phonemeLps[pi].push(charAvg[ci]))

  const scored = phonemes.map((p, pi) => {
    const lps = phonemeLps[pi]
    const avg = lps.length ? lps.reduce((a, b) => a + b, 0) / lps.length : -9
    // Calibrate: log-prob range [-9, -0.5] → [0, 100]
    const score = Math.max(0, Math.min(100, Math.round((avg + 9) / 8.5 * 100)))
    return { ...p, score, note: null }
  })

  const overall = Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length)
  return { phonemes: scored, overall, spokenWord: phonemes.map(p => p.text).join('') }
}
