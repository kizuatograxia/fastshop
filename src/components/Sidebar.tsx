import { X, Flame, Smartphone, Tv, Laptop, Wind, WashingMachine, Settings, Package } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Flame, label: "Ofertas do Dia", active: true },
  { icon: Smartphone, label: "Smartphones" },
  { icon: Tv, label: "TVs e Vídeo" },
  { icon: Laptop, label: "Informática" },
  { icon: Wind, label: "Ar e Ventilação" },
  { icon: WashingMachine, label: "Eletrodomésticos" },
];

const accountItems = [
  { icon: Settings, label: "Minha Conta" },
  { icon: Package, label: "Meus Pedidos" },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[999] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-card z-[1000] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        aria-label="Menu lateral"
      >
        {/* Header */}
        <div className="gradient-hero px-5 py-6 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-primary-foreground tracking-wide">
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
          <div className="px-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to="#"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-l-4 ${item.active
                    ? "bg-primary/10 text-primary border-primary"
                    : "text-foreground border-transparent hover:bg-accent hover:text-primary hover:border-primary/50"
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="my-4 mx-4 border-t border-border" />

          <div className="px-3 space-y-1">
            {accountItems.map((item) => (
              <Link
                key={item.label}
                to={item.label === "Minha Conta" ? "/login" : "#"}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground border-l-4 border-transparent hover:bg-accent hover:text-primary hover:border-primary/50 transition-all duration-200"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © 2024 FastShop 621. Todos os direitos reservados.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
