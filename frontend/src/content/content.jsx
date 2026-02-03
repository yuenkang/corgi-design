import './content.css'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { analyzePageDesign, checkApiHealth } from '../services/api'

// Sidebar Component
function Sidebar({ onClose }) {
    const [analyzing, setAnalyzing] = useState(true)
    const [pageInfo, setPageInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])
    const [aiInsights, setAiInsights] = useState(null)
    const [error, setError] = useState(null)
    const [apiAvailable, setApiAvailable] = useState(true)

    useEffect(() => {
        const init = async () => {
            // Check API availability first
            const isAvailable = await checkApiHealth()
            setApiAvailable(isAvailable)

            // Collect page info
            const info = collectPageInfo()
            setPageInfo(info)

            if (isAvailable) {
                await analyzeWithAI(info)
            } else {
                // Fallback to local analysis
                analyzeLocally(info)
            }
        }

        const timer = setTimeout(init, 500)
        return () => clearTimeout(timer)
    }, [])

    const collectPageInfo = () => {
        return {
            title: document.title,
            url: window.location.href,
            images: document.images.length,
            links: document.links.length,
            scripts: document.scripts.length,
            headings: {
                h1: document.querySelectorAll('h1').length,
                h2: document.querySelectorAll('h2').length,
                h3: document.querySelectorAll('h3').length
            }
        }
    }

    const getHtmlSnippet = () => {
        // Get a meaningful HTML snippet for analysis
        const head = document.head.innerHTML.slice(0, 1000)
        const body = document.body.innerHTML.slice(0, 2000)
        return `<head>${head}</head><body>${body}</body>`
    }

    const analyzeWithAI = async (info) => {
        try {
            const pageData = {
                title: info.title,
                url: info.url,
                html_snippet: getHtmlSnippet(),
                images_count: info.images,
                links_count: info.links,
                headings: info.headings
            }

            const result = await analyzePageDesign(pageData)

            if (result.success) {
                setSuggestions(result.suggestions || [])
                setAiInsights(result.ai_insights)
            } else {
                setError('AI 分析失败，显示本地分析结果')
                analyzeLocally(info)
            }
        } catch (err) {
            console.error('AI Analysis error:', err)
            setError(`AI 服务不可用: ${err.message}`)
            analyzeLocally(info)
        } finally {
            setAnalyzing(false)
        }
    }

    const analyzeLocally = (info) => {
        const suggestionList = []

        if (info.headings.h1 === 0) {
            suggestionList.push({ type: 'warning', category: 'SEO', text: '页面缺少H1标题，建议添加主标题' })
        } else if (info.headings.h1 > 1) {
            suggestionList.push({ type: 'warning', category: 'SEO', text: '页面有多个H1标题，建议只保留一个' })
        } else {
            suggestionList.push({ type: 'success', category: 'SEO', text: 'H1标题设置正确' })
        }

        if (info.images > 0 && info.images < 50) {
            suggestionList.push({ type: 'success', category: 'Performance', text: '图片数量适中' })
        } else if (info.images >= 50) {
            suggestionList.push({ type: 'warning', category: 'Performance', text: '图片较多，建议优化加载性能' })
        }

        if (info.scripts > 20) {
            suggestionList.push({ type: 'warning', category: 'Performance', text: '脚本文件较多，可能影响性能' })
        }

        setSuggestions(suggestionList)
        setAnalyzing(false)
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '380px',
            height: '100vh',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
            zIndex: 2147483647,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideIn 0.3s ease-out'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 600 }}>
                    <span style={{ fontSize: '24px' }}>🐕</span>
                    <span>Corgi Design</span>
                    {apiAvailable && <span style={{ fontSize: '10px', background: '#10b981', padding: '2px 6px', borderRadius: '4px' }}>AI</span>}
                </div>
                <button
                    onClick={onClose}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                {analyzing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '20px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            border: '4px solid rgba(255, 255, 255, 0.1)',
                            borderTopColor: '#667eea',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                            {apiAvailable ? '🤖 AI 正在分析网页设计...' : '正在分析网页结构...'}
                        </p>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ fontSize: '16px', marginBottom: '20px', color: '#fff', fontWeight: 600 }}>📊 分析结果</h3>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '16px',
                                fontSize: '12px',
                                color: '#fca5a5'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* AI Insights Section */}
                        {aiInsights && (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '16px',
                                border: '1px solid rgba(102, 126, 234, 0.3)'
                            }}>
                                <h4 style={{ fontSize: '13px', color: '#a78bfa', marginBottom: '10px', fontWeight: 600 }}>🤖 AI 洞察</h4>
                                <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.9)' }}>{aiInsights}</p>
                            </div>
                        )}

                        {/* Page Info Section */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '13px', color: '#667eea', marginBottom: '12px', fontWeight: 600 }}>页面信息</h4>
                            <InfoItem label="标题" value={pageInfo?.title || '无'} />
                            <InfoItem label="图片数量" value={pageInfo?.images} />
                            <InfoItem label="链接数量" value={pageInfo?.links} />
                            <InfoItem label="标题层级" value={`H1(${pageInfo?.headings.h1}) H2(${pageInfo?.headings.h2}) H3(${pageInfo?.headings.h3})`} />
                        </div>

                        {/* Suggestions Section */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '16px' }}>
                            <h4 style={{ fontSize: '13px', color: '#667eea', marginBottom: '12px', fontWeight: 600 }}>设计建议</h4>
                            {suggestions.length > 0 ? (
                                suggestions.map((s, i) => (
                                    <SuggestionItem key={i} type={s.type} category={s.category} text={s.text} />
                                ))
                            ) : (
                                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>暂无建议</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function InfoItem({ label, value }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '13px'
        }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{label}:</span>
            <span style={{ color: '#fff', maxWidth: '180px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        </div>
    )
}

function SuggestionItem({ type, category, text }) {
    const icon = type === 'warning' ? '⚠️' : type === 'success' ? '✅' : type === 'error' ? '❌' : '💡'
    const categoryColors = {
        'SEO': '#10b981',
        'Performance': '#f59e0b',
        'Accessibility': '#3b82f6',
        'Design': '#8b5cf6'
    }

    return (
        <div style={{
            padding: '10px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '13px',
            lineHeight: 1.5
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span>{icon}</span>
                {category && (
                    <span style={{
                        fontSize: '10px',
                        background: categoryColors[category] || '#6b7280',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 500
                    }}>
                        {category}
                    </span>
                )}
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{text}</span>
        </div>
    )
}

// Content Script Logic
let sidebarRoot = null

function openSidebar() {
    console.log('Opening sidebar...')
    if (document.getElementById('corgi-design-root')) {
        return
    }

    const container = document.createElement('div')
    container.id = 'corgi-design-root'
    document.body.appendChild(container)

    sidebarRoot = ReactDOM.createRoot(container)
    sidebarRoot.render(<Sidebar onClose={closeSidebar} />)
}

function closeSidebar() {
    console.log('Closing sidebar...')
    const container = document.getElementById('corgi-design-root')
    if (container) {
        if (sidebarRoot) {
            sidebarRoot.unmount()
            sidebarRoot = null
        }
        container.remove()
    }
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script收到消息:', request)
    if (request.action === 'openSidebar') {
        openSidebar()
        sendResponse({ success: true })
    } else if (request.action === 'closeSidebar') {
        closeSidebar()
        sendResponse({ success: true })
    }
    return true
})

// Expose globally
window.openSidebar = openSidebar
window.closeSidebar = closeSidebar

console.log('Corgi Design Content Script 已加载')
