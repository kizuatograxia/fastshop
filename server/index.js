import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 5050;

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
const carts = {}; // userId -> [items]

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
    carts[newUser.id] = []; // Init cart

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

// Get Cart
app.get('/api/cart', (req, res) => {
    const userId = parseInt(req.query.userId);
    if (!userId) return res.status(400).json({ message: 'UserId required' });

    const cart = carts[userId] || [];
    res.json(cart);
});

// Add to Cart
app.post('/api/cart', (req, res) => {
    const { userId, product } = req.body;
    if (!userId || !product) return res.status(400).json({ message: 'UserId and product required' });

    if (!carts[userId]) carts[userId] = [];

    const existingItem = carts[userId].find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantidade += 1;
    } else {
        carts[userId].push({ ...product, quantidade: 1 });
    }

    res.json(carts[userId]);
});

// Remove/Update Cart
app.delete('/api/cart/:productId', (req, res) => {
    const userId = parseInt(req.query.userId);
    const productId = parseInt(req.params.productId);

    if (!userId) return res.status(400).json({ message: 'UserId required' });

    if (carts[userId]) {
        carts[userId] = carts[userId].filter(item => item.id !== productId);
    }

    res.json(carts[userId] || []);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
