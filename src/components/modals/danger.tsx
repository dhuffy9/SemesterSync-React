import type {
	DialogTriggerProps,
	Tooltip as TooltipPrimitive,
} from "@base-ui/react";
import { ArrowLeft, RotateCw, Trash } from "lucide-react";
import type React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button, type ButtonSizes, type ButtonVariants } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const defaults = {
	reset: {
		icon: <RotateCw />,
		triggerChildren: <RotateCw />,
		triggerSize: "icon",
		title: "Reset Entered Information",
		description: "Are you sure you want to reset all the entered information?",
		cancel: "Cancel",
		action: "Reset",
	},
	proceedReset: {
		icon: <RotateCw />,
		triggerChildren: (
			<>
				<ArrowLeft /> Back
			</>
		),
		triggerSize: "default",
		title: "Reset Entered Information",
		description:
			"Going back will clear the entered information, are you sure you would like to proceed?",
		cancel: "Cancel",
		action: "Proceed & Reset",
	},
	delete: {
		icon: <Trash />,
		triggerChildren: <Trash />,
		triggerSize: "icon",
		title: "Delete Item",
		description: "Are you sure you would like to delete this item?",
		cancel: "Cancel",
		action: "Delete Item",
	},
};

type DangerModalProps = {
	type: keyof typeof defaults;

	isModalOpen?: boolean;
	onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;

	trigger?: React.ReactNode;
	triggerRender?: DialogTriggerProps<unknown>["render"];
	triggerChildren?: React.ReactNode;
	triggerDestructive?: boolean;
	triggerVariant?: ButtonVariants;
	triggerSize?: ButtonSizes;
	triggerTooltip?: string;
	tooltipSide?: TooltipPrimitive.Positioner.Props["side"];
	triggerOnClick?: DialogTriggerProps<unknown>["onClick"];

	titleChildren?: React.ReactNode;
	descriptionChildren?: React.ReactNode;

	cancelChildren?: React.ReactNode;
	cancelOnClick?: DialogTriggerProps<unknown>["onClick"];

	actionChildren?: React.ReactNode;
	actionOnClick?: DialogTriggerProps<unknown>["onClick"];
};

export default function DangerModal({
	type,
	isModalOpen,
	onOpenChange,
	trigger,
	triggerRender,
	triggerChildren,
	triggerDestructive = true,
	triggerVariant,
	triggerSize,
	triggerTooltip,
	tooltipSide,
	triggerOnClick,
	titleChildren,
	descriptionChildren,
	cancelChildren,
	cancelOnClick,
	actionChildren,
	actionOnClick,
}: DangerModalProps) {
	const defVals = defaults[type];

	return (
		<AlertDialog open={isModalOpen} onOpenChange={onOpenChange}>
			{trigger ? (
				trigger
			) : triggerDestructive ? (
				<Tooltip>
					<AlertDialogTrigger
						render={
							triggerRender ? (
								triggerRender
							) : triggerTooltip ? (
								<TooltipTrigger
									render={
										<Button
											variant={triggerVariant ? triggerVariant : "destructive"}
											size={
												triggerSize
													? triggerSize
													: triggerChildren
														? "default"
														: (defVals.triggerSize as ButtonSizes)
											}
										/>
									}
								/>
							) : (
								<Button
									variant={triggerVariant ? triggerVariant : "destructive"}
									size={
										triggerSize
											? triggerSize
											: triggerChildren
												? "default"
												: (defVals.triggerSize as ButtonSizes)
									}
								/>
							)
						}
						onClick={triggerOnClick ? triggerOnClick : () => {}}
					>
						{triggerChildren ? triggerChildren : defVals.triggerChildren}
					</AlertDialogTrigger>
					<TooltipContent side={tooltipSide ? tooltipSide : "right"}>
						{triggerTooltip}
					</TooltipContent>
				</Tooltip>
			) : (
				<Button
					variant={triggerVariant ? triggerVariant : "secondary"}
					size={
						triggerSize
							? triggerSize
							: triggerChildren
								? "default"
								: (defVals.triggerSize as ButtonSizes)
					}
					onClick={triggerOnClick ? triggerOnClick : () => {}}
				>
					{triggerChildren ? triggerChildren : defVals.triggerChildren}
				</Button>
			)}
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
						{defVals.icon}
					</AlertDialogMedia>
					<AlertDialogTitle>
						{titleChildren ? titleChildren : defVals.title}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{descriptionChildren ? descriptionChildren : defVals.description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={cancelOnClick ? cancelOnClick : () => {}}>
						{cancelChildren ? cancelChildren : defVals.cancel}
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={actionOnClick ? actionOnClick : () => {}}
					>
						{actionChildren ? actionChildren : defVals.action}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
