import fetch from 'node-fetch';

const MELHOR_ENVIO_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYjQ1ZWE2YzIzZTY5NmU1YTNkNTk5ZTkwN2RkNTE1YWJmNDQwMDE2ZWNiMjBhY2U4Y2ZlYTMzOWI1MGVjNGU4ZWFiZTRkMWJiOTQ4MjA4MzkiLCJpYXQiOjE3NzE0MzczNTcuMTA2NzcyLCJuYmYiOjE3NzE0MzczNTcuMTA2Nzc0LCJleHAiOjE4MDI5NzMzNTcuMDk2MzE1LCJzdWIiOiJhMTFjN2MyZC04MTMyLTQxMGMtOWRjZS1iNzNmOTZhZjMzYjIiLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.ypG4-CfEmTgTDJGfTuwSptiHrb-FZAVw1KfEAN2ED-HBDlOEy8PRNSm0RKTgioX-llBMvJHgZWkK2C6QM0MKDzGGbSUz-nLyTXR2J1z4EGLASTmskgYXGGskrDiZZ_n7i009bt8sWHChq8t4lmxn2aGPnDhHduWjPbk_9G4487wPkk4WLySAvwW9tLPAwTJEgFWzS1CZ4Q_UDX2L2o7Ef113aRCVZl37Q-e0UFzGmkM_6Gu6JTtk7oAEYYch-Sm6-eiwSZ_vuhfaTj8b9AoP7kqA3augduen1RKELZsxWREwDlDxjHMitvq0f4FToHp8-kIzmUNGxAKY3EMwxfdpRWEIOiHlVgK30a8vHyI9pWtVYS2sSJzKWSoq4-LMDZUmDgGcEv6bq79uwrdWoyogKEirkhZQZakaiKFV8I1lHdpjaQ9YC9ZN-MR6TEz2Uru_IG9mwKLlrqutx4midQxHqrQUXeTIPbSROxMVKaB4u2WasU-MlbAhsmkmMP3u1UfyqIUgWMa2EK_b8D9IVyVmAKZWAnCJY5TwQo8uuVPS4UTHC-vLIu_EtKOCQYrhfDphy35sKNp5L3t3sMxgqfBbFCGJnEJZyV7R-FyzhTfnfOeTrF_IcFXhBtktZNsRjnwIpV0TsMmazlrZmnZL2m4XtO6g04bnoMk7ScYLhZroRfw";
const MELHOR_ENVIO_URL = "https://melhorenvio.com.br/api/v2/me/shipment/calculate"; // Sandbox: sandbox.melhorenvio.com.br
const CEP_ORIGEM = "01001000"; // Example origin: Sé, SP (User should update this)

export const calculateShipping = async (toCep, items) => {
    try {
        // Map items to Melhor Envio format
        const products = items.map(item => ({
            id: item.id.toString(),
            width: item.width || 11, // min 11cm
            height: item.height || 2, // min 2cm
            length: item.length || 16, // min 16cm
            weight: item.weight || 0.3, // min 0.3kg
            insurance_value: item.price || 10.0,
            quantity: item.quantity || 1
        }));

        const response = await fetch(MELHOR_ENVIO_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
                'User-Agent': 'Aplicação FastShop (contato@fastshop.com)'
            },
            body: JSON.stringify({
                from: {
                    postal_code: CEP_ORIGEM
                },
                to: {
                    postal_code: toCep
                },
                products: products,
                options: {
                    receipt: false,
                    own_hand: false
                },
                services: "3,4" // 3 = .Com, 4 = .Package (Jadlog IDs in ME) - filtering usually done in response
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Melhor Envio Error:', errorText);
            throw new Error(`Melhor Envio API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Filter for Jadlog services (usually IDs 3 and 4, or check company name)
        // Note: data is an array of service options
        const jadlogOptions = data.filter(option =>
            option.company && option.company.name.toLowerCase().includes('jadlog') && !option.error
        ).map(option => ({
            id: option.id,
            name: option.name,
            company: option.company.name,
            price: parseFloat(option.price),
            delivery_time: option.delivery_time,
            currency: option.currency
        }));

        return jadlogOptions;

    } catch (error) {
        console.error('Error calculating shipping:', error);
        throw error;
    }
};
