"use client";

import React, { useState } from "react";
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Clock,
    Layers,
    Settings,
    Image as ImageIcon,
    ChevronRight,
    ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    available: boolean;
    modifiers: string[];
}

interface Category {
    id: string;
    name: string;
    items: MenuItem[];
}

const INITIAL_CATEGORIES: Category[] = [
    {
        id: "cat-1",
        name: "Appetizers",
        items: [
            { id: "i-1", name: "Garlic Bread", description: "Baguette with garlic butter", price: 4.5, available: true, modifiers: [] },
            { id: "i-2", name: "Nachos", description: "Cheesy nachos with guacamole", price: 8.0, available: true, modifiers: ["extra-cheese"] },
        ]
    },
    {
        id: "cat-2",
        name: "Main Courses",
        items: [
            { id: "i-3", name: "Classic Burger", description: "Beef patty, lettuce, tomato", price: 12.0, available: true, modifiers: ["toppings"] },
            { id: "i-4", name: "Chicken Sandwich", description: "Grilled chicken with aioli", price: 11.5, available: false, modifiers: ["toppings", "side"] },
        ]
    },
    {
        id: "cat-3",
        name: "Desserts",
        items: [
            { id: "i-5", name: "Brownie", description: "Warm chocolate brownie", price: 6.0, available: true, modifiers: ["ice-cream"] },
        ]
    }
];

export default function MenuMakerPage() {
    const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
    const [activeCategory, setActiveCategory] = useState<string>(INITIAL_CATEGORIES[0].id);
    const [searchQuery, setSearchQuery] = useState("");

    const currentCategory = categories.find(c => c.id === activeCategory);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="p-6 border-b bg-white dark:bg-slate-900 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="h-6 w-6 text-primary" />
                        Menu Maker
                    </h1>
                    <p className="text-sm text-muted-foreground">Manage your restaurant menu, categories, and items.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <Clock className="mr-2 h-4 w-4" /> Change Hours
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Categories Sidebar */}
                <div className="w-64 border-r bg-white dark:bg-slate-900 p-4 overflow-y-auto">
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center px-2 py-2 mb-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${activeCategory === cat.id
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                            >
                                <span>{cat.name}</span>
                                <Badge variant="secondary" className="text-[10px]">{cat.items.length}</Badge>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{currentCategory?.name}</h2>
                                <p className="text-slate-500">{currentCategory?.items.length} items in this category</p>
                            </div>
                            <Button variant="outline" size="sm">
                                <Settings className="mr-2 h-4 w-4" /> Edit Category
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {currentCategory?.items.map((item) => (
                                <Card key={item.id} className={`overflow-hidden transition-all hover:shadow-md ${!item.available ? "opacity-60" : ""}`}>
                                    <div className="flex">
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-bold">{item.name}</h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                                    </div>
                                                    <span className="text-lg font-semibold">€{item.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    {!item.available && (
                                                        <Badge variant="destructive">Out of Stock</Badge>
                                                    )}
                                                    {item.modifiers.length > 0 && (
                                                        <Badge variant="secondary">{item.modifiers.length} Modifiers</Badge>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>Mark as Out of Stock</DropdownMenuItem>
                                                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-l">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-slate-300" />
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            <Button variant="dashed" className="h-24 border-2 border-dashed flex flex-col gap-1">
                                <Plus className="h-6 w-6" />
                                <span>Add new item to {currentCategory?.name}</span>
                            </Button>
                        </div>

                        {/* Modifier Groups Section */}
                        <div className="mt-12 pt-8 border-t">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Modifier Groups</h2>
                                    <p className="text-muted-foreground">Create options like "Toppings" or "Size" to link to items.</p>
                                </div>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Create Group
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-4 border-l-4 border-l-blue-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold">Toppings</h4>
                                            <p className="text-xs text-muted-foreground">Lettuce, Tomato, Extra Cheese...</p>
                                        </div>
                                        <Badge>Linked to 4 items</Badge>
                                    </div>
                                </Card>
                                <Card className="p-4 border-l-4 border-l-purple-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold">Size</h4>
                                            <p className="text-xs text-muted-foreground">Small, Medium, Large</p>
                                        </div>
                                        <Badge>Linked to 12 items</Badge>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
