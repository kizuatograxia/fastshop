import axios from 'axios';
import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sicoob API Config
const SICOOB_API_URL = process.env.SICOOB_API_URL || 'https://api.sicoob.com.br';
const SICOOB_AUTH_URL = process.env.SICOOB_AUTH_URL || 'https://auth.sicoob.com.br/auth/realms/cooperado/protocol/openid-connect/token';
const SICOOB_CLIENT_ID = process.env.SICOOB_CLIENT_ID;
const SICOOB_CERT_PATH = process.env.SICOOB_CERT_PATH; // Path to .pfx or .pem
const SICOOB_CERT_PASS = process.env.SICOOB_CERT_PASS; // Password if pfx

let accessToken = null;
let tokenExpiry = null;

// Helper to get HTTPS Agent with Certificate
const getAgent = () => {
    if (!SICOOB_CERT_PATH) return null;

    try {
        const certPath = path.resolve(process.cwd(), SICOOB_CERT_PATH);
        if (!fs.existsSync(certPath)) {
            console.error('Sicoob Cert not found at:', certPath);
            return null;
        }

        const cert = fs.readFileSync(certPath);

        // If .pfx
        if (certPath.endsWith('.pfx')) {
            return new https.Agent({
                pfx: cert,
                passphrase: SICOOB_CERT_PASS,
                rejectUnauthorized: false // Sicoob sometimes has chain issues, but ideally true
            });
        }

        // If .pem (Client only, assuming key is inside or separate... sticking to pfx for simplicity as it's standard A1)
        return new https.Agent({
            pfx: cert,
            passphrase: SICOOB_CERT_PASS
        });
    } catch (e) {
        console.error('Error loading Sicoob Cert:', e);
        return null;
    }
};

const authenticate = async () => {
    if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
        return accessToken;
    }

    if (!SICOOB_CLIENT_ID) {
        console.warn('Sicoob Client ID missing. Mocking Auth.');
        return 'mock-token';
    }

    const agent = getAgent();
    if (!agent) {
        throw new Error('Certificado Digital necessário para autenticação Sicoob.');
    }

    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', SICOOB_CLIENT_ID);
        // Scopes: cob.write cob.read pix.write pix.read
        params.append('scope', 'cob.write cob.read pix.write pix.read');

        const response = await axios.post(SICOOB_AUTH_URL, params, {
            httpsAgent: agent,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        accessToken = response.data.access_token;
        // Expires in... usually 300s
        const expiresIn = response.data.expires_in;
        tokenExpiry = new Date(new Date().getTime() + (expiresIn - 60) * 1000); // Buffer

        return accessToken;
    } catch (error) {
        console.error('Sicoob Auth Error:', error.response?.data || error.message);
        throw error;
    }
};

export const createPixCharge = async (txid, valor, devedor) => {
    // txid: unique string (alphanumeric, 26-35 cahrs)
    // valor: number (float)
    // devedor: { cpf, nome }

    console.log(`Verificando Env do Sicoob Client ID:`, process.env.SICOOB_CLIENT_ID);
    console.log(`Verificando Chave Pix Sicoob:`, process.env.SICOOB_PIX_KEY);

    const token = await authenticate();
    const agent = getAgent();

    const body = {
        calendario: { expiracao: 3600 }, // 1 hour
        devedor: {
            cpf: devedor.cpf.replace(/\D/g, ''),
            nome: devedor.nome
        },
        valor: { original: valor.toFixed(2) },
        chave: process.env.SICOOB_PIX_KEY, // Your Pix Key
        solicitacaoPagador: 'Compra Book-Haven'
    };

    try {
        // PUT /pix/api/v2/cob/{txid}
        const url = `${SICOOB_API_URL}/pix/api/v2/cob/${txid}`;
        const response = await axios.put(url, body, {
            httpsAgent: agent,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Sicoob Pix Create Error:', error.response?.data || error.message);
        throw error;
    }
};

export const checkPixStatus = async (txid) => {
    if (!SICOOB_CLIENT_ID) return { status: 'CONCLUIDA' }; // Mock

    const token = await authenticate();
    const agent = getAgent();

    try {
        const url = `${SICOOB_API_URL}/pix/api/v2/cob/${txid}`;
        const response = await axios.get(url, {
            httpsAgent: agent,
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data; // .status needs to be checked (ATIVA, CONCLUIDA, etc)
    } catch (error) {
        console.error('Sicoob Pix Check Error:', error.response?.data || error.message);
        throw error;
    }
};
