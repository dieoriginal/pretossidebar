import {
    LayoutGrid,
    ShoppingBag,
    Layers,
    TrendingUp,
    Settings,
    Users,
    BarChart3,
    Megaphone,
    Icon
} from "lucide-react";

export function getMerchantMenuList(pathname: string) {
    return [
        {
            groupLabel: "Operations",
            menus: [
                {
                    href: "/merchant",
                    label: "Dashboard",
                    icon: LayoutGrid,
                    active: pathname === "/merchant"
                },
                {
                    href: "/merchant/orders",
                    label: "Orders",
                    icon: ShoppingBag,
                    active: pathname === "/merchant/orders"
                },
                {
                    href: "/merchant/menu",
                    label: "Menu Maker",
                    icon: Layers,
                    active: pathname === "/merchant/menu"
                }
            ]
        },
        {
            groupLabel: "Marketing",
            menus: [
                {
                    href: "/merchant/marketing/ads",
                    label: "Ads Manager",
                    icon: Megaphone,
                    active: pathname === "/merchant/marketing/ads"
                },
                {
                    href: "/merchant/marketing/promos",
                    label: "Promotions",
                    icon: TrendingUp,
                    active: pathname === "/merchant/marketing/promos"
                }
            ]
        },
        {
            groupLabel: "Business",
            menus: [
                {
                    href: "/merchant/performance",
                    label: "Analytics",
                    icon: BarChart3,
                    active: pathname === "/merchant/performance"
                },
                {
                    href: "/merchant/team",
                    label: "Team",
                    icon: Users,
                    active: pathname === "/merchant/team"
                }
            ]
        },
        {
            groupLabel: "Settings",
            menus: [
                {
                    href: "/merchant/settings",
                    label: "Venue Profile",
                    icon: Settings,
                    active: pathname === "/merchant/settings"
                }
            ]
        }
    ];
}
