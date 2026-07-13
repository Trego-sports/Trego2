import * as React from "react"
import { Select as BaseSelect } from "@base-ui-components/react/select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({ ...props }: React.ComponentProps<typeof BaseSelect.Root>) {
	return <BaseSelect.Root data-slot="select" {...props} />
}

function SelectGroup({
	...props
}: React.ComponentProps<typeof BaseSelect.Group>) {
	return <BaseSelect.Group data-slot="select-group" {...props} />
}

function SelectPortal({
	...props
}: React.ComponentProps<typeof BaseSelect.Portal>) {
	return <BaseSelect.Portal data-slot="select-portal" {...props} />
}

function SelectPositioner({
	...props
}: React.ComponentProps<typeof BaseSelect.Positioner>) {
	return <BaseSelect.Positioner data-slot="select-positioner" {...props} />
}

function SelectValue({
	className,
	...props
}: React.ComponentProps<typeof BaseSelect.Value>) {
	return (
		<BaseSelect.Value
			data-slot="select-value"
			className={cn("text-sm font-medium text-[#0b1c30]", className)}
			{...props}
		/>
	)
}

function SelectTrigger({
	className,
	size = "default",
	children,
	...props
}: React.ComponentProps<typeof BaseSelect.Trigger> & {
	size?: "sm" | "default"
}) {
	return (
		<BaseSelect.Trigger
			data-slot="select-trigger"
			data-size={size}
			className={cn(
				"group flex w-fit items-center justify-between gap-2 rounded-lg border border-[#c3c6d7] bg-white px-3 py-2 text-sm font-medium whitespace-nowrap text-[#0b1c30] shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none select-none transition-[border-color,box-shadow,background-color] hover:border-[#9aa9c8] focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/20 aria-invalid:border-[#b91c1c] aria-invalid:ring-2 aria-invalid:ring-[#b91c1c]/20 data-[disabled]:pointer-events-none data-[disabled]:bg-[#f1f5fb] data-[disabled]:text-[#7b8496] data-[disabled]:opacity-70 data-[size=default]:h-10 data-[size=sm]:h-9 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 data-[popup-open]:[&_*[data-slot=select-icon]]:rotate-180 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='text-'])]:text-[#647086] [&_svg:not([class*='size-'])]:size-4",
				className
			)}
			{...props}
		>
			{children}
			<BaseSelect.Icon>
				<ChevronDownIcon
					data-slot="select-icon"
					className="size-4 opacity-50 transition-transform duration-200"
				/>
			</BaseSelect.Icon>
		</BaseSelect.Trigger>
	)
}

function SelectContent({
	className,
	children,
	sideOffset = 4,
	position = "popper",
	...props
}: React.ComponentProps<typeof BaseSelect.Popup> & {
	sideOffset?: BaseSelect.Positioner.Props["sideOffset"]
	position?: "popper" | "item-aligned"
}) {
	return (
		<SelectPortal>
			<SelectPositioner
				sideOffset={sideOffset}
				alignItemWithTrigger={position === "item-aligned"}
			>
				<SelectScrollUpButton />
				<BaseSelect.Popup
					data-slot="select-content"
					className={cn(
						"data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[var(--available-height)] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto rounded-lg border border-[#c3c6d7] bg-white p-1 text-[#0b1c30] shadow-[0_18px_45px_rgba(15,23,42,0.14)]",
						position === "item-aligned" &&
							"[&_*[data-slot=select-item]]:min-w-[var(--anchor-width)]",
						className
					)}
					{...props}
				>
					{children}
				</BaseSelect.Popup>
				<SelectScrollDownButton />
			</SelectPositioner>
		</SelectPortal>
	)
}

function SelectItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof BaseSelect.Item>) {
	return (
		<BaseSelect.Item
			data-slot="select-item"
			className={cn(
				"relative flex w-full cursor-default items-center gap-2 rounded-md py-2 pr-8 pl-2 text-sm font-medium text-[#0b1c30] outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-highlighted:bg-[#e5eeff] data-highlighted:text-[#004ac6] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='text-'])]:text-[#647086] [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
				className
			)}
			{...props}
		>
			<span className="absolute right-2 flex size-3.5 items-center justify-center text-[#004ac6]">
				<BaseSelect.ItemIndicator>
					<CheckIcon className="size-4" />
				</BaseSelect.ItemIndicator>
			</span>
			<BaseSelect.ItemText>{children}</BaseSelect.ItemText>
		</BaseSelect.Item>
	)
}

function SelectLabel({
	className,
	...props
}: React.ComponentProps<typeof BaseSelect.GroupLabel>) {
	return (
		<BaseSelect.GroupLabel
			data-slot="select-label"
			className={cn(
				"px-2 py-1.5 text-xs font-black tracking-[0.08em] text-[#647086] uppercase",
				className
			)}
			{...props}
		/>
	)
}

function SelectSeparator({
	className,
	...props
}: React.ComponentProps<typeof BaseSelect.Separator>) {
	return (
		<BaseSelect.Separator
			data-slot="select-separator"
			className={cn("pointer-events-none -mx-1 my-1 h-px bg-[#d8def0]", className)}
			{...props}
		/>
	)
}

function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof BaseSelect.ScrollUpArrow>) {
	return (
		<BaseSelect.ScrollUpArrow
			data-slot="select-scroll-up-button"
			className={cn(
				"top-px left-[1px] z-[100] flex w-[calc(100%-2px)] cursor-default items-center justify-center bg-white py-1 text-[#647086]",
				className
			)}
			{...props}
		>
			<ChevronUpIcon className="size-4" />
		</BaseSelect.ScrollUpArrow>
	)
}

function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof BaseSelect.ScrollDownArrow>) {
	return (
		<BaseSelect.ScrollDownArrow
			data-slot="select-scroll-down-button"
			className={cn(
				"bottom-px left-[1px] z-[100] flex w-[calc(100%-2px)] cursor-default items-center justify-center bg-white py-1 text-[#647086]",
				className
			)}
			{...props}
		>
			<ChevronDownIcon className="size-4" />
		</BaseSelect.ScrollDownArrow>
	)
}

export {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
	SelectGroup,
	SelectLabel,
	SelectSeparator,
}
