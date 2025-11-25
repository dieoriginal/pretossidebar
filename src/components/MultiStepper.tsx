"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type Step = { name: string; description?: string }
export type MultiStepperProps = {
  steps: Step[]
  currentStep: number
  onStepClick?: (index: number) => void
}

export const MultiStepper: React.FC<MultiStepperProps> = ({ steps, currentStep, onStepClick }) => {
  const progressPercentage = ((currentStep + 1) / Math.max(steps.length, 1)) * 100
  // Discrete width classes to avoid inline styles (tailwind JIT picks these up)
  const widths = [
    "w-0",
    "w-1/12",
    "w-2/12",
    "w-3/12",
    "w-4/12",
    "w-5/12",
    "w-6/12",
    "w-7/12",
    "w-8/12",
    "w-9/12",
    "w-10/12",
    "w-11/12",
    "w-full",
  ] as const
  const idx = Math.max(0, Math.min(12, Math.round((progressPercentage / 100) * 12)))
  const widthClass = widths[idx]

  return (
    <div className="flex flex-col gap-4 w-full overflow-x-auto">
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full bg-primary transition-all duration-300 ${widthClass}`} />
      </div>

      <div className="flex items-center justify-between relative">
        <div className="absolute left-[30%] top-0 h-full w-px bg-gray-300 dark:bg-gray-600" />
        <div className="absolute left-[70%] top-0 h-full w-px bg-gray-300 dark:bg-gray-600" />

        {steps.map((step, index) => (
          <div key={step.name} className="flex flex-col items-center flex-1 min-w-[80px]">
            <div className="flex items-center w-full">
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(index)}
                className="flex items-center w-full focus:outline-none"
                aria-label={`Ir para etapa ${index + 1}: ${step.name}`}
                title={step.description || step.name}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm font-medium transition-colors duration-300 ${
                        index <= currentStep
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{step.description || step.name}</p>
                  </TooltipContent>
                </Tooltip>
              </button>
              {index !== steps.length - 1 && (
                <div
                  className={`flex-1 h-1 ${
                    index < currentStep ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  } mx-2`}
                ></div>
              )}
            </div>
            <span className="mt-2 text-xs text-center">{step.name}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">
              Mês 1 - Pré-Produção
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Definir base sonora, conceito e letras</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
              Mês 2 - Produção
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Gravação, figurinos e filmagens</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900">
              Mês 3 - Pós-Produção
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Contratos, direitos autorais e lançamento</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export default MultiStepper
