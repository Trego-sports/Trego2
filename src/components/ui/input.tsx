import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
	inputContainerClassName?: string
	leadingIcon?: React.ReactNode
	trailingIcon?: React.ReactNode
}

function Input({
	inputContainerClassName,
	className,
	type,
	leadingIcon,
	trailingIcon,
	disabled,
	...props
}: InputProps) {
	return (
		<div
			className={cn(
				"group relative w-full data-[disabled]:pointer-events-none",
				inputContainerClassName
			)}
			data-disabled={disabled ? "" : undefined}
			data-slot="input-container"
		>
			{leadingIcon && (
				<span
					data-slot="input-leading-icon"
					className="absolute top-1/2 left-3 shrink-0 -translate-y-1/2 text-[#647086] [&_svg]:shrink-0 [&_svg:not([class*='pointer-events-'])]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
				>
					{leadingIcon}
				</span>
			)}
			<input
				type={type}
				data-slot="input"
				className={cn(
					"flex h-10 w-full min-w-0 rounded-lg border border-[#c3c6d7] bg-white px-3 py-2 text-base font-medium text-[#0b1c30] shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#7b8496] selection:bg-[#004ac6] selection:text-white group-hover:border-[#9aa9c8] disabled:pointer-events-none disabled:bg-[#f1f5fb] disabled:text-[#7b8496] disabled:opacity-70 md:text-sm",
					"file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-[#0b1c30]",
					"focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/20",
					"aria-invalid:border-[#b91c1c] aria-invalid:ring-2 aria-invalid:ring-[#b91c1c]/20",
					leadingIcon && "pl-10",
					trailingIcon && "pr-10",
					className
				)}
				disabled={disabled}
				{...props}
			/>
			{trailingIcon && (
				<span
					data-slot="input-trailing-icon"
					className="absolute top-1/2 right-3 shrink-0 -translate-y-1/2 text-[#647086] [&_svg]:shrink-0 [&_svg:not([class*='pointer-events-'])]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
				>
					{trailingIcon}
				</span>
			)}
		</div>
	)
}

export { Input }
