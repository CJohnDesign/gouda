import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date safely
export function formatDate(date: string | null | undefined) {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString()
}
