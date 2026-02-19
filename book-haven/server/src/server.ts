import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
import path from 'path';

// ...
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
// ...
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Book Haven API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
