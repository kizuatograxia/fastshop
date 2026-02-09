import React from "react";
import { X, User, Trophy, Ticket, HelpCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/raffles";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

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
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
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
        className={`fixed top-0 left-0 h-full w-full max-w-xs bg-card border-r border-border z-[110] transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-primary">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary-foreground">
                Mundo Pix
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <p className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Categorias
            </p>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onCategoryChange(category.id);
                  onClose();
                }}
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

            <p className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Menu
            </p>

            <Link
              to="/sorteios"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground hover:bg-secondary/50 hover:border-l-4 hover:border-primary/50 transition-all border-l-4 border-transparent"
            >
              <Ticket className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Sorteios</span>
            </Link>

            <Link
              to="/nfts"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground hover:bg-secondary/50 hover:border-l-4 hover:border-primary/50 transition-all border-l-4 border-transparent"
            >
              <Gift className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Marketplace NFTs</span>
            </Link>

            <Link
              to="/como-funciona"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground hover:bg-secondary/50 hover:border-l-4 hover:border-primary/50 transition-all border-l-4 border-transparent"
            >
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Como Funciona</span>
            </Link>

            <div className="my-4 mx-4 border-t border-border" />

            <p className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Minha Conta
            </p>

            {user ? (
              <>
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-destructive hover:bg-destructive/10 hover:border-l-4 hover:border-destructive transition-all border-l-4 border-transparent"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={onClose}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground hover:bg-secondary/50 hover:border-l-4 hover:border-primary/50 transition-all border-l-4 border-transparent"
              >
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Entrar / Cadastrar</span>
              </Link>
            )}

            {user && (
              <>
                <Link
                  to="/profile"
                  onClick={onClose}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground hover:bg-secondary/50 hover:border-l-4 hover:border-primary/50 transition-all border-l-4 border-transparent"
                >
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Meus Prêmios</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
