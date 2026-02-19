import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Checkout = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        address: '123 Fake St',
        city: 'Springfield',
        zip: '90210',
        cardName: 'Homer Simpson',
        cardNumber: '4242424242424242',
        expDate: '12/30',
        cvv: '123',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    paymentMethod: 'CREDIT_CARD',
                    ...formData
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment failed');
            }

            toast({
                title: "Order Placed Successfully!",
                description: "Your books are on the way.",
            });

            navigate('/order/success', { state: { orderId: data.order.id } });
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

                {/* Shipping Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Shipping Details</span>
                            {step > 1 && <span className="text-green-500 text-sm">✓</span>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" value={formData.address} onChange={handleInputChange} disabled={step > 1} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" value={formData.city} onChange={handleInputChange} disabled={step > 1} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zip">ZIP Code</Label>
                                <Input id="zip" value={formData.zip} onChange={handleInputChange} disabled={step > 1} />
                            </div>
                        </div>
                        {step === 1 && (
                            <Button onClick={() => setStep(2)} className="w-full mt-4">Continue to Payment</Button>
                        )}
                    </CardContent>
                </Card>

                {/* Payment Form */}
                <Card className={step < 2 ? 'opacity-50 pointer-events-none' : ''}>
                    <CardHeader>
                        <CardTitle>Payment Details (Simulated)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-sm mb-4">
                            <strong>Simulated Mode:</strong> Any card details will work. No real charge will be made.
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cardName">Cardholder Name</Label>
                            <Input id="cardName" value={formData.cardName} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input id="cardNumber" value={formData.cardNumber} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expDate">Exp. Date</Label>
                                <Input id="expDate" value={formData.expDate} onChange={handleInputChange} placeholder="MM/YY" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" value={formData.cvv} onChange={handleInputChange} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handlePlaceOrder} disabled={loading}>
                            {loading ? 'Processing...' : `Pay & Complete Order`}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Checkout;
