import React from "react";
import { X, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/products";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeCategory,
  onCategoryChange,
}) => {
  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-[110] transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-primary">
            <span className="font-bold text-lg text-primary-foreground">
              MENU 621
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20"
              aria-label="Fechar menu"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-4 ${activeCategory === category.id
                  ? "bg-secondary border-primary text-primary"
                  : "border-transparent text-foreground hover:bg-secondary/50 hover:border-primary/50"
                  }`}
              >
                <span className="text-xl">{category.emoji}</span>
                <span className="font-medium">{category.nome}</span>
              </button>
            ))}

            <div className="my-4 mx-4 border-t border-border" />

            <button
              onClick={() => {
                const user = localStorage.getItem("user");
                if (!user) {
                  window.location.href = "/login";
                } else {
                  // Optional: Add feedback or navigation for logged in users
                  // For now, we can show a simple message or navigation to a profile placeholder
                  const userData = JSON.parse(user);
                  alert(`Você já está conectado como ${userData.email}`);
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground hover:bg-secondary/50 hover:border-l-4 hover:border-primary/50 transition-all border-l-4 border-transparent"
            >
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Minha Conta</span>
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground hover:bg-secondary/50 hover:border-l-4 hover:border-primary/50 transition-all border-l-4 border-transparent">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Meus Pedidos</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
