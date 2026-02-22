"use client";

import { useState, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";

const ZOOM_KEY = "app-zoom-level";
const ZOOM_STEPS = [0.6, 0.67, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];
const DEFAULT_ZOOM = 0.85;

function getClosestStep(val: number): number {
    return ZOOM_STEPS.reduce((prev, curr) =>
        Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
    );
}

export function ZoomControls() {
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);

    // Load persisted zoom
    useEffect(() => {
        const saved = localStorage.getItem(ZOOM_KEY);
        if (saved) {
            const parsed = parseFloat(saved);
            if (!isNaN(parsed) && parsed >= 0.6 && parsed <= 1) {
                setZoom(parsed);
            }
        }
    }, []);

    // Apply zoom to CSS var
    useEffect(() => {
        document.documentElement.style.setProperty("--app-zoom", String(zoom));
        localStorage.setItem(ZOOM_KEY, String(zoom));
    }, [zoom]);

    const zoomIn = useCallback(() => {
        setZoom((prev) => {
            const idx = ZOOM_STEPS.indexOf(getClosestStep(prev));
            return idx < ZOOM_STEPS.length - 1 ? ZOOM_STEPS[idx + 1] : prev;
        });
    }, []);

    const zoomOut = useCallback(() => {
        setZoom((prev) => {
            const idx = ZOOM_STEPS.indexOf(getClosestStep(prev));
            return idx > 0 ? ZOOM_STEPS[idx - 1] : prev;
        });
    }, []);

    const resetZoom = useCallback(() => {
        setZoom(DEFAULT_ZOOM);
    }, []);

    const percentage = Math.round(zoom * 100);

    return (
        <div className="fixed bottom-3 right-3 z-[9999] flex items-center gap-1 bg-background/90 backdrop-blur-sm border rounded-full px-2 py-1 shadow-lg">
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={zoomOut}
                            disabled={zoom <= ZOOM_STEPS[0]}
                        >
                            <ZoomOut className="h-3.5 w-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Diminuir zoom</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={resetZoom}
                            className="text-[10px] font-medium text-muted-foreground min-w-[32px] text-center hover:text-foreground transition-colors"
                        >
                            {percentage}%
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Repor zoom (85%)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={zoomIn}
                            disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
                        >
                            <ZoomIn className="h-3.5 w-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Aumentar zoom</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
