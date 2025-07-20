// Frontend Configuration
const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:3761/api',

    // Routes
    ROUTES: {
        LOGIN: '/pages/index.html',
        REGISTER: '/pages/register.html',
        DASHBOARD: '/pages/dashboard.html'
    },

    // Local Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'auth_token',
        USER: 'user_data'
    },

    // UI Configuration
    UI: {
        LOADING_TIMEOUT: 5000,
        ERROR_DISPLAY_TIME: 3000
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 