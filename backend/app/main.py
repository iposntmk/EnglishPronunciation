from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .services.pronunciation import analyze_pronunciation, health

app = FastAPI(
    title='English Pronunciation API',
    version='2.0.0',
    description='Speech-aware backend for pronunciation analysis built around SpeechBrain.',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/api/health')
def get_health():
    return health()


@app.post('/api/pronunciation/analyze')
async def post_pronunciation_analysis(
    target_text: str = Form(...),
    audio: UploadFile = File(...),
):
    try:
        return await analyze_pronunciation(target_text=target_text, audio=audio)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Unexpected backend error: {exc}') from exc
