import { LayoutDashboard, Users, Scissors, Calendar, CreditCard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Prestations", url: "/prestations", icon: Scissors },
  { title: "Rendez-vous", url: "/rendez-vous", icon: Calendar },
  { title: "Paiements", url: "/paiements", icon: CreditCard },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="p-6 pb-2">
        <h1 className="font-display text-2xl font-bold text-primary tracking-tight">
          ✿ Mon Salon
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Gestion de salon de coiffure</p>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-primary font-semibold"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
