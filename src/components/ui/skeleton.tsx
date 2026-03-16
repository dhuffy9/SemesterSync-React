import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("bg-foreground/30 rounded-md animate-pulse", className)}
			{...props}
		/>
	);
}

export { Skeleton };
