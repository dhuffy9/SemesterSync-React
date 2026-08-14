"use client";

import clsx from "clsx";
import { ChevronRightIcon, PlusIcon, XIcon, XOctagonIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import useUserStore from "@/stores/user-store";
import type { CourseResponse } from "@/types/courses";
import EventAddLinked from "./event-add-linked";
import EventAddPersonal from "./event-add-personal";
import EventAddUnlinked from "./event-add-unlinked";

const selectOptions = [
	{
		title: "Add Course-Linked Event",
		description:
			"Linked events are events for courses on your calendar that will automatically update with the latest information from the course catalog.",
		key: "linked",
		recommended: true,
	},
	{
		title: "Manually Add Course Event",
		description:
			"Manually added course events can not automatically update with information from the catalog, but can be pre-filled using information from from the catalog.",
		key: "manual",
		recommended: false,
	},
	{
		title: "Add Non-Course Event",
		description:
			"Ability to add non-course events for personal time, such as when you have work, these require less information.",
		key: "personal",
		recommended: false,
	},
];

export default function EventAddModalClient({
	termsRes,
	courses,
}: {
	termsRes: TermResponse;
	courses: CourseResponse;
}) {
	const activeTerm = useUserStore((state) => state.activeTerm);

	const [selectedOption, setSelectedOption] = useState("none");
	const [modalContentShown, setModalContentShown] = useState(false);

	const shouldReduceMotion = useReducedMotion();
	const swipeLeftVariant = crateSwipeLeftVariant(shouldReduceMotion);

	return (
		<AlertDialog>
			<AlertDialogTrigger
				render={
					<Button
						disabled={activeTerm === ""}
						variant={activeTerm === "" ? "destructive" : "default"}
					/>
				}
			>
				{activeTerm === "" ? (
					<>
						<XOctagonIcon /> Select a Term to Get Started
					</>
				) : (
					<>
						<PlusIcon /> Add Event
					</>
				)}
			</AlertDialogTrigger>
			<AlertDialogContent className={`${modalContentShown && "hidden"}`}>
				<AlertDialogHeader className="flex flex-row items-center gap-2 justify-between">
					<AlertDialogTitle className="pt-1">Add Event</AlertDialogTitle>
					<AlertDialogCancel size={"icon-sm"} variant={"ghost"}>
						<XIcon />
					</AlertDialogCancel>
				</AlertDialogHeader>

				<div className="relative pb-2 overflow-hidden">
					{activeTerm === "" ? (
						<p className="text-destructive">
							You must select a term before adding events
						</p>
					) : (
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
											className={cn(
												clsx(
													"rounded-md border border-border p-2 text-left hover:shadow flex flex-row items-center gap-2 cursor-pointer",
													{
														"border-primary shadow-primary": option.recommended,
													},
												),
											)}
											key={option.key}
											onClick={() => setSelectedOption(option.key)}
											whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
										>
											{option.recommended && (
												<div className="absolute -top-1.5 right-0 bg-primary text-primary-foreground rounded-lg p-1 text-sm">
													Recommended
												</div>
											)}
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

							{selectedOption === "linked" && (
								<EventAddLinked
									courses={courses}
									setSelectedOption={setSelectedOption}
								/>
							)}

							{selectedOption === "manual" && (
								<EventAddUnlinked
									terms={termsRes}
									courses={courses}
									setSelectedOption={setSelectedOption}
									closeParentModal={setModalContentShown}
								/>
							)}

							{selectedOption === "personal" && (
								<EventAddPersonal
									terms={termsRes}
									setSelectedOption={setSelectedOption}
									closeParentModal={setModalContentShown}
								/>
							)}
						</AnimatePresence>
					)}
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
