import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Menu, X, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  onCartClick: () => void; // Keeping prop name for compatibility, but it opens generic drawer or unused
  onWalletClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onCartClick, onWalletClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { getTotalNFTs } = useWallet();
  const { user } = useAuth();
  const totalNFTs = getTotalNFTs();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="text-2xl">🎰</span>
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary animate-glow-pulse" />
            </div>
            <span className="text-2xl md:text-3xl font-black text-gradient">
              Mundo Pix
            </span>
            <span className="hidden sm:inline text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              BETA
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Buscar sorteios..."
              className="w-full h-11 pl-11 pr-4 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <a href="#sorteios" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Sorteios
            </a>
            <a href="#nfts" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Comprar NFTs
            </a>
            <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Como Funciona
            </a>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {!user ? (
            <Link to="/login">
              <Button variant="ghost" className="font-semibold text-primary">
                Entrar
              </Button>
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/80 rounded-full">
              <User className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium max-w-[100px] truncate">{user.email}</span>
            </div>
          )}

          <Button
            variant="icon"
            size="icon"
            onClick={onWalletClick}
            className="relative"
            aria-label="Abrir carteira"
          >
            <Wallet className="h-5 w-5" />
            {totalNFTs > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-fade-in">
                {totalNFTs}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden pb-4 px-4 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Buscar sorteios..."
            className="w-full h-10 pl-11 pr-4 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
