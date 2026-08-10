"use client";

import { ChevronRightIcon, PlusIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { TermResponse } from "@/data/terms";
import { crateSwipeLeftVariant, TRANSITION } from "@/lib/animation";
import type { CourseResponse } from "@/types/courses";
import CourseAddManual from "./course-add-manual";
import CourseAddQuick from "./course-add-quick";

const selectOptions = [
	{
		title: "Quick Add Course",
		description:
			"All the details from the course and section you select will automatically be added to your schedule.",
		key: "quick",
	},
	{
		title: "Manually Add Course",
		description:
			"Gives you the ability to fill in all of the course details, you can still search for existing courses to prefill the inputs.",
		key: "manual",
	},
	{
		title: "Add Non-Course Event",
		description:
			"Ability to add non-course events such as when you have work, requires less information.",
		key: "event",
	},
];

export default function EventAddModalClient({
	termsRes,
	courses,
}: {
	termsRes: TermResponse;
	courses: CourseResponse;
}) {
	const [selectedOption, setSelectedOption] = useState("none");
	const [modalContentShown, setModalContentShown] = useState(false);

	const shouldReduceMotion = useReducedMotion();
	const swipeLeftVariant = crateSwipeLeftVariant(shouldReduceMotion);

	return (
		<AlertDialog>
			<AlertDialogTrigger render={<Button />}>
				<PlusIcon /> Add Event
			</AlertDialogTrigger>
			<AlertDialogContent className={`${modalContentShown && "hidden"}`}>
				<AlertDialogHeader className="flex flex-row items-center gap-2 justify-between">
					<AlertDialogTitle className="pt-1">Add Event</AlertDialogTitle>
					<AlertDialogCancel size={"icon-sm"} variant={"ghost"}>
						<XIcon />
					</AlertDialogCancel>
				</AlertDialogHeader>

				<div className="relative pb-2 overflow-hidden">
					<AnimatePresence initial={false} mode="popLayout">
						{selectedOption === "none" && (
							<motion.div
								animate="animate"
								initial="initial"
								exit="exit"
								key="none"
								variants={swipeLeftVariant}
								transition={TRANSITION}
								className="flex flex-col gap-2"
							>
								{selectOptions.map((option) => (
									<motion.button
										className="rounded-md border border-border p-2 text-left hover:shadow flex flex-row items-center gap-2 cursor-pointer"
										key={option.key}
										onClick={() => setSelectedOption(option.key)}
										whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
									>
										<div>
											<p>{option.title}</p>
											<p className="text-muted-foreground text-sm">
												{option.description}
											</p>
										</div>
										<ChevronRightIcon className="size-8" />
									</motion.button>
								))}
							</motion.div>
						)}

						{selectedOption === "quick" && (
							<CourseAddQuick
								courses={courses}
								setSelectedOption={setSelectedOption}
							/>
						)}

						{selectedOption === "manual" && (
							<CourseAddManual
								terms={termsRes}
								courses={courses}
								setSelectedOption={setSelectedOption}
								closeParentModal={setModalContentShown}
							/>
						)}
					</AnimatePresence>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
