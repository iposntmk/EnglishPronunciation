# English Pronunciation Lab

This rebuild keeps the app on `React + Vite`, but moves pronunciation analysis to a real backend pipeline.

## Stack

- Frontend: `React 18`, `Vite`, `Tailwind CSS`, browser `MediaRecorder`
- Backend: `FastAPI`
- Speech pipeline: `SpeechBrain` ASR + `SpeechBrain` Grapheme-to-Phoneme
- Optional advanced alignment: `SpeechBrain CTCAligner` when `k2` is installed and enabled

## Why this architecture

The original app simulated scoring entirely in the browser. The new version sends learner audio to a backend that can:

1. transcribe the learner audio with SpeechBrain ASR,
2. derive phoneme sequences for the target phrase and recognized speech,
3. align the phoneme sequences and score the mismatches,
4. return structured coaching feedback to the UI.

## Run the frontend

```bash
npm install
npm run dev
```

## Run the backend

You need a working Python environment first. SpeechBrain's own installation guide says the default supported path is Linux/macOS, and Windows requires extra setup.

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

## Optional forced alignment

SpeechBrain documents `CTCAligner` for forced alignment, but it relies on `k2`. In this project alignment is optional and disabled by default.

To experiment with it after installing `k2`, set:

```bash
ENABLE_K2_ALIGNMENT=1
```

## Notes

- In the current desktop environment used for this rebuild, Python was not available on `PATH`, so the backend could be scaffolded but not executed here.
- The frontend will still build without the backend, but analysis requests require `http://127.0.0.1:8000`.
