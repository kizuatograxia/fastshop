import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export interface Book {
    id: string;
    title: string;
    author: {
        name: string;
        slug: string;
    };
    price: number;
    salePrice?: number;
    coverImage: string;
    format: string[];
}

export interface CartItem {
    id: string; // Unique ID for cart entry (e.g. bookId-format)
    bookId: string;
    title: string;
    authorName: string;
    price: number;
    coverImageUrl: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (book: Book) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    totalAmount: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const { toast } = useToast();

    // Load from LocalStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('bookhaven_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem('bookhaven_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (book: Book) => {
        setItems(prev => {
            const price = book.salePrice || book.price;
            // Check if item exists (simple check by bookId for now)
            // In a real app, we might distinguish formats
            const existing = prev.find(i => i.bookId === book.id);
            if (existing) {
                toast({ title: "Updated in Cart", description: `Added another copy of ${book.title}` });
                return prev.map(i => i.bookId === book.id ? { ...i, quantity: i.quantity + 1 } : i);
            }

            toast({ title: "Added to Cart", description: `${book.title} is now in your cart.` });
            return [...prev, {
                id: `${book.id}-${Date.now()}`,
                bookId: book.id,
                title: book.title,
                authorName: book.author.name,
                price: price,
                coverImageUrl: book.coverImage,
                quantity: 1
            }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setItems(prev => prev.filter(i => i.id !== itemId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalAmount, itemCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
