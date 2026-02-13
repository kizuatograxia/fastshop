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
    PlusCircle,
    MessageSquare,
    Zap,
} from "lucide-react";

type ViewMode = 'dashboard' | 'create' | 'participants' | 'raffles' | 'settings' | 'details' | 'reviews';

interface AdminSidebarProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
    onLogout: () => void;
    pendingReviews?: number;
}

const mainMenu = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "raffles" as const, label: "Sorteios", icon: Ticket },
    { id: "create" as const, label: "Novo Sorteio", icon: PlusCircle },
];

const managementMenu = [
    { id: "participants" as const, label: "Participantes", icon: Users },
    { id: "reviews" as const, label: "Depoimentos", icon: MessageSquare },
    { id: "settings" as const, label: "Configurações", icon: Settings },
];

export function AdminSidebar({ currentView, onViewChange, onLogout, pendingReviews = 0 }: AdminSidebarProps) {
    // "details" view should highlight "raffles" in sidebar
    const activeView = currentView === 'details' ? 'raffles' : currentView;

    return (
        <Sidebar className="border-r border-sidebar-border">
            <SidebarHeader className="p-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center ring-1 ring-primary/30">
                        <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-sidebar-foreground">Admin Panel</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Gerenciamento</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-4">
                        Menu Principal
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainMenu.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        isActive={activeView === item.id}
                                        onClick={() => onViewChange(item.id)}
                                        tooltip={item.label}
                                        className="transition-all duration-200"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-4">
                        Gerenciamento
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {managementMenu.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        isActive={activeView === item.id}
                                        onClick={() => onViewChange(item.id)}
                                        tooltip={item.label}
                                        className="transition-all duration-200"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                        {item.id === "reviews" && pendingReviews > 0 && (
                                            <span className="ml-auto text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full h-5 min-w-5 flex items-center justify-center px-1.5 animate-pulse">
                                                {pendingReviews}
                                            </span>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-2 border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={onLogout}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sair</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
