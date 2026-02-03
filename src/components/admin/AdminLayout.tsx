import React from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Separator } from "@/components/ui/separator";

interface AdminLayoutProps {
    children: React.ReactNode;
    currentView: string;
    onViewChange: (view: any) => void;
    onLogout: () => void;
}

export function AdminLayout({ children, currentView, onViewChange, onLogout }: AdminLayoutProps) {
    return (
        <SidebarProvider>
            <AdminSidebar currentView={currentView} onViewChange={onViewChange} onLogout={onLogout} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/5 bg-background/50 backdrop-blur-xl px-4 sticky top-0 z-10">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
                    <div className="flex-1">
                        <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {currentView === 'dashboard' && 'Visão Geral'}
                            {currentView === 'create' && 'Novo Sorteio'}
                            {currentView === 'raffles' && 'Gerenciar Sorteios'}
                            {currentView === 'participants' && 'Participantes'}
                            {currentView === 'settings' && 'Configurações'}
                        </h1>
                    </div>
                </header>
                <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full animate-fade-in">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
