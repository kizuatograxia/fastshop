import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env vars are loaded if this is called independently
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const resend = new Resend(process.env.RESEND_API_KEY);

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
