import axios from 'axios';
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
