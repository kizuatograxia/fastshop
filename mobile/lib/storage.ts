import * as SecureStore from 'expo-secure-store';

/**
 * In-memory token cache — populated from SecureStore on app start by AuthProvider.
 * The api.ts needs synchronous access to the token, so we keep a runtime copy here.
 */
let _token: string | null = null;
let _adminKey: string | null = null;

// Simple in-memory reviews fallback (no localStorage in React Native)
let _reviews: any[] = [];

export const storage = {
    // Token
    getToken: () => _token,
    setToken: (token: string) => { _token = token; },
    removeToken: () => { _token = null; },

    // Admin key
    getAdminKey: () => _adminKey,
    setAdminKey: (key: string) => { _adminKey = key; },
    removeAdminKey: () => { _adminKey = null; },

    // Generic persistence (delegates to SecureStore or memory)
    getItem: (key: string) => {
        // Since we need synchronous access in some places, we'll need to handle async elsewhere
        // But for WalletProvider, we'll try to use a simple approach
        return null; // This is a placeholder, usually we'd use a synchronized cache
    },
    setItem: (key: string, value: string) => {
        SecureStore.setItemAsync(key, value).catch(() => { });
    },

    // Reviews (in-memory fallback — fine for mobile)
    getReviews: () => _reviews,
    setReviews: (reviews: any[]) => { _reviews = reviews; },

    // User helpers (not used by AuthProvider, but kept for compat)
    getUser: () => null,
    setUser: (_: any) => { },
    removeUser: () => { },
    clearAll: () => {
        _token = null;
        _adminKey = null;
        _reviews = [];
    },

    /**
     * Call this from AuthProvider after signIn to sync the token into storage
     * so that api.ts request() can read it synchronously.
     */
    syncToken: async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');
            _token = token;
        } catch { /* ignore */ }
    },
};
