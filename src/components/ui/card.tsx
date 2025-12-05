/**
 * Card Component - Google Antigravity Design System
 * Requirements: 20.5, 20.6
 * - Soft shadows: box-shadow: 0 10px 30px rgba(0,0,0,0.05)
 * - Border-radius: 16px
 * - Massive whitespace between sections (120px gap)
 */

import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Google Antigravity Design System card styles
      "rounded-[16px] border border-gray-100 bg-white text-[#202124]",
      // Soft shadow per Requirements 20.5
      "shadow-[0_10px_30px_rgba(0,0,0,0.05)]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-[#202124]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[#5F6368]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

/**
 * Section Container - Google Antigravity Design System
 * Requirements: 20.6
 * - Massive whitespace between sections (120px gap)
 * - Container padding (80px)
 */
const Section = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      // Massive whitespace per Requirements 20.6
      "py-[120px] px-4 sm:px-6 lg:px-[80px]",
      className
    )}
    {...props}
  />
))
Section.displayName = "Section"

/**
 * Container - Google Antigravity Design System
 * Centered container with max-width
 */
const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      className
    )}
    {...props}
  />
))
Container.displayName = "Container"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Section,
  Container
}
