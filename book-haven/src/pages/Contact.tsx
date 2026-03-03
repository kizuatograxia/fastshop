import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const Contact = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast({
                title: "Message Sent!",
                description: "We'll get back to you as soon as possible.",
            });
        }, 1500);
    };

    return (
        <Layout>
            <div className="container py-24">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
                            <p className="text-muted-foreground text-lg mb-10">
                                Have questions about our digital library? We're here to help. Reach out to our support team.
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Email Us</h3>
                                        <p className="text-muted-foreground">support@bookvault.site</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Phone className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Call Us</h3>
                                        <p className="text-muted-foreground">+1 (555) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Visit Our HQ</h3>
                                        <p className="text-muted-foreground">123 Digital Way, San Francisco, CA 94103</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-card p-8 rounded-2xl border border-border shadow-sm"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" placeholder="John" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" placeholder="Doe" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="john@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" placeholder="How can we help?" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Your message..." className="min-h-[150px]" required />
                                </div>
                                <Button type="submit" className="w-full gap-2" disabled={loading}>
                                    {loading ? "Sending..." : "Send Message"}
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;
