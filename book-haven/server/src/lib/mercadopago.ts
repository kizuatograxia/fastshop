import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });

export const getPayment = async (id: string | number) => {
    const payment = new Payment(client);
    try {
        const result = await payment.get({ id });
        return result;
    } catch (error) {
        console.error('Error getting payment:', error);
        throw error;
    }
};

export const createPaymentPreference = async (
    items: any[],
    payer: { email: string },
    external_reference: string
) => {
    const preference = new Preference(client);

    try {
        const body = {
            items,
            payer,
            back_urls: {
                success: `${process.env.API_URL}/api/payment/success`,
                pending: `${process.env.API_URL}/api/payment/pending`,
                failure: `${process.env.API_URL}/api/payment/failure`,
            },
            auto_return: 'approved' as 'approved',
            external_reference,
            notification_url: `${process.env.API_URL}/api/webhook/payment`,
        };

        const result = await preference.create({ body });

        return result;
    } catch (error) {
        console.error('Error creating preference:', error);
        throw error;
    }
};
