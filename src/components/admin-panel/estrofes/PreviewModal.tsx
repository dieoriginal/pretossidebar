"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react"; // Or your custom path to icons

// Type definitions
type VerseWord = { 
  text: string; 
  customColor?: string;
};

type VerseLine = VerseWord[];
type Strophe = VerseLine[];

const PreviewModal = ({ strophes }: { strophes: Strophe[] }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className="gap-2">
        <EyeIcon className="h-4 w-4" />
        Pré-visualizar
      </Button>
    </DialogTrigger>
    <DialogContent className="min-h-[834px] max-w-[750px]">
      <DialogHeader>
        <DialogTitle className="text-center">Pré-visualização do Poema</DialogTitle>
      </DialogHeader>
      <div className="bg-white p-8 h-full dark:bg-black">
        <div className="font-helvetica uppercase text-black dark:text-white text-center space-y-6 text-lg">
          {strophes.map((strophe, stropheIndex) => (
            <div key={stropheIndex} className="space-y-4">
              {strophe.map((verse, verseIndex) => (
                <p key={verseIndex} className="break-words">
                  {verse.map((word, wordIndex) => (
                    <span 
                      key={wordIndex} 
                      style={{ color: word.customColor || 'inherit' }}
                    >
                      {word.text.toUpperCase()}{' '}
                    </span>
                  ))}
                </p>
              ))}
              {stropheIndex < strophes.length - 1 && <div className="h-4" />}
            </div>
          ))}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// If using a custom EyeIcon component instead of lucide-react, include this:
function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default PreviewModal;