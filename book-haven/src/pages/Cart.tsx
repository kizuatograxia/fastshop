import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useState } from 'react';

const Cart = () => {
    const { items, removeFromCart, totalAmount, clearCart } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const { toast } = useToast();

    const handleApplyCoupon = () => {
        if (!couponCode) return;
        toast({
            title: "Coupon Applied",
            description: `Code ${couponCode} applied successfully! (Simulated)`,
        });
        setCouponCode('');
    };

    if (items.length === 0) {
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
                        {items.length} items
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                <ScrollArea className="h-[calc(100vh-300px)] min-h-[400px]">
                                    <div className="divide-y">
                                        {items.map((item) => (
                                            <div key={item.id} className="p-6 flex gap-6 hover:bg-gray-50/50 transition-colors group">
                                                {/* Book Cover */}
                                                <div className="relative aspect-[2/3] w-24 rounded-md overflow-hidden shadow-sm flex-shrink-0 bg-secondary">
                                                    <img
                                                        src={item.coverImageUrl || 'https://placehold.co/100x150'}
                                                        alt={item.title}
                                                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-semibold text-lg text-foreground mb-1 leading-tight">
                                                                    <Link to={`/book/${item.bookId}`} className="hover:text-primary transition-colors">
                                                                        {item.title}
                                                                    </Link>
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground mb-2">
                                                                    by {item.authorName || 'Unknown Author'}
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
                                                            <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                                                            <Separator orientation="vertical" className="h-4" />
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2"
                                                                onClick={() => removeFromCart(item.id)}
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
                                            <span className="font-medium">${totalAmount.toFixed(2)}</span>
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
                                            <span className="text-2xl font-bold block">${totalAmount.toFixed(2)}</span>
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
