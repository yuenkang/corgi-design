"""
Gemini AI Service for web design analysis
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()


class GeminiService:
    """Service class for interacting with Google Gemini API"""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash")
    
    async def analyze_design(self, page_data: dict) -> dict:
        """
        Analyze web page design using Gemini AI
        
        Args:
            page_data: Dictionary containing page information
            
        Returns:
            Dictionary with analysis results and suggestions
        """
        prompt = self._build_prompt(page_data)
        
        try:
            response = await self.model.generate_content_async(prompt)
            return self._parse_response(response.text)
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "suggestions": []
            }
    
    def _build_prompt(self, page_data: dict) -> str:
        """Build analysis prompt for Gemini"""
        return f"""你是一位资深的网页设计专家和前端开发顾问。请分析以下网页信息，并提供专业的设计优化建议。

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

请从以下几个维度分析并给出建议：

1. **SEO优化** - 标题、元描述、标题层级结构
2. **性能优化** - 图片、脚本、资源加载
3. **可访问性** - 语义化HTML、ARIA标签
4. **设计规范** - 布局、色彩、字体、间距

请用以下 JSON 格式回复（只返回 JSON，不要其他内容）：
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
        """Parse Gemini response into structured format"""
        import json
        
        # Clean up response - remove markdown code blocks if present
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
            return result
        except json.JSONDecodeError:
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
_gemini_service = None


def get_gemini_service() -> GeminiService:
    """Get or create Gemini service instance"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
