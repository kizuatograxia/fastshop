import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';

const faqs = [
    {
        question: "How do I access my purchased books?",
        answer: "Once your payment is confirmed, your books will appear immediately in your 'My Library' section. You can read them directly in your browser using our built-in reader."
    },
    {
        question: "What formats are available for the eBooks?",
        answer: "Most of our books are available in high-quality PDF and ePub formats. Our online reader supports all formats seamlessly."
    },
    {
        question: "Can I download books for offline reading?",
        answer: "Yes, once you've purchased a book, you can download the file from your library to any of your devices for offline use."
    },
    {
        question: "I'm an author. How can I publish my work on BookVault?",
        answer: "We love supporting independent authors! Visit our 'Publish With Us' page to learn about our distribution program and royalities."
    },
    {
        question: "What is your refund policy?",
        answer: "Since digital products are delivered immediately, we generally don't offer refunds. However, if you experience technical issues, please contact our support team."
    },
    {
        question: "Is my payment secure?",
        answer: "Absolutely. we use enterprise-grade encryption and partner with world-leading payment providers like Mercado Pago to ensure your data is always safe."
    }
];

const FAQ = () => {
    return (
        <Layout>
            <div className="container py-24 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <Badge variant="secondary" className="mb-4">FAQ</Badge>
                    <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
                    <p className="text-muted-foreground text-lg">
                        Find answers to common questions about BookVault services and features.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left font-semibold">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>

                <div className="mt-20 p-8 bg-secondary/30 rounded-2xl text-center">
                    <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                    <p className="text-muted-foreground mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                    <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                        Contact Support
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default FAQ;
