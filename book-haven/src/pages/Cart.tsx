import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, CreditCard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CartItem {
    id: string;
    book: {
        id: string;
        title: string;
        author: {
            name: string;
        } | null;
        authorName?: string; // Fallback if author relation is not standard
        price: number;
        coverImageUrl: string;
    };
    price: number;
}

interface CartState {
    id: string;
    items: CartItem[];
    subtotal: number;
    totalAmount: number;
    orderNumber: string;
}

const Cart = () => {
    const [cart, setCart] = useState<CartState | null>(null);
    const [loading, setLoading] = useState(true);
    const [couponCode, setCouponCode] = useState('');
    const navigate = useNavigate();
    const { toast } = useToast();

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Fallback for non-logged in users (demo mode)
                setCart({
                    id: 'demo-cart',
                    orderNumber: 'DEMO-123',
                    items: [
                        { id: '1', book: { id: 'b1', title: 'The Great Gatsby', authorName: 'F. Scott Fitzgerald', price: 9.99, coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800' }, price: 9.99 },
                        { id: '2', book: { id: 'b2', title: '1984', authorName: 'George Orwell', price: 12.50, coverImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800' }, price: 12.50 },
                    ],
                    subtotal: 22.49,
                    totalAmount: 22.49
                });
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:3000/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setCart(data);
            }
        } catch (error) {
            console.error('Failed to fetch cart', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemoveItem = async (itemId: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Demo remove
            if (cart) {
                const newItems = cart.items.filter(i => i.id !== itemId);
                const newSubtotal = newItems.reduce((acc, item) => acc + Number(item.price), 0);
                setCart({
                    ...cart,
                    items: newItems,
                    subtotal: newSubtotal,
                    totalAmount: newSubtotal
                });
                toast({ description: "Item removed from cart" });
            }
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/cart/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const updatedCart = await response.json();
                setCart(updatedCart);
                toast({ description: "Item removed from cart" });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to remove item" });
        }
    };

    const handleApplyCoupon = () => {
        if (!couponCode) return;
        toast({
            title: "Coupon Applied",
            description: `Code ${couponCode} applied successfully! (Simulated)`,
        });
        setCouponCode('');
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8 min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto p-8 min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-secondary/30 p-6 rounded-full">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">Your cart is empty</h2>
                <p className="text-muted-foreground max-w-md">
                    Looks like you haven't added any books to your cart yet. Explore our collection to find your next great read.
                </p>
                <Link to="/store">
                    <Button size="lg" className="mt-4">
                        Browse Books
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
                        <p className="text-muted-foreground mt-1">Review your items and proceed to checkout</p>
                    </div>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                        {cart.items.length} items
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                <ScrollArea className="h-[calc(100vh-300px)] min-h-[400px]">
                                    <div className="divide-y">
                                        {cart.items.map((item) => (
                                            <div key={item.id} className="p-6 flex gap-6 hover:bg-gray-50/50 transition-colors group">
                                                {/* Book Cover */}
                                                <div className="relative aspect-[2/3] w-24 rounded-md overflow-hidden shadow-sm flex-shrink-0 bg-secondary">
                                                    <img
                                                        src={item.book.coverImageUrl || 'https://placehold.co/100x150'}
                                                        alt={item.book.title}
                                                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-semibold text-lg text-foreground mb-1 leading-tight">
                                                                    <Link to={`/book/${item.book.id}`} className="hover:text-primary transition-colors">
                                                                        {item.book.title}
                                                                    </Link>
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground mb-2">
                                                                    by {item.book.author?.name || item.book.authorName || 'Unknown Author'}
                                                                </p>
                                                                <Badge variant="secondary" className="text-xs font-normal">
                                                                    Digital Edition
                                                                </Badge>
                                                            </div>
                                                            <p className="font-bold text-lg">${Number(item.price).toFixed(2)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm text-muted-foreground">Qty: 1</span>
                                                            <Separator orientation="vertical" className="h-4" />
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2"
                                                                onClick={() => handleRemoveItem(item.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Additional Info / Trust Badges */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                <div className="font-medium text-sm mb-1">Instant Delivery</div>
                                <div className="text-xs text-muted-foreground">Access your books immediately</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                <div className="font-medium text-sm mb-1">Secure Payment</div>
                                <div className="text-xs text-muted-foreground">256-bit SSL Encrypted</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                <div className="font-medium text-sm mb-1">Money Back Guarantee</div>
                                <div className="text-xs text-muted-foreground">30-day return policy</div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <Card className="border-none shadow-lg bg-white">
                                <CardHeader className="bg-gray-50/50 border-b pb-4">
                                    <CardTitle className="text-xl">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    {/* Coupon Input */}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Discount code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="bg-white"
                                        />
                                        <Button variant="outline" onClick={handleApplyCoupon}>Apply</Button>
                                    </div>

                                    <Separator />

                                    {/* Totals */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span className="font-medium">${Number(cart.subtotal).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Discount</span>
                                            <span className="text-green-600 font-medium">-$0.00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tax (Estimated)</span>
                                            <span className="font-medium">$0.00</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between items-end">
                                        <span className="text-lg font-bold">Total</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold block">${Number(cart.totalAmount).toFixed(2)}</span>
                                            <span className="text-xs text-muted-foreground">USD</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex-col gap-3 pt-2 pb-6 px-6">
                                    <Link to="/checkout" className="w-full">
                                        <Button className="w-full h-12 text-lg shadow-md group">
                                            Checkout Now
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                    <div className="flex justify-center gap-2 mt-2 opacity-50">
                                        {/* Payment Icons Placeholder */}
                                        <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                        <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                        <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                        <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground mt-2">
                                        By proceeding, you agree to our Terms of Service
                                    </p>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
