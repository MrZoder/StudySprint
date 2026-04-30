/**
 * `cn` — merge Tailwind class strings safely.
 * `clsx` flattens conditionals/arrays/objects into a class string;
 * `twMerge` then resolves Tailwind conflicts so later classes win
 * (e.g. `cn("p-2", "p-4")` → `"p-4"`). Used everywhere for conditional styling.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
