"""
Corgi Design Backend - FastAPI Server
AI-powered web design analysis using Gemini or OpenAI-compatible APIs
"""
import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import PageData, AnalysisResult

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Corgi Design API",
    description="AI-powered web design analysis backend",
    version="1.1.0"
)

# Configure CORS for Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_ai_service():
    """Get AI service based on configuration"""
    provider = os.getenv("AI_PROVIDER", "openai").lower()
    logger.info(f"Getting AI service, provider: {provider}")
    
    if provider == "gemini":
        from services import get_gemini_service
        return get_gemini_service()
    else:  # Default to OpenAI-compatible
        from services import get_openai_service
        return get_openai_service()


@app.get("/")
async def root():
    """Health check endpoint"""
    provider = os.getenv("AI_PROVIDER", "openai")
    return {"status": "ok", "message": "Corgi Design API is running", "ai_provider": provider}


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "corgi-design-api",
        "version": "1.0.0",
        "ai_provider": os.getenv("AI_PROVIDER", "openai")
    }


@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze_page(page_data: PageData):
    """
    Analyze web page design using AI
    """
    logger.info(f"Received analyze request for: {page_data.url}")
    logger.info(f"Page title: {page_data.title}")
    
    try:
        ai_service = get_ai_service()
        logger.info(f"Using AI service: {type(ai_service).__name__}")
        
        result = await ai_service.analyze_design(page_data.model_dump())
        logger.info(f"Analysis result - success: {result.get('success')}")
        
        if not result.get("success", False):
            logger.warning(f"Analysis failed: {result.get('error', 'unknown error')}")
        
        return AnalysisResult(
            success=result.get("success", True),
            summary=result.get("summary", "分析完成"),
            suggestions=result.get("suggestions", []),
            ai_insights=result.get("ai_insights")
        )
    except ValueError as e:
        logger.error(f"ValueError in analyze_page: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Exception in analyze_page: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
