import * as React from "react"
import { Dialog as BaseDialog } from "@base-ui-components/react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({ ...props }: React.ComponentProps<typeof BaseDialog.Root>) {
	return <BaseDialog.Root data-slot="dialog" {...props} />
}

function DialogPortal({
	...props
}: React.ComponentProps<typeof BaseDialog.Portal>) {
	return <BaseDialog.Portal data-slot="dialog-portal" {...props} />
}

function DialogTrigger({
	...props
}: React.ComponentProps<typeof BaseDialog.Trigger>) {
	return <BaseDialog.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose({
	...props
}: React.ComponentProps<typeof BaseDialog.Close>) {
	return <BaseDialog.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof BaseDialog.Backdrop>) {
	return (
		<BaseDialog.Backdrop
			data-slot="dialog-overlay"
			className={cn(
				"fixed inset-0 bg-[#071426]/55 backdrop-blur-sm transition-opacity duration-200 [&[data-ending-style]]:opacity-0 [&[data-starting-style]]:opacity-0",
				className
			)}
			{...props}
		/>
	)
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof BaseDialog.Popup> & {
	showCloseButton?: boolean
}) {
	return (
		<DialogPortal data-slot="dialog-portal">
			<DialogOverlay />
			<BaseDialog.Popup
				data-slot="dialog-content"
				className={cn(
					"fixed z-50 grid w-full rounded-t-xl border border-[#c3c6d7] bg-white text-[#0b1c30] shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:max-w-[calc(100%-2rem)] sm:rounded-lg",
					"gap-4 p-6 duration-200 outline-none sm:max-w-lg sm:scale-[calc(1-0.1*var(--nested-dialogs))]",
					"fixed bottom-0 w-full sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]",
					"duration-200",
					"data-[starting-style]:translate-y-full data-[starting-style]:opacity-0",
					"data-[ending-style]:translate-y-full data-[ending-style]:opacity-0",
					"data-[starting-style]:sm:translate-y-[-50%] data-[starting-style]:sm:scale-95",
					"data-[ending-style]:sm:translate-y-[-50%] data-[ending-style]:sm:scale-95",
					className
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogClose className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-lg text-[#647086] opacity-80 transition hover:bg-[#e5eeff] hover:text-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
						<XIcon />
						<span className="sr-only">Close</span>
					</DialogClose>
				)}
			</BaseDialog.Popup>
		</DialogPortal>
	)
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
			{...props}
		/>
	)
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className
			)}
			{...props}
		/>
	)
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof BaseDialog.Title>) {
	return (
		<BaseDialog.Title
			data-slot="dialog-title"
			className={cn(
				"text-2xl leading-tight font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]",
				className
			)}
			{...props}
		/>
	)
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof BaseDialog.Description>) {
	return (
		<BaseDialog.Description
			data-slot="dialog-description"
			className={cn("text-sm font-medium leading-6 text-[#647086]", className)}
			{...props}
		/>
	)
}

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
}
