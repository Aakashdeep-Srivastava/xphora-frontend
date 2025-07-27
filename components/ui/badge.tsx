import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        // HIGH CONTRAST VARIANTS
        default: "border-blue-300 bg-blue-100 text-blue-800 hover:bg-blue-200 hover:border-blue-400",
        secondary: "border-gray-400 bg-gray-100 text-gray-800 hover:bg-gray-200 hover:border-gray-500",
        destructive: "border-red-300 bg-red-100 text-red-800 hover:bg-red-200 hover:border-red-400",
        outline: "border-gray-400 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-500",
        
        // AI PREDICTION SPECIFIC VARIANTS
        success: "border-green-300 bg-green-100 text-green-800 hover:bg-green-200",
        warning: "border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        info: "border-cyan-300 bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
        purple: "border-purple-300 bg-purple-100 text-purple-800 hover:bg-purple-200",
        
        // SEVERITY LEVELS FOR AI PREDICTIONS
        low: "border-green-400 bg-green-50 text-green-700 hover:bg-green-100",
        medium: "border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100", 
        high: "border-orange-400 bg-orange-50 text-orange-700 hover:bg-orange-100",
        critical: "border-red-500 bg-red-50 text-red-700 hover:bg-red-100",
        
        // TAG VARIANTS WITH HIGH VISIBILITY
        "ai-tag": "border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer",
        "ai-tag-selected": "border-blue-600 bg-blue-200 text-blue-900 shadow-md transform scale-105",
        "category-other": "border-purple-400 bg-purple-50 text-purple-700",
        "category-security": "border-red-400 bg-red-50 text-red-700",
        "category-traffic": "border-orange-400 bg-orange-50 text-orange-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }