import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, Layers, Star, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { to: "/sorteios", icon: Trophy, label: "Sorteios" },
    { to: "/nfts", icon: Layers, label: "NFTs" },
    { to: "/", icon: Home, label: "Início", center: true },
    { to: "/winners", icon: Star, label: "Ganhadores" },
    { to: "/como-funciona", icon: Menu, label: "Menu" },
];

const MobileBottomNav: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="mobile-bottom-nav" aria-label="Navegação principal">
            {navItems.map(({ to, icon: Icon, label, center }) => {
                const isActive =
                    to === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(to);

                if (center) {
                    return (
                        <Link key={to} to={to} className="mobile-nav-center-item" aria-current={isActive ? "page" : undefined}>
                            <span className={cn("mobile-nav-center-bubble", isActive && "active")}>
                                <Icon className="mobile-nav-center-icon" strokeWidth={isActive ? 2.5 : 1.8} />
                            </span>
                            <span className={cn("mobile-nav-label", isActive && "active-label")}>{label}</span>
                        </Link>
                    );
                }

                return (
                    <Link key={to} to={to} className={cn("mobile-nav-item", isActive && "active")} aria-current={isActive ? "page" : undefined}>
                        <Icon className="mobile-nav-icon" strokeWidth={isActive ? 2.5 : 1.8} />
                        <span className={cn("mobile-nav-label", isActive && "active-label")}>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default MobileBottomNav;
