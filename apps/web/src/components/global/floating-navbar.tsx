"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelsTopLeft, Calendar, Music, Home, GripVertical, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { useState, useEffect, useRef } from "react";
import { useProject } from "@/hooks/use-project";

const STORAGE_KEY = "floating-navbar-position";

export function FloatingNavbar() {
  const pathname = usePathname();
  const [position, setPosition] = useState({ x: 0, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const navRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved position from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { x, y } = JSON.parse(saved);
        // Validate saved position is within viewport
        if (x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight) {
          setPosition({ x, y });
          return;
        }
      }
      // Default: center top
      setPosition({ x: window.innerWidth / 2, y: 16 });
    } catch (error) {
      console.error("Erro ao carregar posição do navbar:", error);
      // Fallback to center top
      setPosition({ x: window.innerWidth / 2, y: 16 });
    }
  }, []);

  // Save position to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only save if position is valid and different from default
    if (position.x > 0 && position.y > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
  }, [position]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (rect.left + rect.width / 2),
      y: e.clientY - (rect.top + rect.height / 2),
    });
    setIsDragging(true);
    e.preventDefault();
    e.stopPropagation();
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - (rect.left + rect.width / 2),
      y: touch.clientY - (rect.top + rect.height / 2),
    });
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      setPosition({ x: touch.clientX - dragOffset.x, y: touch.clientY - dragOffset.y });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  return (
    <nav
      ref={navRef}
      className="fixed w-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, 0)",
        cursor: isDragging ? "grabbing" : "default",
        zIndex: 9999, // Always on top
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full bg-background/95 backdrop-blur-md border shadow-lg supports-[backdrop-filter]:bg-background/60 transition-all",
          isDragging && "shadow-2xl scale-105"
        )}
      >
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="cursor-grab active:cursor-grabbing mr-0.5 sm:mr-1 opacity-60 hover:opacity-100 transition-opacity touch-none"
          title="Arrastar navbar"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <Link
          href="/"
          onClick={(e) => {
            if (isDragging) {
              e.preventDefault();
            }
          }}
          className={cn(
            "inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            pathname === "/"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground",
            isDragging && "pointer-events-none"
          )}
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Projetos</span>
        </Link>
        <Link
          href="/events"
          onClick={(e) => {
            if (isDragging) {
              e.preventDefault();
            }
          }}
          className={cn(
            "inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            pathname?.startsWith("/events")
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground",
            isDragging && "pointer-events-none"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Eventos</span>
        </Link>
        <div className="h-6 w-px bg-border mx-0.5 sm:mx-1" />
        <ModeToggle />
      </div>
    </nav>
  );
}
