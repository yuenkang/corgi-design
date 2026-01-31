import './content.css'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

// Sidebar Component
function Sidebar({ onClose }) {
    const [analyzing, setAnalyzing] = useState(true)
    const [pageInfo, setPageInfo] = useState(null)
    const [suggestions, setSuggestions] = useState([])

    useEffect(() => {
        const timer = setTimeout(() => {
            analyzeCurrentPage()
        }, 1500)
        return () => clearTimeout(timer)
    }, [])

    const analyzeCurrentPage = () => {
        const info = {
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
        setPageInfo(info)

        const suggestionList = []
        if (info.headings.h1 === 0) {
            suggestionList.push({ type: 'warning', text: '页面缺少H1标题，建议添加主标题' })
        } else if (info.headings.h1 > 1) {
            suggestionList.push({ type: 'warning', text: '页面有多个H1标题，建议只保留一个' })
        } else {
            suggestionList.push({ type: 'success', text: 'H1标题设置正确' })
        }

        if (info.images > 0 && info.images < 50) {
            suggestionList.push({ type: 'success', text: '图片数量适中' })
        } else if (info.images >= 50) {
            suggestionList.push({ type: 'warning', text: '图片较多，建议优化加载性能' })
        }

        if (info.scripts > 20) {
            suggestionList.push({ type: 'warning', text: '脚本文件较多，可能影响性能' })
        }

        suggestionList.push({ type: 'info', text: 'AI设计分析功能即将上线...' })

        setSuggestions(suggestionList)
        setAnalyzing(false)
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '360px',
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
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>正在分析网页结构...</p>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ fontSize: '16px', marginBottom: '20px', color: '#fff', fontWeight: 600 }}>📊 分析结果</h3>

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
                            {suggestions.map((s, i) => (
                                <SuggestionItem key={i} type={s.type} text={s.text} />
                            ))}
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

function SuggestionItem({ type, text }) {
    const icon = type === 'warning' ? '⚠️' : type === 'success' ? '✅' : '💡'
    return (
        <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '13px', lineHeight: 1.5 }}>
            {icon} {text}
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
