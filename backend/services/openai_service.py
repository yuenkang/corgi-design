"""
OpenAI-compatible AI Service for web design analysis
Supports OpenAI, DeepSeek, Moonshot, and other OpenAI-compatible APIs
"""
import os
import json
import httpx
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

import logging
import sys

# AI logging configuration
AI_LOG_ENABLED = os.getenv("AI_LOG_ENABLED", "true").lower() == "true"

# Configure dedicated logger for AI interaction
ai_logger = logging.getLogger("ai_requests")
ai_logger.setLevel(logging.INFO)
# Standard output is automatically captured by Cloud Run
if not ai_logger.handlers:
    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    ai_logger.addHandler(sh)


def ai_log(msg: str):
    """Log AI request/response to standard output"""
    if not AI_LOG_ENABLED:
        return
    
    # In Cloud Run, everything written to stdout is captured by Cloud Logging
    ai_logger.info(msg)


def console_log(msg: str):
    """Print concise log to console/stdout"""
    print(f"[OpenAI] {msg}", flush=True)


class OpenAIService:
    """Service class for interacting with OpenAI-compatible APIs"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        
        console_log(f"Initialized - Model: {self.model}, Base URL: {self.base_url}")
        ai_log("=" * 80)
        ai_log("OpenAI Service Initialized")
        ai_log(f"Base URL: {self.base_url}")
        ai_log(f"Model: {self.model}")
        ai_log(f"API Key: {self.api_key[:20]}...{self.api_key[-4:] if self.api_key else 'None'}")
        ai_log(f"AI Log Enabled: {AI_LOG_ENABLED}")
        
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")
    
    async def analyze_design(self, page_data: dict) -> dict:
        """
        Analyze web page design using OpenAI-compatible API
        """
        prompt = self._build_prompt(page_data)
        url = page_data.get('url', 'unknown')
        
        console_log(f"Starting analysis for: {url}")
        
        # Log request details to file
        ai_log("=" * 80)
        ai_log(f"NEW REQUEST - {url}")
        ai_log("=" * 80)
        ai_log(f"Title: {page_data.get('title', 'unknown')}")
        ai_log(f"Images: {page_data.get('images_count', 0)}, Links: {page_data.get('links_count', 0)}")
        
        # Prepare request body
        request_body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "你是一位资深的网页设计专家和前端开发顾问。请用JSON格式回复。"},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        ai_log("-" * 40)
        ai_log("REQUEST:")
        ai_log(f"Endpoint: {self.base_url}/chat/completions")
        ai_log(f"Model: {self.model}")
        ai_log(f"Max tokens: 2000")
        ai_log(f"Prompt ({len(prompt)} chars):")
        ai_log(prompt)
        ai_log("-" * 40)
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                request_url = f"{self.base_url}/chat/completions"
                
                response = await client.post(
                    request_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json=request_body
                )
                
                response_text = response.text
                
                ai_log("-" * 40)
                ai_log("RESPONSE:")
                ai_log(f"Status Code: {response.status_code}")
                ai_log(f"Response ({len(response_text)} chars):")
                ai_log(response_text)
                ai_log("-" * 40)
                
                if response.status_code != 200:
                    console_log(f"API Error: {response.status_code}")
                    ai_log(f"ERROR: API returned {response.status_code}")
                    return {
                        "success": False,
                        "error": f"API returned {response.status_code}: {response_text[:500]}",
                        "suggestions": []
                    }
                
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                finish_reason = result["choices"][0].get("finish_reason", "unknown")
                usage = result.get("usage", {})
                
                console_log(f"Response received - {usage.get('total_tokens', 0)} tokens, {finish_reason}")
                ai_log(f"Finish Reason: {finish_reason}")
                ai_log(f"Token Usage: {usage}")
                ai_log(f"Content ({len(content)} chars):")
                ai_log(content)
                
                return self._parse_response(content)
                
        except httpx.TimeoutException as e:
            console_log(f"Timeout error: {e}")
            ai_log(f"TIMEOUT ERROR: {e}")
            return {
                "success": False,
                "error": f"Request timeout: {str(e)}",
                "suggestions": []
            }
        except httpx.RequestError as e:
            console_log(f"Request error: {e}")
            ai_log(f"REQUEST ERROR: {e}")
            return {
                "success": False,
                "error": f"Request error: {str(e)}",
                "suggestions": []
            }
        except Exception as e:
            console_log(f"Unexpected error: {type(e).__name__}: {e}")
            ai_log(f"UNEXPECTED ERROR: {type(e).__name__}: {e}")
            import traceback
            ai_log(traceback.format_exc())
            return {
                "success": False,
                "error": f"{type(e).__name__}: {str(e)}",
                "suggestions": []
            }
    
    def _build_prompt(self, page_data: dict) -> str:
        """Build analysis prompt"""
        return f"""请分析以下网页信息，并提供专业的设计优化建议。

## 网页信息
- **标题**: {page_data.get('title', '未知')}
- **URL**: {page_data.get('url', '未知')}
- **图片数量**: {page_data.get('images_count', 0)}
- **链接数量**: {page_data.get('links_count', 0)}
- **标题层级**: {page_data.get('headings', {})}

## HTML 片段
```html
{page_data.get('html_snippet', '')[:2000]}
```

请从以下维度分析：SEO优化、性能优化、可访问性、设计规范

请用以下 JSON 格式回复（只返回 JSON）：
{{
    "summary": "简短的整体评价（1-2句话）",
    "suggestions": [
        {{
            "type": "success|warning|info|error",
            "category": "SEO|Performance|Accessibility|Design",
            "text": "具体建议内容"
        }}
    ],
    "ai_insights": "AI 的深度分析见解（2-3句话）"
}}
"""

    def _parse_response(self, response_text: str) -> dict:
        """Parse response into structured format"""
        text = response_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        try:
            result = json.loads(text)
            result["success"] = True
            console_log(f"Parsed OK - {len(result.get('suggestions', []))} suggestions")
            ai_log(f"PARSE SUCCESS: {len(result.get('suggestions', []))} suggestions")
            return result
        except json.JSONDecodeError as e:
            console_log(f"JSON parse error: {e}")
            ai_log(f"JSON PARSE ERROR: {e}")
            ai_log(f"Failed text: {text[:500]}")
            return {
                "success": True,
                "summary": "分析完成",
                "suggestions": [
                    {
                        "type": "info",
                        "category": "Design",
                        "text": response_text[:500]
                    }
                ],
                "ai_insights": None
            }


# Singleton instance
_openai_service = None


def get_openai_service() -> OpenAIService:
    """Get or create OpenAI service instance"""
    global _openai_service
    if _openai_service is None:
        console_log("Creating new OpenAI service instance")
        _openai_service = OpenAIService()
    return _openai_service
