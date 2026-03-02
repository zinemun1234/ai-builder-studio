import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number[]
    onValueChange?: (value: number[]) => void
    min?: number
    max?: number
    step?: number
  }
>(({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    onValueChange?.([newValue])
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
        <div
          className="absolute h-full bg-blue-600"
          style={{ 
            left: '0%', 
            right: `${100 - ((value[0] - min) / (max - min)) * 100}%` 
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="absolute h-2 w-full cursor-pointer opacity-0"
      />
      <div
        className="absolute h-5 w-5 rounded-full border-2 border-blue-600 bg-white shadow-lg"
        style={{ 
          left: `${((value[0] - min) / (max - min)) * 100}%`,
          transform: 'translateX(-50%)'
        }}
      />
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }
