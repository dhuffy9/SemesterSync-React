export const crateSwipeLeftVariant = (shouldReduceMotion: boolean | null) => ({
	initial: shouldReduceMotion
		? { opacity: 1, x: 0 }
		: { opacity: 0, x: "-100%" },
	animate: { opacity: 1, x: 0 },
	exit: shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: "-100%" },
});

export const createSwipeRightVariant = (
	shouldReduceMotion: boolean | null,
) => ({
	initial: shouldReduceMotion
		? { opacity: 1, x: 0 }
		: { opacity: 0, x: "100%" },
	animate: { opacity: 1, x: 0 },
	exit: shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: "100%" },
});

export const TRANSITION = {
	duration: 0.2,
	type: "spring" as const,
	bounce: 0.1,
};
