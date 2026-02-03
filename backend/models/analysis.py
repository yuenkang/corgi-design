"""
Pydantic models for design analysis API
"""
from pydantic import BaseModel
from typing import Optional


class PageData(BaseModel):
    """Request model for page analysis"""
    title: str
    url: str
    html_snippet: str
    images_count: Optional[int] = 0
    links_count: Optional[int] = 0
    headings: Optional[dict] = None


class Suggestion(BaseModel):
    """Individual design suggestion"""
    type: str  # 'success', 'warning', 'info', 'error'
    category: str  # 'SEO', 'Performance', 'Accessibility', 'Design'
    text: str


class AnalysisResult(BaseModel):
    """Response model for analysis results"""
    success: bool
    summary: str
    suggestions: list[Suggestion]
    ai_insights: Optional[str] = None
