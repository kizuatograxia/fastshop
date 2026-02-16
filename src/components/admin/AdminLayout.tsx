import React from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";

type ViewMode = 'dashboard' | 'create' | 'participants' | 'raffles' | 'settings' | 'details' | 'reviews' | 'coupons';

const viewTitles: Record<ViewMode, string> = {
    dashboard: "Visão Geral",
    create: "Novo Sorteio",
    raffles: "Gerenciar Sorteios",
    participants: "Participantes",
    reviews: "Moderação de Depoimentos",
    details: "Detalhes do Sorteio",
    settings: "Configurações",
    coupons: "Gerenciar Cupons",
};

// Breadcrumb parent for sub-views
const viewParent: Partial<Record<ViewMode, { view: ViewMode; label: string }>> = {
    details: { view: "raffles", label: "Sorteios" },
    participants: { view: "raffles", label: "Sorteios" },
    create: { view: "dashboard", label: "Dashboard" },
};

interface AdminLayoutProps {
    children: React.ReactNode;
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
    onLogout: () => void;
    pendingReviews?: number;
}

export function AdminLayout({ children, currentView, onViewChange, onLogout, pendingReviews }: AdminLayoutProps) {
    const parent = viewParent[currentView];

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <AdminSidebar
                    currentView={currentView}
                    onViewChange={onViewChange}
                    onLogout={onLogout}
                    pendingReviews={pendingReviews}
                />
                <SidebarInset className="flex-1">
                    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-card/30 backdrop-blur-xl px-4 sticky top-0 z-10">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-border/40" />
                        <nav className="flex items-center gap-1 text-sm">
                            {parent && (
                                <>
                                    <button
                                        onClick={() => onViewChange(parent.view)}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {parent.label}
                                    </button>
                                    <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                                </>
                            )}
                            <span className="font-semibold text-foreground">
                                {viewTitles[currentView]}
                            </span>
                        </nav>
                    </header>
                    <div className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full animate-fade-in">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
