import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";

const Checkout = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { items, totalAmount, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        address: '',
        city: '',
        zip: '',
        fullName: '',
        email: '',
        cpf: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setFormData(prev => ({
                    ...prev,
                    fullName: user.name || prev.fullName,
                    email: user.email || prev.email
                }));
            } catch (e) {
                console.error("Error parsing stored user:", e);
            }
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCardData({ ...cardData, [e.target.id]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    paymentMethod: paymentMethod,
                    items: items,
                    amount: totalAmount,
                    customer: formData,
                    cardData: paymentMethod === 'CREDIT_CARD' ? cardData : undefined
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment failed');
            }

            if (paymentMethod === 'PIX' && data.qrCode) {
                setQrCode(data.qrCode);
                setQrCodeBase64(data.qrCodeBase64);
                setStep(3); // Move to Pix Step
                toast({
                    title: "Pix Generated!",
                    description: "Please scan the QR Code to pay.",
                });
                clearCart();
            } else {
                // Success (Credit Card or other final states)
                toast({
                    title: "Order Successful!",
                    description: "Your digital books are now available in your library.",
                });
                navigate('/order/success', { state: { orderId: data.orderId } });
                clearCart();
            }

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Checkout Failed",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Shipping / Customer Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Customer Details</span>
                            {step > 1 && <span className="text-green-500 text-sm">✓</span>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" value={formData.fullName} onChange={handleInputChange} disabled={step > 1} placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} disabled={step > 1} placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF (for Pix/Billing)</Label>
                            <Input id="cpf" value={formData.cpf} onChange={handleInputChange} disabled={step > 1} placeholder="000.000.000-00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Billing Address</Label>
                            <Input id="address" value={formData.address} onChange={handleInputChange} disabled={step > 1} placeholder="123 Street Name" />
                        </div>
                        {step === 1 && (
                            <Button onClick={() => setStep(2)} className="w-full mt-4">Continue to Payment</Button>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Form */}
                {step >= 2 && step < 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-primary/5 text-primary rounded border border-primary/20 text-sm mb-4 flex justify-between">
                                <span className="font-semibold">Total to Pay:</span>
                                <span className="font-bold text-lg">${totalAmount.toFixed(2)}</span>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Method</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={paymentMethod === 'PIX' ? 'default' : 'outline'}
                                        className="flex-1 border-primary"
                                        onClick={() => setPaymentMethod('PIX')}
                                    >
                                        Pix (Instant)
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 opacity-50 cursor-not-allowed"
                                        disabled
                                    >
                                        Card <span className="ml-1 text-[10px] bg-gray-200 px-1 rounded text-gray-600">Soon</span>
                                    </Button>
                                </div>
                            </div>

                            {paymentMethod === 'CREDIT_CARD' && (
                                <div className="space-y-3 pt-4 border-t animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="number">Card Number</Label>
                                        <Input id="number" value={cardData.number} onChange={handleCardChange} placeholder="0000 0000 0000 0000" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="expiry">Expiry</Label>
                                            <Input id="expiry" value={cardData.expiry} onChange={handleCardChange} placeholder="MM/YY" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input id="cvv" value={cardData.cvv} onChange={handleCardChange} placeholder="123" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold" onClick={handlePlaceOrder} disabled={loading}>
                                {loading ? 'Processing...' : paymentMethod === 'PIX' ? 'Generate Pix Code' : `Pay $${totalAmount.toFixed(2)} Now`}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Pix Display Step */}
                {step === 3 && qrCodeBase64 && (
                    <Card className="border-green-500 border-2">
                        <CardHeader>
                            <CardTitle className="text-green-600">Scan to Pay</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <img src={`data:image/png;base64,${qrCodeBase64}`} alt="Pix QRCode" className="w-48 h-48" />
                            <Input readOnly value={qrCode || ''} className="text-xs bg-gray-50" />
                            <p className="text-sm text-center text-muted-foreground">
                                Open your bank app and scan the code above.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" onClick={() => navigate('/order/success')}>
                                I have paid
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Checkout;
