"use client";

import React, { useState } from "react";
import {
    Plus,
    TrendingUp,
    Eye,
    MousePointer2,
    Target,
    BarChart2,
    Play,
    Pause,
    Search,
    ArrowUpRight,
    Info,
    DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function AdsManagerPage() {
    const [campaigns, setCampaigns] = useState([
        { id: "c1", name: "Lunch Rush Special", status: "Active", budget: 50, spent: 34.20, clicks: 124, impressions: 4500, roas: 4.2 },
        { id: "c2", name: "Weekend Fan Favorites", status: "Paused", budget: 100, spent: 89.50, clicks: 310, impressions: 12000, roas: 3.8 },
        { id: "c3", name: "Dinner Promotion", status: "Active", budget: 75, spent: 12.10, clicks: 45, impressions: 1800, roas: 5.1 },
    ]);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ads Manager</h1>
                    <p className="text-muted-foreground">Promote your merchant and reach more users in the app.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg" className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-5 w-5" /> Create Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Ad Campaign</DialogTitle>
                            <DialogDescription>
                                Set your budget and bid to get noticed by more customers.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Campaign Name</Label>
                                <Input id="name" placeholder="e.g. Summer Special" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Daily Budget (€)</Label>
                                    <Input id="budget" type="number" placeholder="20.00" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bid">Bid Type</Label>
                                    <select className="w-full p-2 border rounded-md bg-background text-sm">
                                        <option>Automatic (Recommended)</option>
                                        <option>Custom Bid</option>
                                    </select>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg flex gap-3 text-sm border">
                                <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                <p className="text-muted-foreground">
                                    Automatic offer will adjust over time to ensure the best value for your clicks.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button>Launch Campaign</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Performance Widgets */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-900 text-white border-none shadow-xl">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400">Total Ad Spend</CardDescription>
                        <CardTitle className="text-3xl font-bold">€135.80</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-green-400 text-sm">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            <span>15% vs last week</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardDescription>Impressions</CardDescription>
                        <CardTitle className="text-3xl font-bold">18,300</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-blue-500 text-sm">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>Reach +5%</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardDescription>Clicks</CardDescription>
                        <CardTitle className="text-3xl font-bold">479</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-purple-500 text-sm">
                            <MousePointer2 className="h-4 w-4 mr-1" />
                            <span>2.6% CTR</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardDescription>Est. Sales</CardDescription>
                        <CardTitle className="text-3xl font-bold">€520.00</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-green-600 text-sm font-bold">
                            <Target className="h-4 w-4 mr-1" />
                            <span>3.8x ROI</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Campaigns Table Area */}
            <Card className="border-none shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Active Campaigns</CardTitle>
                            <CardDescription>Manage your current ad performance and budgets.</CardDescription>
                        </div>
                        <Tabs defaultValue="all" className="w-[300px]">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="paused">Paused</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {campaigns.map((camp) => (
                            <div key={camp.id} className="p-4 rounded-xl border bg-card hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${camp.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {camp.status === 'Active' ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5 fill-current" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{camp.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={camp.status === 'Active' ? 'default' : 'secondary'} className="text-[10px] uppercase tracking-wider">
                                                    {camp.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">Created 12 days ago</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold">€{camp.budget.toFixed(2)} / day</div>
                                        <div className="text-xs text-muted-foreground">Daily Limit</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4 py-4 border-y border-dashed">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase text-center">Spend</p>
                                        <p className="font-bold text-center">€{camp.spent.toFixed(2)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase text-center">Impr.</p>
                                        <p className="font-bold text-center">{camp.impressions.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase text-center">Clicks</p>
                                        <p className="font-bold text-center">{camp.clicks}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase text-center">ROAS</p>
                                        <p className="font-bold text-center text-green-600">{camp.roas}x</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="flex-1 max-w-sm">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>Budget used</span>
                                            <span>{Math.round((camp.spent / camp.budget) * 100)}%</span>
                                        </div>
                                        <Progress value={(camp.spent / camp.budget) * 100} className="h-2" />
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                        <Button variant="outline" size="sm">View Detailed Report</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Educational Section */}
            <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <BarChart2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold">Optimization Tip</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your "Dinner Promotion" campaign has a 5.1x ROAS. Consider increasing its daily budget by 20% to capture more dinner orders during peak hours.
                        </p>
                        <Button variant="link" className="p-0 h-auto mt-3 text-primary font-bold">
                            View all recommendations <Plus className="ml-1 h-3 w-3" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
