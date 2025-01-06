'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3
}

export function Heading({ 
  level = 1, 
  children, 
  className,
  ...props 
}: HeadingProps) {
  const Component = React.createElement(`h${level}`, {
    className: cn(
      level === 1 && 'scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight',
      level === 2 && 'scroll-m-20 text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight',
      level === 3 && 'scroll-m-20 text-lg sm:text-xl md:text-2xl font-semibold tracking-tight',
      className
    ),
    ...props
  }, children)

  return Component
}

export function Text({ 
  className,
  ...props 
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn(
        "text-sm md:text-base leading-7 [&:not(:first-child)]:mt-6",
        className
      )} 
      {...props} 
    />
  )
}

export function Lead({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-base md:text-lg text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function Large({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "text-lg md:text-xl font-semibold",
        className
      )}
      {...props}
    />
  )
}

export function Small({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <small
      className={cn(
        "text-xs md:text-sm font-medium leading-none",
        className
      )}
      {...props}
    />
  )
}

export function Subtle({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm md:text-base text-muted-foreground",
        className
      )}
      {...props}
    />
  )
} 