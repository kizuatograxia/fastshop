import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';


import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve Frontend
app.use(express.static(path.join(__dirname, '../../dist')));

// API Routes
app.use('/api', apiRoutes);

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: "ok", mode: "facade" });
});

// Catch-all handler for SPA
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
