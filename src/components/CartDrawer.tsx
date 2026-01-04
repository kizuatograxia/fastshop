import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-md border-l border-border bg-card">
                <SheetHeader className="border-b border-border pb-6">
                    <SheetTitle className="flex items-center gap-2 text-2xl font-bold">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                        Carrinho ({items.length})
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                        <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-medium">Seu carrinho está vazio</p>
                            <p className="text-sm text-muted-foreground">
                                Adicione alguns equipamentos tecnológicos.
                            </p>
                        </div>
                        <Button onClick={onClose} variant="outline" className="mt-4">
                            Continuar Comprando
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <ScrollArea className="flex-1 -mx-6 px-6 py-4">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 p-4 bg-secondary/20 rounded-lg border border-border/50"
                                    >
                                        <div className="h-20 w-20 rounded-md overflow-hidden bg-background">
                                            <img
                                                src={item.imagem}
                                                alt={item.nome}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h4 className="font-medium text-sm line-clamp-2">
                                                {item.nome}
                                            </h4>
                                            <p className="text-sm font-bold text-primary">
                                                R$ {item.preco.toFixed(2)}
                                            </p>

                                            <div className="flex items-center gap-2 mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm w-4 text-center">
                                                    {item.quantidade}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 ml-auto text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="border-t border-border pt-6 mt-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-xl font-bold">
                                    R$ {totalPrice.toFixed(2)}
                                </span>
                            </div>
                            <Button className="w-full shadow-glow" size="lg" asChild>
                                <Link to="/checkout">
                                    Finalizar Compra
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
