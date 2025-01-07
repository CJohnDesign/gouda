import { Montserrat } from 'next/font/google'
import { cn } from "@/lib/utils"

const montserrat = Montserrat({ subsets: ['latin'] })

interface PageHeaderProps {
  title: string
  actions?: React.ReactNode
  filters?: React.ReactNode
  className?: string
}

export function PageHeader({ 
  title, 
  actions, 
  filters,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-8", className)}>
      {/* Actions Row */}
      {actions && (
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>
      )}

      {/* Title and Filters Row */}
      <div className="flex justify-between items-end gap-2">
        <h1 className={cn(
          "text-4xl font-bold tracking-tight justify-start",
          montserrat.className
        )}>
          {title}
        </h1>
        {filters}
      </div>
    </div>
  )
} 