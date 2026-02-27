import axios from 'axios';
import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to safely get environment variables even if Railway injects keys with spaces
const getEnv = (key) => {
    if (process.env[key] !== undefined) return process.env[key]?.trim();
    const fuzzKey = Object.keys(process.env).find(k => k.trim() === key.trim());
    if (fuzzKey) return process.env[fuzzKey]?.trim();
    return undefined;
};

// Sicoob API Config
const getSicoobConfig = () => ({
    apiUrl: getEnv('SICOOB_API_URL') || 'https://api.sicoob.com.br',
    authUrl: getEnv('SICOOB_AUTH_URL') || 'https://auth.sicoob.com.br/auth/realms/cooperado/protocol/openid-connect/token',
    clientId: getEnv('SICOOB_CLIENT_ID'),
    certPath: getEnv('SICOOB_CERT_PATH'),
    certPass: getEnv('SICOOB_CERT_PASS'),
    pixKey: getEnv('SICOOB_PIX_KEY')
});

let accessToken = null;
let tokenExpiry = null;

// Helper to get HTTPS Agent with Certificate
const getAgent = () => {
    const config = getSicoobConfig();
    if (!config.certPath) return null;

    try {
        const certPath = path.resolve(process.cwd(), config.certPath);
        if (!fs.existsSync(certPath)) {
            console.error('Sicoob Cert not found at:', certPath);
            return null;
        }

        const cert = fs.readFileSync(certPath);

        // If .pfx
        if (certPath.endsWith('.pfx')) {
            return new https.Agent({
                pfx: cert,
                passphrase: config.certPass,
                rejectUnauthorized: false // Sicoob sometimes has chain issues, but ideally true
            });
        }

        // If .pem (Client only, assuming key is inside or separate... sticking to pfx for simplicity as it's standard A1)
        return new https.Agent({
            pfx: cert,
            passphrase: config.certPass
        });
    } catch (e) {
        console.error('Error loading Sicoob Cert:', e);
        return null;
    }
};

const authenticate = async () => {
    const config = getSicoobConfig();

    if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
        return accessToken;
    }

    if (!config.clientId) {
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
        params.append('client_id', config.clientId);
        // Scopes: cob.write cob.read pix.write pix.read
        params.append('scope', 'cob.write cob.read pix.write pix.read');

        const response = await axios.post(config.authUrl, params, {
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

export const createPixCharge = async (txid, valor, devedor, description) => {
    // txid: unique string (alphanumeric, 26-35 cahrs)
    // valor: number (float)
    // devedor: { cpf, nome }
    // description: The generated facade (e.g. Ebook, Curso)

    const config = getSicoobConfig();
    console.log(`Verificando Env do Sicoob Client ID:`, config.clientId);
    console.log(`Verificando Chave Pix Sicoob:`, config.pixKey);

    const token = await authenticate();
    const agent = getAgent();

    const body = {
        calendario: { expiracao: 3600 }, // 1 hour
        devedor: {
            cpf: devedor.cpf.replace(/\D/g, ''),
            nome: devedor.nome
        },
        valor: { original: valor.toFixed(2) },
        chave: config.pixKey ? config.pixKey.replace(/\D/g, '') : '', // Your Pix Key (No punctuation!)
        solicitacaoPagador: description || 'Compra Ebook Digital', // Dynamic facade!
        infoAdicionais: [
            {
                nome: "Cidade",
                valor: "Sao Paulo" // This prevents 'Nao_informado' in some banks/QR parsers
            }
        ]
    };

    try {
        // PUT /pix/api/v2/cob/{txid}
        const url = `${config.apiUrl}/pix/api/v2/cob/${txid}`;
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
    const config = getSicoobConfig();
    if (!config.clientId) return { status: 'CONCLUIDA' }; // Mock

    const token = await authenticate();
    const agent = getAgent();

    try {
        const url = `${config.apiUrl}/pix/api/v2/cob/${txid}`;
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
