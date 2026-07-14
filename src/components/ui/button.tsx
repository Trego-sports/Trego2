import * as React from "react"
import { mergeProps } from "@base-ui-components/react"
import { useRender } from "@base-ui-components/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-[background-color,border-color,color,box-shadow,scale] duration-200 outline-none active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#004ac6]/20 disabled:pointer-events-none disabled:scale-100 disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"border border-[#004ac6] bg-[#004ac6] text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#003ea8]",
				secondary:
					"border border-[#c3c6d7] bg-[#e5eeff] text-[#004ac6] hover:bg-[#dce9ff]",
				ghost:
					"text-[#38485d] hover:bg-[#e5eeff] hover:text-[#004ac6]",
				outline:
					"border border-[#9aa3b8] bg-white text-[#0b1c30] hover:border-[#004ac6] hover:bg-[#eff4ff] hover:text-[#004ac6]",
				link: "rounded-none px-0 text-[#004ac6] hover:underline underline-offset-4 active:scale-100",
				destructive:
					"border border-[#b91c1c] bg-[#b91c1c] text-white hover:bg-[#991b1b]",
			},
			size: {
				sm: "h-9 px-3 gap-1",
				md: "h-10 px-4",
				lg: "h-12 px-5 text-base",
				"icon-sm": "size-9 p-0 [&_svg:not([class*='size-'])]:size-3.5",
				icon: "size-10 p-0",
				"icon-lg": "size-11 p-0 [&_svg:not([class*='size-'])]:size-5",
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
