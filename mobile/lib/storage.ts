import * as SecureStore from 'expo-secure-store';

/**
 * In-memory cache — populated from SecureStore on app start.
 * We need synchronous access to many items (token, cart, etc.), 
 * so we keep a runtime copy here.
 */
let _token: string | null = null;
let _adminKey: string | null = null;
let _cache: Record<string, string> = {};
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

    // Generic persistence
    getItem: (key: string) => {
        return _cache[key] || null;
    },
    setItem: (key: string, value: string) => {
        _cache[key] = value;
        SecureStore.setItemAsync(key, value).catch((e) => { 
            console.warn(`Failed to persist key ${key}`, e);
        });
    },
    removeItem: (key: string) => {
        delete _cache[key];
        SecureStore.deleteItemAsync(key).catch(() => { });
    },

    // Reviews (in-memory fallback)
    getReviews: () => _reviews,
    setReviews: (reviews: any[]) => { _reviews = reviews; },

    // User helpers
    getUser: () => {
        const data = _cache['userData'];
        return data ? JSON.parse(data) : null;
    },
    setUser: (user: any) => {
        storage.setItem('userData', JSON.stringify(user));
    },
    removeUser: () => {
        storage.removeItem('userData');
    },

    clearAll: async () => {
        _token = null;
        _adminKey = null;
        _reviews = [];
        const keys = Object.keys(_cache);
        _cache = {};
        
        for (const key of keys) {
            try {
                await SecureStore.deleteItemAsync(key);
            } catch (e) {}
        }
        // Specific keys we always want to ensure are gone
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('userData');
        await SecureStore.deleteItemAsync('fastshop_cart');
    },

    /**
     * Call this during app initialization to hydrate the cache.
     */
    hydrate: async (keys: string[]) => {
        for (const key of keys) {
            try {
                const value = await SecureStore.getItemAsync(key);
                if (value !== null) {
                    _cache[key] = value;
                    if (key === 'authToken') _token = value;
                }
            } catch (e) {
                console.warn(`Failed to hydrate key: ${key}`, e);
            }
        }
    },
};
