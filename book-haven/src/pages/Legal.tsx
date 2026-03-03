import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';

export const Terms = () => (
    <Layout>
        <div className="container py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
                <p>Welcome to BookVault. By accessing our platform, you agree to comply with and be bound by the following terms and conditions of use.</p>

                <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
                <p>The services that BookVault provides to you are subject to the following Terms of Use ("TOU"). BookVault reserves the right to update the TOU at any time without notice to you.</p>

                <h2 className="text-2xl font-semibold text-foreground">2. Description of Services</h2>
                <p>Through its network of Web properties, BookVault provides you with access to a variety of resources, including developer tools, download areas, communication forums and product information.</p>

                <h2 className="text-2xl font-semibold text-foreground">3. User Conduct</h2>
                <p>As a condition of your use of the Services, you will not use the Services for any purpose that is unlawful or prohibited by these terms, conditions, and notices.</p>

                <h2 className="text-2xl font-semibold text-foreground">4. Privacy and Protection of Personal Information</h2>
                <p>See the Privacy Policy disclosures relating to the collection and use of your information.</p>

                <p className="pt-8 text-sm italic">Last updated: February 19, 2026</p>
            </div>
        </div>
    </Layout>
);

export const Privacy = () => (
    <Layout>
        <div className="container py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
                <p>Your privacy is important to us. It is BookVault's policy to respect your privacy regarding any information we may collect from you across our website.</p>

                <h2 className="text-2xl font-semibold text-foreground">Information We Collect</h2>
                <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>

                <h2 className="text-2xl font-semibold text-foreground">Use of Information</h2>
                <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft.</p>

                <h2 className="text-2xl font-semibold text-foreground">Cookies</h2>
                <p>We use cookies to help improve your experience of our website. You can choose to reject cookies through your browser settings.</p>

                <p className="pt-8 text-sm italic">Last updated: February 19, 2026</p>
            </div>
        </div>
    </Layout>
);

export const Refund = () => (
    <Layout>
        <div className="container py-24 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
            <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
                <p>At BookVault, customer satisfaction is our priority. If you are not satisfied with your purchase, we're here to help.</p>

                <h2 className="text-2xl font-semibold text-foreground">Digital Products</h2>
                <p>Once a digital product has been accessed or downloaded, it is generally non-refundable. However, exceptions can be made on a case-by-case basis within 7 days of purchase.</p>

                <h2 className="text-2xl font-semibold text-foreground">Physical Products</h2>
                <p>For any physical shipments, you have 30 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it.</p>

                <h2 className="text-2xl font-semibold text-foreground">Contact Us</h2>
                <p>If you have any questions on how to initiate a refund, please contact us.</p>

                <p className="pt-8 text-sm italic">Last updated: February 19, 2026</p>
            </div>
        </div>
    </Layout>
);
