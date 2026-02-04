/**
 * API Service for Corgi Design
 * Handles communication with the Python backend
 */

// Use Vite environment variable, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Analyze page design using the backend API
 * @param {Object} pageData - Page information to analyze
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzePageDesign(pageData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pageData),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Check if the backend API is available
 * @returns {Promise<boolean>}
 */
export async function checkApiHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        return response.ok;
    } catch {
        return false;
    }
}

export default {
    analyzePageDesign,
    checkApiHealth,
};
