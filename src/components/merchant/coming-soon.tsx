"use client";

import React from "react";
import { Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MerchantFeatureComingSoon({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-6">
            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Hammer className="h-12 w-12" />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
                <p className="text-xl text-muted-foreground max-w-md">
                    We're working hard to bring this feature to your Merchant portal. Stay tuned!
                </p>
            </div>
            <Link href="/merchant">
                <Button variant="default" size="lg">
                    Back to Dashboard
                </Button>
            </Link>
        </div>
    );
}
