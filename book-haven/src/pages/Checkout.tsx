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

    useEffect(() => {
        if (items.length === 0) {
            navigate('/store');
            toast({ title: "Cart Empty", description: "Please add books to your cart first." });
        }
    }, [items, navigate, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethod: 'PIX',
                    items: items,
                    amount: totalAmount,
                    customer: formData
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment failed');
            }

            if (data.qrCode) {
                setQrCode(data.qrCode);
                setQrCodeBase64(data.qrCodeBase64);
                setStep(3); // Move to Pix Step
                toast({
                    title: "Pix Generated!",
                    description: "Please scan the QR Code to pay.",
                });
                clearCart(); // Clear cart after generating order
            } else {
                // Fallback success (Credit Card simulation)
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
                            <Input id="fullName" value={formData.fullName} onChange={handleInputChange} disabled={step > 1} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} disabled={step > 1} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF (for Pix)</Label>
                            <Input id="cpf" value={formData.cpf} onChange={handleInputChange} disabled={step > 1} placeholder="000.000.000-00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" value={formData.address} onChange={handleInputChange} disabled={step > 1} />
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
                            <div className="p-4 bg-blue-50 text-blue-800 rounded border border-blue-200 text-sm mb-4">
                                <strong>Total: ${totalAmount.toFixed(2)}</strong>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Method</Label>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="w-full border-primary text-primary bg-primary/10">Pix (Instant)</Button>
                                    {/* <Button variant="outline" className="w-full" disabled>Credit Card</Button> */}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handlePlaceOrder} disabled={loading}>
                                {loading ? 'Generating Pix...' : `Generate Pix Code`}
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
