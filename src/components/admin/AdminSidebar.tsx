import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
    LayoutDashboard, 
    Ticket, 
    Users, 
    Settings, 
    LogOut,
    PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
    currentView: string;
    onViewChange: (view: any) => void;
    onLogout: () => void;
}

export function AdminSidebar({ currentView, onViewChange, onLogout }: AdminSidebarProps) {
    return (
        <Sidebar>
            <SidebarHeader className="p-4 border-b border-white/5">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Admin Panel
                </h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton 
                                    isActive={currentView === 'dashboard'} 
                                    onClick={() => onViewChange('dashboard')}
                                    tooltip="Dashboard"
                                >
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton 
                                    isActive={currentView === 'create'} 
                                    onClick={() => onViewChange('create')}
                                    tooltip="Criar Sorteio"
                                >
                                    <PlusCircle />
                                    <span>Criar Sorteio</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton 
                                    isActive={currentView === 'raffles'} 
                                    onClick={() => onViewChange('raffles')}
                                    tooltip="Meus Sorteios"
                                >
                                    <Ticket />
                                    <span>Meus Sorteios</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                
                <SidebarGroup>
                    <SidebarGroupLabel>Gerenciamento</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                             <SidebarMenuItem>
                                <SidebarMenuButton 
                                    isActive={currentView === 'participants'} 
                                    onClick={() => onViewChange('participants')}
                                    tooltip="Participantes"
                                >
                                    <Users />
                                    <span>Participantes Global</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton 
                                    isActive={currentView === 'settings'} 
                                    onClick={() => onViewChange('settings')}
                                    tooltip="Configurações"
                                >
                                    <Settings />
                                    <span>Configurações</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t border-white/5">
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/10" onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
