import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import WalletDrawer from "./WalletDrawer";
import { SupportWidget } from "./SupportWidget";

const MainLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");

    return (
        <div className="min-h-screen bg-background">
            <Header
                onMenuClick={() => setIsSidebarOpen(true)}
                onWalletClick={() => setIsWalletOpen(true)}
            />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />
            <WalletDrawer
                isOpen={isWalletOpen}
                onClose={() => setIsWalletOpen(false)}
            />
            <main>
                <Outlet context={{ activeCategory, setActiveCategory }} />
            </main>
            <SupportWidget />
        </div>
    );
};

export default MainLayout;
