"use client";

import { forwardRef, useMemo, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useForwardedRef } from "@/hooks/use-forwarded-ref";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
}

const ColorPicker = forwardRef<
	HTMLButtonElement,
	Omit<ButtonProps, "value" | "onChange" | "onBlur"> &
		ColorPickerProps &
		ButtonProps
>(
	(
		{ disabled, value, onChange, onBlur, name, className, size, ...props },
		forwardedRef,
	) => {
		const inputRef = useRef(null);
		const [open, setOpen] = useState(false);

		const parsedValue = useMemo(() => {
			return value || "#FFFFFF";
		}, [value]);

		return (
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger
					render={
						<Button
							{...props}
							ref={forwardedRef}
							className={cn("block", className)}
							name={name}
							onClick={() => {
								setOpen(true);
							}}
							size={size}
							style={{
								backgroundColor: parsedValue,
							}}
							variant="outline"
						/>
					}
					disabled={disabled}
					onBlur={onBlur}
				>
					<div />
				</PopoverTrigger>
				<PopoverContent className="w-full">
					<HexColorPicker color={parsedValue} onChange={onChange} />
					<Input
						maxLength={7}
						onChange={(e) => {
							onChange(e?.currentTarget?.value);
						}}
						ref={inputRef}
						value={parsedValue}
					/>
				</PopoverContent>
			</Popover>
		);
	},
);
ColorPicker.displayName = "ColorPicker";

const ColorPickerInners = forwardRef<
	HTMLInputElement,
	ColorPickerProps & { className?: string }
>(({ value, onChange, onBlur, className, ...props }, forwardedRef) => {
	const ref = useForwardedRef(forwardedRef);

	const parsedValue = useMemo(() => {
		return value || "#FFFFFF";
	}, [value]);

	return (
		<div className={cn("flex flex-col gap-1", className)}>
			<HexColorPicker color={parsedValue} onChange={onChange} />
			<Input
				{...props}
				maxLength={7}
				onChange={(e) => {
					onChange(e?.currentTarget?.value);
				}}
				ref={ref}
				value={parsedValue}
			/>
		</div>
	);
});
ColorPickerInners.displayName = "ColorPickerInners";

export { ColorPicker, ColorPickerInners };
