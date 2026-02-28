import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';

const router = Router();
const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// Register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
    }

    try {
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Email já cadastrado' });
        }

        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, role',
            [email, password]
        );
        const newUser = result.rows[0];
        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role || 'user' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ message: 'Usuário criado com sucesso', user: newUser, token });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            message: 'Login realizado',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                walletAddress: user.wallet_address,
                profile_complete: user.profile_complete || false,
                role: user.role || 'user',
                cpf: user.cpf,
                address: user.address,
                city: user.city,
                state: user.state,
                cep: user.cep,
                number: user.number,
                district: user.district,
                country: user.country,
                phone: user.phone,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Erro ao realizar login' });
    }
});

// Google Login
router.post('/auth/google', async (req, res) => {
    const { token } = req.body;
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;

    console.log('Backend: Received Google auth request');

    if (!token) {
        return res.status(400).json({ message: 'Token não fornecido' });
    }

    try {
        console.log('Backend: Verifying token...');
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Upsert user
        let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user;

        if (result.rows.length === 0) {
            const insertResult = await pool.query(
                "INSERT INTO users (email, password, name, picture) VALUES ($1, $2, $3, $4) RETURNING *",
                [email, `google_${googleId}`, name, picture]
            );
            user = insertResult.rows[0];
        } else {
            user = result.rows[0];
            // Update name/picture if changed
            await pool.query('UPDATE users SET name = $1, picture = $2 WHERE id = $3', [name, picture, user.id]);
            user.name = name;
            user.picture = picture;
        }

        const sessionToken = jwt.sign({ id: user.id, email: user.email, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '24h' });

        console.log('Backend: User logged in via Google:', email);

        res.json({
            message: 'Login realizado com Google',
            token: sessionToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                walletAddress: user.wallet_address,
                profile_complete: user.profile_complete || false,
                role: user.role || 'user',
                address: user.address,
                city: user.city,
                state: user.state,
                cep: user.cep,
                number: user.number,
                district: user.district,
                country: user.country,
                phone: user.phone,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Backend: Google Auth Error:', error);
        res.status(401).json({ message: 'Falha na autenticação com Google', error: error.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email é obrigatório' });

    try {
        const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.json({ message: 'Se o email estiver cadastrado, você receberá instruções para redefinir a senha.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
            [token, expires, email]
        );

        const frontendUrl = process.env.VITE_FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/login?token=${token}`;

        await sendEmail({
            to: email,
            subject: 'Recuperação de Senha - Mundo Pix',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6366f1; text-align: center;">Recuperação de Senha</h2>
                    <p>Olá,</p>
                    <p>Você solicitou a redefinição de senha para sua conta no <strong>Mundo Pix</strong>.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Redefinir Senha Agora</a>
                    </div>
                    <p>Este link é válido por <strong>1 hora</strong>. Se você não solicitou a troca de senha, pode ignorar este e-mail com segurança.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="color: #666; font-size: 12px; text-align: center;">Mundo Pix - Diversão e Prêmios</p>
                </div>
            `
        });

        res.json({ message: 'Se o email estiver cadastrado, você receberá instruções para redefinir a senha.' });
    } catch (error) {
        console.error('Error in forgot-password:', error);
        res.status(500).json({ message: 'Erro ao processar solicitação' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Dados incompletos' });

    try {
        const result = await pool.query(
            'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Link de redefinição inválido ou expirado' });
        }

        const userId = result.rows[0].id;
        await pool.query(
            'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [password, userId]
        );

        res.json({ success: true, message: 'Senha atualizada com sucesso!' });
    } catch (error) {
        console.error('Error in reset-password:', error);
        res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
});

// Update User Profile
router.put('/users/:id/profile', authenticateToken, async (req, res) => {
    const { id } = req.params;

    // Authorization Check
    if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado: Você só pode editar seu próprio perfil.' });
    }

    const { cpf, birthDate, gender, address, city, cep, country, phone, username, state, number, district } = req.body;

    // Validation
    if (cpf && cpf.replace(/\D/g, '').length !== 11) {
        return res.status(400).json({ message: 'CPF deve ter 11 dígitos' });
    }
    if (cep && cep.replace(/\D/g, '').length !== 8) {
        return res.status(400).json({ message: 'CEP deve ter 8 dígitos' });
    }

    try {
        const result = await pool.query(
            `UPDATE users SET 
                cpf = COALESCE($1, cpf),
                birth_date = COALESCE($2, birth_date),
                gender = COALESCE($3, gender),
                address = COALESCE($4, address),
                city = COALESCE($5, city),
                cep = COALESCE($6, cep),
                country = COALESCE($7, country),
                phone = COALESCE($8, phone),
                username = COALESCE($9, username),
                state = COALESCE($10, state),
                number = COALESCE($11, number),
                district = COALESCE($12, district),
                profile_complete = TRUE
            WHERE id = $13
            RETURNING *`,
            [cpf, birthDate, gender, address, city, cep, country, phone, username, state, number, district, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const user = result.rows[0];
        console.log('User profile updated:', id);
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
});

export default router;
