import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import tunnelRoutes from './routes/tunnelRoutes';
import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tunnel', tunnelRoutes); // Mount Tunnel Routes
app.use('/api', apiRoutes);

// Serve Frontend (Vite Build)
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// SPA Catch-all (Must be last)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Health Check (Moved up or redundant if * catches all, but specialized route takes precedence)
app.get('/health', (req, res) => {
    res.json({ message: 'Book Haven API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
