import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Hero from "@/components/Hero";
import CategoryNav from "@/components/CategoryNav";
import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/contexts/CartContext";
import { products } from "@/data/products";

const Index: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ofertas");

  const filteredProducts =
    activeCategory === "ofertas"
      ? products
      : products.filter((p) => p.categoria === activeCategory);

  console.log('Active Category:', activeCategory);
  console.log('Filtered Products:', filteredProducts);

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          cartCount={0} // Placeholder, CartDrawer uses context
          onCartClick={() => setCartOpen(true)}
        />

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

        <CategoryNav
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <main>
          <Hero />
          <ProductGrid products={filteredProducts} />
        </main>

        <footer className="border-t border-border py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gradient font-bold text-xl mb-2">TechFlow 621</p>
            <p className="text-sm text-muted-foreground">
              © 2026 TechFlow. Tecnologia de ponta para sua missão.
            </p>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
};

export default Index;
