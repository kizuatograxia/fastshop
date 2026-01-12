import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { OAuth2Client } from 'google-auth-library';

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// In-memory data store
const users = [];
const wallets = {}; // userId -> [ownedNFTs]

// Helper to find user
const findUser = (email) => users.find(u => u.email === email);

// Routes

// Register
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    if (findUser(email)) {
        return res.status(400).json({ message: 'Usuário já existe' });
    }

    const newUser = { id: Date.now(), email, password };
    users.push(newUser);
    wallets[newUser.id] = []; // Init wallet

    console.log('User registered:', email);
    res.json({ message: 'Usuário criado com sucesso', user: { id: newUser.id, email: newUser.email } });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = findUser(email);

    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    console.log('User logged in:', email);
    res.json({ message: 'Login realizado', user: { id: user.id, email: user.email } });
});

// Google Login
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '209517161514-fvf6rka4abj5b1lslgflln48eghhekmc.apps.googleusercontent.com');

app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    console.log('Backend: Received Google auth request');
    try {
        console.log('Backend: Verifying token...');
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID || '209517161514-fvf6rka4abj5b1lslgflln48eghhekmc.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        console.log('Backend: Token verified. Email:', email);

        let user = findUser(email);
        if (!user) {
            console.log('Backend: User not found, registering new user.');
            // Create new user for Google login
            user = { id: Date.now(), email, password: 'GOOGLE_AUTH_USER' };
            users.push(user);
            wallets[user.id] = [];
        }

        console.log('Backend: User logged in via Google:', email);
        res.json({ message: 'Login realizado com Google', user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error('Backend: Google Auth Error:', error);
        res.status(401).json({ message: 'Falha na autenticação com Google', error: error.message });
    }
});

// Get Wallet
app.get('/api/wallet', (req, res) => {
    const userId = parseInt(req.query.userId);
    if (!userId) return res.status(400).json({ message: 'UserId required' });

    const wallet = wallets[userId] || [];
    res.json(wallet);
});

// Add to Wallet (Buy NFT)
app.post('/api/wallet', (req, res) => {
    const { userId, nft } = req.body;
    if (!userId || !nft) return res.status(400).json({ message: 'UserId and nft required' });

    if (!wallets[userId]) wallets[userId] = [];

    const existingItem = wallets[userId].find(item => item.id === nft.id);
    if (existingItem) {
        existingItem.quantidade += 1;
    } else {
        wallets[userId].push({ ...nft, quantidade: 1 });
    }

    res.json(wallets[userId]);
});

// Remove from Wallet (Use NFT for raffle or burn)
app.post('/api/wallet/remove', (req, res) => {
    const { userId, nftId, quantity } = req.body;
    const qty = quantity || 1;

    if (!userId || !nftId) return res.status(400).json({ message: 'UserId and nftId required' });

    if (!wallets[userId]) return res.json([]);

    const existingItem = wallets[userId].find(item => item.id === nftId);
    if (existingItem) {
        if (existingItem.quantidade <= qty) {
            wallets[userId] = wallets[userId].filter(item => item.id !== nftId);
        } else {
            existingItem.quantidade -= qty;
        }
    }

    res.json(wallets[userId]);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
