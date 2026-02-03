// Background Service Worker - Corgi Design
console.log('Corgi Design Background Service Worker 已启动')

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('扩展已安装')
        chrome.storage.sync.set({
            installDate: new Date().toISOString()
        })
    } else if (details.reason === 'update') {
        console.log('扩展已更新')
    }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request, '来自:', sender)

    if (request.action === 'getData') {
        chrome.storage.sync.get(null).then(data => {
            sendResponse({ success: true, data })
        })
        return true
    }

    sendResponse({ success: true })
})
