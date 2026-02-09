import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, Sparkles, User, LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import NotificationList from "@/components/NotificationList";
import { Bell } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  onWalletClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onWalletClick }) => {
  const { getTotalNFTs } = useWallet();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const totalNFTs = getTotalNFTs();
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-4">
            <Button
              variant="icon"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

<<<<<<< HEAD
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
=======
            <Link to="/" className="flex items-center gap-2">
>>>>>>> 4293a3d32e5ce779da54bd85efd1798c1d982925
              <div className="relative">
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary animate-glow-pulse" />
              </div>
              <span className="text-2xl md:text-3xl font-black text-gradient">
                MundoPix
              </span>
              <span className="hidden sm:inline text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                BETA
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <Link to="/sorteios" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Sorteios
              </Link>
              <Link to="/nfts" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Marketplace NFTs
              </Link>
              <Link to="/winners" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Ganhadores
              </Link>
              <Link to="/como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Como Funciona
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">

            {/* Notification Bell */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-2 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse border border-background"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2 font-medium border-b text-sm mb-1">Notificações</div>
                  <NotificationList onUnreadCountChange={setUnreadNotifications} />
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="icon"
              size="icon"
              onClick={onWalletClick}
              className="relative"
              aria-label="Abrir carrinho"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalNFTs > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-fade-in">
                  {totalNFTs}
                </span>
              )}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.picture} alt={user?.name || "User"} />
                      <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    {user?.walletAddress && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Minha Conta
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
