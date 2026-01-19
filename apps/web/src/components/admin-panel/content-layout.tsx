"use client";

import React from "react";

type ContentLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function ContentLayout({ title, children }: ContentLayoutProps) {
  return (
    <div className="w-full">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}
