import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env vars are loaded if this is called independently
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Initialize client lazily to avoid crashes if API key is missing at startup
let resendClient = null;

const getResendClient = () => {
    if (resendClient) return resendClient;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('WARNING: RESEND_API_KEY is not defined in environment variables.');
        return null;
    }

    resendClient = new Resend(apiKey);
    return resendClient;
};

/**
 * Sends an email using Resend
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email content in HTML
 * @param {string} [options.from] - Sender email (defaults to onboarding@resend.dev)
 */
export const sendEmail = async ({ to, subject, html, from = 'onboarding@resend.dev' }) => {
    try {
        const resend = getResendClient();
        if (!resend) {
            throw new Error('E-mail service not configured (missing API Key)');
        }

        const data = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });
        console.log('Email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error: error.message };
    }
};

export default { sendEmail };
