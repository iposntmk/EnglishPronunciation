import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertCircle,
  AudioLines,
  Brain,
  CheckCircle2,
  LoaderCircle,
  Mic,
  MicOff,
  RefreshCw,
  Sparkles,
  Upload,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

const SAMPLE_PHRASES = [
  'think through three things',
  'the weather is very warm',
  'world class pronunciation',
  'please speak clearly and slowly',
]

const LESSONS = [
  {
    title: 'TH Sounds',
    detail: 'Contrast /theta/ and /eth/ with live scoring against recorded speech.',
  },
  {
    title: 'R and L',
    detail: 'Spot substitutions that Vietnamese learners often make in minimal pairs.',
  },
  {
    title: 'Final Consonants',
    detail: 'Catch dropped endings such as /t/, /d/, /s/, and /z/ from real audio.',
  },
]

function scoreTone(score) {
  if (score >= 85) return 'good'
  if (score >= 65) return 'mid'
  return 'bad'
}

function formatCapability(value) {
  return value ? 'Available' : 'Not available'
}

function normalizeBackendMessage(reason) {
  if (!reason) return 'Speech backend is offline. Start the FastAPI service to enable analysis.'
  if (
    reason.includes('status 500') ||
    reason.includes('Failed to fetch') ||
    reason.includes('ECONNREFUSED') ||
    reason.includes('Cannot reach backend')
  ) {
    return 'Cannot connect to the local speech backend at http://127.0.0.1:8000.'
  }
  return reason
}

function createDegradedHealth(reason = 'Speech backend is offline. Start the FastAPI service to enable analysis.') {
  return {
    status: 'degraded',
    capabilities: {
      speechbrain_asr: false,
      speechbrain_g2p: false,
      forced_alignment: false,
    },
    models: {
      asr: 'Offline',
      g2p: 'Offline',
      alignment: 'Offline',
    },
    reason: normalizeBackendMessage(reason),
  }
}

async function extractErrorMessage(response) {
  try {
    const data = await response.json()
    return data.detail || data.message || `Request failed with status ${response.status}`
  } catch (_) {
    return `Request failed with status ${response.status}`
  }
}

export default function NewApp() {
  const [apiStatus, setApiStatus] = useState({ loading: true, error: '', data: null })
  const [targetText, setTargetText] = useState(SAMPLE_PHRASES[0])
  const [selectedFile, setSelectedFile] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    let active = true

    async function loadHealth() {
      try {
        const response = await fetch(`${API_BASE}/api/health`)
        if (!response.ok) throw new Error(await extractErrorMessage(response))
        const data = await response.json()
        if (active) setApiStatus({ loading: false, error: '', data })
      } catch (err) {
        if (active) {
          setApiStatus({
            loading: false,
            error: err.message || 'Cannot reach backend',
            data: createDegradedHealth(err.message || 'Cannot reach backend'),
          })
        }
      }
    }

    loadHealth()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach(track => track.stop())
  }, [])

  const healthBadges = useMemo(() => {
    if (!apiStatus.data) return []
    const { capabilities } = apiStatus.data
    return [
      { label: 'ASR', value: formatCapability(capabilities?.speechbrain_asr) },
      { label: 'G2P', value: formatCapability(capabilities?.speechbrain_g2p) },
      { label: 'Alignment', value: formatCapability(capabilities?.forced_alignment) },
    ]
  }, [apiStatus.data])

  async function refreshBackend() {
    setApiStatus(prev => ({ ...prev, loading: true, error: '' }))
    try {
      const response = await fetch(`${API_BASE}/api/health`)
      if (!response.ok) throw new Error(await extractErrorMessage(response))
      const data = await response.json()
      setApiStatus({ loading: false, error: '', data })
    } catch (err) {
      setApiStatus({
        loading: false,
        error: err.message || 'Cannot reach backend',
        data: createDegradedHealth(err.message || 'Cannot reach backend'),
      })
    }
  }

  async function startRecording() {
    setError('')
    setAnalysis(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorderRef.current = recorder
      streamRef.current = stream

      recorder.ondataavailable = event => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: blob.type || 'audio/webm',
        })
        setSelectedFile(file)
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      recorder.start()
      setSelectedFile(null)
      setIsRecording(true)
      setRecordingSeconds(0)
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1)
      }, 1000)
    } catch (err) {
      setError(err.message || 'Cannot access microphone')
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setIsRecording(false)
    try {
      recorderRef.current?.stop()
    } catch (_) {}
  }

  async function analyzeAudio() {
    if (!selectedFile) {
      setError('Record or upload an audio file first.')
      return
    }
    if (!targetText.trim()) {
      setError('Enter the target word or phrase to evaluate.')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setAnalysis(null)

    try {
      const formData = new FormData()
      formData.append('target_text', targetText.trim())
      formData.append('audio', selectedFile)

      const response = await fetch(`${API_BASE}/api/pronunciation/analyze`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error(await extractErrorMessage(response))
      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError(err.message || 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">
            <Brain size={16} />
            Advanced English Pronunciation Lab
          </span>
          <h1>Rebuilt around a real speech pipeline instead of browser-only heuristics.</h1>
          <p>
            The frontend records audio and sends it to a backend that can use SpeechBrain ASR,
            Grapheme-to-Phoneme conversion, optional forced alignment, and phoneme-level scoring.
          </p>

          <div className="hero-actions">
            {SAMPLE_PHRASES.map(phrase => (
              <button
                key={phrase}
                type="button"
                className={`chip ${targetText === phrase ? 'chip-active' : ''}`}
                onClick={() => setTargetText(phrase)}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        <div className="status-card">
          <div className="status-header">
            <div>
              <p className="label">Backend status</p>
              <h2>Speech service</h2>
            </div>
            <button type="button" className="icon-button" onClick={refreshBackend}>
              <RefreshCw size={16} />
            </button>
          </div>

          {apiStatus.loading && (
            <div className="inline-state">
              <LoaderCircle size={18} className="spin" />
              Checking API health
            </div>
          )}

          {!apiStatus.loading && apiStatus.error && (
            <div className="error-box">
              <AlertCircle size={18} />
              <div>
                <strong>Backend offline</strong>
                <p>{apiStatus.data?.reason || apiStatus.error}</p>
              </div>
            </div>
          )}

          {!apiStatus.loading && apiStatus.data && (
            <>
              <div className="badge-row">
                {healthBadges.map(badge => (
                  <div key={badge.label} className="status-badge">
                    <span>{badge.label}</span>
                    <strong>{badge.value}</strong>
                  </div>
                ))}
              </div>

              <div className="stack-list">
                <div>
                  <span className="label">ASR model</span>
                  <strong>{apiStatus.data.models.asr}</strong>
                </div>
                <div>
                  <span className="label">G2P model</span>
                  <strong>{apiStatus.data.models.g2p}</strong>
                </div>
                <div>
                  <span className="label">Forced alignment</span>
                  <strong>{apiStatus.data.models.alignment}</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel analysis-panel">
          <div className="panel-header">
            <div>
              <p className="label">1. Target prompt</p>
              <h2>Choose what the learner should say</h2>
            </div>
            <Sparkles size={18} />
          </div>

          <textarea
            className="prompt-box"
            value={targetText}
            onChange={event => setTargetText(event.target.value)}
            rows={3}
            placeholder="Enter a word, phrase, or sentence"
          />

          <div className="upload-row">
            <label className="upload-button">
              <Upload size={16} />
              Upload audio
              <input
                type="file"
                accept="audio/*"
                hidden
                onChange={event => setSelectedFile(event.target.files?.[0] || null)}
              />
            </label>

            {!isRecording ? (
              <button type="button" className="record-button" onClick={startRecording}>
                <Mic size={16} />
                Record
              </button>
            ) : (
              <button type="button" className="record-button stop" onClick={stopRecording}>
                <MicOff size={16} />
                Stop ({recordingSeconds}s)
              </button>
            )}

            <button
              type="button"
              className="analyze-button"
              onClick={analyzeAudio}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <LoaderCircle size={18} className="spin" /> : <Activity size={18} />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze pronunciation'}
            </button>
          </div>

          <div className="selected-audio">
            <AudioLines size={16} />
            <span>{selectedFile ? selectedFile.name : 'No audio selected yet'}</span>
          </div>

          {error && (
            <div className="error-box">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          {analysis && (
            <div className="results">
              <div className={`score-hero tone-${scoreTone(analysis.overall_score)}`}>
                <div>
                  <p className="label">Overall pronunciation score</p>
                  <h3>{analysis.overall_score}%</h3>
                  <p>{analysis.summary}</p>
                </div>
                <CheckCircle2 size={28} />
              </div>

              <div className="two-col">
                <div className="result-card">
                  <p className="label">Target text</p>
                  <strong>{analysis.target_text}</strong>
                  <p className="muted">{analysis.target_phoneme_string}</p>
                </div>
                <div className="result-card">
                  <p className="label">Recognized speech</p>
                  <strong>{analysis.transcript || 'No transcript returned'}</strong>
                  <p className="muted">{analysis.spoken_phoneme_string}</p>
                </div>
              </div>

              <div className="insight-grid">
                <div className="result-card">
                  <p className="label">Confidence</p>
                  <strong>{analysis.confidence}%</strong>
                </div>
                <div className="result-card">
                  <p className="label">WER vs target</p>
                  <strong>{analysis.word_distance}</strong>
                </div>
                <div className="result-card">
                  <p className="label">Alignment mode</p>
                  <strong>{analysis.alignment_mode}</strong>
                </div>
              </div>

              <div className="phoneme-section">
                <div className="panel-header compact">
                  <div>
                    <p className="label">2. Phoneme feedback</p>
                    <h2>Where the utterance diverged</h2>
                  </div>
                </div>

                <div className="phoneme-list">
                  {analysis.phoneme_results.map(item => (
                    <div key={`${item.index}-${item.target}`} className={`phoneme-card tone-${scoreTone(item.score)}`}>
                      <div className="phoneme-top">
                        <div>
                          <span className="label">Target</span>
                          <strong>/{item.target}/</strong>
                        </div>
                        <div className="score-pill">{item.score}%</div>
                      </div>
                      <p className="muted">Heard: {item.heard ? `/${item.heard}/` : 'missing'}</p>
                      <p>{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tips-list">
                <p className="label">Recommended next drills</p>
                {analysis.recommendations.map(text => (
                  <div key={text} className="tip-item">{text}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="panel lesson-panel">
          <div className="panel-header">
            <div>
              <p className="label">Curriculum layer</p>
              <h2>Keep focused drills in the app</h2>
            </div>
          </div>

          <div className="lesson-list">
            {LESSONS.map(lesson => (
              <div key={lesson.title} className="lesson-card">
                <strong>{lesson.title}</strong>
                <p>{lesson.detail}</p>
              </div>
            ))}
          </div>

          <div className="architecture-card">
            <p className="label">Pipeline</p>
            <ol>
              <li>Capture or upload learner audio in the browser.</li>
              <li>Send it to FastAPI for decoding and normalization.</li>
              <li>Use SpeechBrain ASR and G2P to compare target and spoken phonemes.</li>
              <li>Return structured feedback for word- and phoneme-level coaching.</li>
            </ol>
          </div>
        </aside>
      </section>
    </div>
  )
}
