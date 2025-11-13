import * as React from "react"
import { cva, VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
	"relative w-full border px-5 py-4 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-4 gap-y-1 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current border-l-[6px]",
	{
		variants: {
			variant: {
				default:
					"bg-card text-card-foreground border-border border-l-border [&_*[data-slot=alert-description]]:text-muted-foreground",
				warning:
					"bg-warning border-warning-border border-l-warning-foreground text-warning-foreground [&_*[data-slot=alert-description]]:text-warning-foreground/90",
				danger:
					"bg-danger border-danger-border border-l-danger-foreground text-danger-foreground [&_*[data-slot=alert-description]]:text-danger-foreground/90",
				info: "bg-info border-info-border border-l-info-foreground text-info-foreground [&_*[data-slot=alert-description]]:text-info-foreground/90",
				success:
					"bg-success border-success-border border-l-success-foreground text-success-foreground [&_*[data-slot=alert-description]]:text-success-foreground/90",
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
				"col-start-2 min-h-4 font-semibold tracking-tight text-base",
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
				"col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
				className
			)}
			{...props}
		/>
	)
}

export { Alert, AlertTitle, AlertDescription }
