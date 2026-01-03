import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const Cart = () => {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (user) {
            loadCart();
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadCart = async () => {
        try {
            if (!user) return;
            const data = await api.getCart(user.id);
            setItems(data);
        } catch (error) {
            console.error("Failed to load cart", error);
            toast.error("Erro ao carregar carrinho");
        } finally {
            setIsLoading(false);
        }
    };

    const total = items.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    const shipping = 40.00; // Mock shipping

    const updateQuantity = async (id: number, delta: number) => {
        // Optimistic update
        const oldItems = [...items];
        const newItems = items.map(item => {
            if (item.id === id) {
                return { ...item, quantidade: Math.max(0, item.quantidade + delta) };
            }
            return item;
        }).filter(item => item.quantidade > 0);

        setItems(newItems);

        toast.info("Atualização de quantidade simulada (requer endpoint PUT no backend)");
    };

    const removeItem = async (id: number) => {
        try {
            await api.removeFromCart(user.id, id);
            setItems(items.filter(item => item.id !== id));
            toast.success("Item removido");
        } catch (error) {
            toast.error("Erro ao remover item");
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header onMenuClick={() => setSidebarOpen(true)} cartCount={0} hideSearch />
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <h2 className="text-xl font-bold mb-4">Faça login para ver seu carrinho</h2>
                    <Button asChild>
                        <Link to="/login">Entrar</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Header onMenuClick={() => setSidebarOpen(true)} cartCount={items.reduce((acc, i) => acc + i.quantidade, 0)} hideSearch />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-display font-bold mb-8">Meu Carrinho</h1>

                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <h2 className="text-xl font-medium mb-4">Seu carrinho está vazio</h2>
                        <p className="text-muted-foreground mb-8">Adicione item para começar suas compras</p>
                        <Button asChild>
                            <Link to="/">Continuar Comprando</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                        <div className="lg:col-span-8">
                            <div className="bg-card rounded-xl border border-border overflow-hidden">
                                <ScrollArea className="h-[calc(100vh-300px)] lg:h-auto lg:max-h-[600px]">
                                    <div className="p-6 space-y-6">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border">
                                                    <img
                                                        src={item.imagem}
                                                        alt={item.nome}
                                                        className="h-full w-full object-cover object-center"
                                                    />
                                                </div>

                                                <div className="flex flex-1 flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium">
                                                            <h3 className="line-clamp-2 pr-4">{item.nome}</h3>
                                                            <p className="ml-4 whitespace-nowrap">R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-1 items-end justify-between text-sm">
                                                        <div className="flex items-center gap-3 border border-border rounded-lg p-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => updateQuantity(item.id, -1)}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="w-4 text-center">{item.quantidade}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive/90"
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Remover
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>

                        <div className="lg:col-span-4 mt-8 lg:mt-0">
                            <div className="bg-card rounded-xl border border-border p-6 space-y-4 sticky top-24">
                                <h2 className="text-lg font-medium">Resumo do Pedido</h2>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Frete</span>
                                        <span>R$ {shipping.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-base font-medium">
                                        <span>Total</span>
                                        <span>R$ {(total + shipping).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <Button className="w-full" size="lg">
                                    Finalizar Compra
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>

                                <Button variant="outline" className="w-full" asChild>
                                    <Link to="/">Continuar Comprando</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cart;
