import axios from 'axios';

const SPEDY_API_URL = process.env.SPEDY_API_URL || 'https://api.spedy.com.br/v1';
const SPEDY_API_KEY = process.env.SPEDY_API_KEY;

export const createInvoice = async (purchaseId, customer, items, totalValue) => {
    if (!SPEDY_API_KEY) {
        console.log('Spedy API Key missing. Mocking Invoice.');
        return {
            status: 'processing',
            id: `mock-nfe-${purchaseId}`,
            url: '#'
        };
    }

    // Map items to Spedy format
    // This is a simplified example. Spedy requires specific NCM, CFOP, etc.
    // For "ghost" or digital goods, usually Service Invoice (NFSe) is used, or Product (NFe) if ebook considered product.
    // Assuming NFSe for simplicity or generic service.

    const body = {
        tomador: {
            cpf: customer.cpf.replace(/\D/g, ''),
            nome: customer.nome,
            email: customer.email,
            endereco: {
                logradouro: customer.address || 'Rua Digital',
                numero: '0',
                bairro: 'Internet',
                codigo_municipio: '3550308', // SP example
                uf: 'SP',
                cep: customer.cep?.replace(/\D/g, '') || '01001000'
            }
        },
        servico: {
            valor: totalValue,
            discriminacao: `Compra de Ativos Digitais (Ref: ${purchaseId})`,
            codigo_servico: '01.01' // Example code
        }
        // ... more fields required really
    };

    try {
        const response = await axios.post(`${SPEDY_API_URL}/nfe`, body, {
            headers: {
                'X-Api-Key': SPEDY_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Spedy Invoice Error:', error.response?.data || error.message);
        // Don't throw, just return error status so purchase can proceed
        return { status: 'error', error: error.message };
    }
};
