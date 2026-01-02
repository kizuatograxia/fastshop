import { Menu, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onMenuClick: () => void;
  cartCount: number;
}

const Header = ({ onMenuClick, cartCount }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Menu Button */}
           <Button
           variant="ghost" 
           size="icon"
           onClick={onMenuClick}
           className=""  
           aria-label="Abrir menu">         
           <Menu className="h-6 w-6" />
          </Button>

          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              FastShop
            </span>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground bg-accent/30 px-2 py-0.5 rounded-full">
              621
            </span>
          </div>

          {/* Search Box - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Buscar equipamento..."
                className="w-full h-11 pl-11 pr-4 bg-secondary/50 border border-border rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="icon"
              size="icon"
              className="hidden sm:flex"
              aria-label="Minha conta"
            >
              <User className="h-5 w-5" />
            </Button>
            
            <Button
              variant="icon"
              size="icon"
              className="relative"
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold rounded-full animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Button>
            
            <span className="hidden sm:inline-block text-sm font-medium text-foreground">
              Carrinho
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Search - Below header on mobile */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar equipamento..."
            className="w-full h-10 pl-11 pr-4 bg-secondary/50 border border-border rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
