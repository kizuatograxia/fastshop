import { useState, useEffect } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";

interface Product {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
}

// Mock products data
const mockProducts: Product[] = [
  {
    id: 1,
    nome: "iPhone 15 Pro Max 256GB Titanium Blue",
    preco: 8999.99,
    imagem: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    nome: "MacBook Pro 14\" M3 Pro 512GB Space Black",
    preco: 18499.00,
    imagem: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    nome: "Samsung Galaxy S24 Ultra 512GB Titanium",
    preco: 7499.00,
    imagem: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
  },
  {
    id: 4,
    nome: "PlayStation 5 Slim Digital Edition 1TB",
    preco: 3499.00,
    imagem: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
  },
  {
    id: 5,
    nome: "Apple Watch Series 9 GPS 45mm Midnight",
    preco: 3899.00,
    imagem: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop",
  },
  {
    id: 6,
    nome: "AirPods Pro 2ª Geração com MagSafe",
    preco: 1899.00,
    imagem: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop",
  },
  {
    id: 7,
    nome: "Smart TV LG OLED 55\" 4K Gaming",
    preco: 4999.00,
    imagem: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
  },
  {
    id: 8,
    nome: "iPad Pro 12.9\" M2 256GB Wi-Fi Space Gray",
    preco: 10499.00,
    imagem: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
  },
];

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading products
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (product: Product) => {
    setCartCount((prev) => prev + 1);
    toast.success(`${product.nome} adicionado ao carrinho!`, {
      description: "Acesse o carrinho para finalizar sua compra.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Header 
        onMenuClick={() => setSidebarOpen(true)} 
        cartCount={cartCount} 
      />
      
      <main>
        <Hero />
        
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-6 bg-muted rounded w-2/3" />
                    <div className="h-10 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ProductGrid products={products} onAddToCart={handleAddToCart} />
        )}
      </main>

      <footer className="bg-card border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-primary">FastShop</span>
              <span className="text-xs font-medium text-muted-foreground bg-accent/30 px-2 py-0.5 rounded-full">621</span>
            </div>
            <p className="text-sm text-muted-foreground text-center sm:text-right">
              © 2024 FastShop 621. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
