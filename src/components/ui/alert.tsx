import * as React from "react"
import { cva, VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
	"relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-lg border px-5 py-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-4 [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current",
	{
		variants: {
			variant: {
				default:
					"border-[#c3c6d7] bg-white text-[#0b1c30] [&_*[data-slot=alert-description]]:text-[#647086]",
				warning:
					"border-[#fde68a] bg-[#fff7d6] text-[#7a4d00] [&_*[data-slot=alert-description]]:text-[#7a4d00]/90",
				danger:
					"border-[#fecaca] bg-[#fff1f2] text-[#991b1b] [&_*[data-slot=alert-description]]:text-[#991b1b]/90",
				info: "border-[#bfdbfe] bg-[#eff6ff] text-[#004ac6] [&_*[data-slot=alert-description]]:text-[#004ac6]/90",
				success:
					"border-[#bbf7d0] bg-[#f0fdf4] text-[#166534] [&_*[data-slot=alert-description]]:text-[#166534]/90",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
)

function Alert({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	)
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h4">) {
	return (
		<h4
			data-slot="alert-title"
			className={cn(
				"col-start-2 min-h-4 text-base font-black tracking-tight",
				className
			)}
			{...props}
		/>
	)
}

function AlertDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				"col-start-2 grid justify-items-start gap-1 text-sm font-medium [&_p]:leading-relaxed",
				className
			)}
			{...props}
		/>
	)
}

export { Alert, AlertTitle, AlertDescription }
