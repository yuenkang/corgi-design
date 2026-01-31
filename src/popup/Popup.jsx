import { useState } from 'react'

export default function Popup() {
    const [loading, setLoading] = useState(false)

    const handleAnalyze = async () => {
        setLoading(true)

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

            if (!tab || !tab.id) {
                alert('无法获取当前页面')
                return
            }

            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                alert('无法在浏览器内部页面使用此功能')
                return
            }

            // 注入content script
            try {
                await chrome.scripting.insertCSS({
                    target: { tabId: tab.id },
                    files: ['content/content.css']
                })
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content/content.js']
                })
            } catch (e) {
                console.log('Script may already be injected:', e)
            }

            await new Promise(resolve => setTimeout(resolve, 100))

            chrome.tabs.sendMessage(tab.id, { action: 'openSidebar' })
            window.close()
        } catch (error) {
            console.error('Error:', error)
            alert('发生错误: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-[280px] min-h-[320px] bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
            <div className="flex flex-col items-center p-8 text-center">
                {/* Logo */}
                <div className="w-[72px] h-[72px] mb-4 rounded-2xl overflow-hidden shadow-lg bg-white/10">
                    <img
                        src="../icons/icon128.png"
                        alt="Corgi Design"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                    Corgi Design
                </h1>

                {/* Description */}
                <p className="text-sm leading-relaxed opacity-90 mb-6">
                    AI驱动的网页设计助手
                    <br />
                    智能分析网页结构，一键生成设计建议
                </p>

                {/* Analyze Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-accent-500 to-accent-600 
                     text-white rounded-xl font-semibold text-[15px]
                     shadow-lg shadow-accent-500/40
                     hover:shadow-xl hover:shadow-accent-500/50 hover:-translate-y-0.5
                     active:translate-y-0
                     transition-all duration-200
                     disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            分析中...
                        </span>
                    ) : (
                        '🔍 开始分析'
                    )}
                </button>

                {/* Version */}
                <p className="mt-6 text-xs opacity-50">Version 1.0.0</p>
            </div>
        </div>
    )
}
