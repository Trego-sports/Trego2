import * as React from "react"
import { mergeProps } from "@base-ui-components/react"
import { useRender } from "@base-ui-components/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground hover:bg-primary/90 border border-primary",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-border",
				ghost:
					"text-foreground hover:bg-accent hover:text-accent-foreground",
				outline:
					"border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
				link: "text-foreground hover:underline underline-offset-4",
				destructive:
					"bg-destructive hover:bg-destructive/90 text-destructive-foreground border border-destructive",
			},
			size: {
				sm: "h-8 px-3 gap-1",
				md: "h-9 px-4",
				lg: "h-10 px-5",
				"icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3",
				icon: "size-9",
				"icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	}
)

export interface ButtonProps
	extends VariantProps<typeof buttonVariants>,
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		useRender.ComponentProps<"button"> {}

function Button({
	className,
	variant,
	size,
	render = <button />,
	...props
}: ButtonProps) {
	const defaultProps = {
		"data-slot": "button",
		className: cn(buttonVariants({ variant, size, className })),
	} as const

	const element = useRender({
		render,
		props: mergeProps<"button">(defaultProps, props),
	})

	return element
}

export { Button, buttonVariants }
