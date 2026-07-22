"use client";
import clsx from "clsx";
import { ArrowLeft, PlusIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { forwardRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { createSwipeRightVariant, TRANSITION } from "@/lib/animation";
import { cn } from "@/lib/utils";
import useUserStore from "@/stores/user-store";
import type {
	AssembledCourseSingleSection,
	CourseResponse,
} from "@/types/courses";
import CourseAddList, { MeetingsDisplay } from "./course-add-list";

type CourseAddQuickProps = {
	courses: CourseResponse;
	setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
};

const CourseAddQuick = forwardRef<HTMLDivElement, CourseAddQuickProps>(
	({ courses, setSelectedOption }, ref) => {
		const [selectedCourse, setSelectedCourse] = useState<
			Array<AssembledCourseSingleSection>
		>([]);
		const [selectedColor, setSelectedColor] = useState<string>("#4285F4");

		const tab = useUserStore((state) => state.getActiveTab());
		const courseEventAdd = useUserStore((state) => state.addCourseEvent);

		const shouldReduceMotion = useReducedMotion();
		const swipeRightVariant = createSwipeRightVariant(shouldReduceMotion);

		console.log(selectedCourse);

		const handleAddCourse = () => {
			for (const course of selectedCourse) {
				courseEventAdd(tab.id, {
					eventId: uuid(),
					color: selectedColor,
					...course,
				});
			}

			setSelectedCourse([]);
			setSelectedOption("none");
		};

		return (
			<motion.div
				animate="animate"
				initial="initial"
				exit="exit"
				key="quick"
				variants={swipeRightVariant}
				transition={TRANSITION}
				ref={ref}
				className="flex flex-col gap-2"
			>
				<div className="flex flex-row items-center gap-2 justify-between">
					<p>Quick Add</p>
					<Button
						onClick={() => {
							setSelectedOption("none");
							setSelectedCourse([]);
						}}
						variant="secondary"
					>
						<ArrowLeft /> Back
					</Button>
				</div>

				<div className="flex flex-col gap-2 rounded-md border border-border p-2">
					<div className="flex flex-col gap-2">
						<ScrollArea className="h-24">
							{selectedCourse.length === 0 ? (
								<div className="flex flex-col gap-1 h-24 justify-center text-center">
									<p className="">No Courses Selected</p>
									<p className="text-muted-foreground">
										Select some from the list below to get started!
									</p>
								</div>
							) : (
								selectedCourse.map((course) => (
									<Popover
										key={`${course.course_id}-${course.section.section_id}`}
									>
										<PopoverTrigger className="cursor-pointer w-full text-left">
											{course.course_code}-{course.section.section_code}:{" "}
											{course.course_title}
										</PopoverTrigger>
										<PopoverContent className="sm:w-md">
											<div className="flex flex-col gap-2">
												<div className="flex flex-row items-baseline gap-1 justify-between">
													<p>{course.course_title}</p>
													<p>
														{course.course_code}-{course.section.section_code}
													</p>
												</div>
												<div className="flex flex-row items-baseline gap-1">
													<p>
														{course.credits}{" "}
														<span className="text-muted-foreground">
															credits
														</span>
													</p>

													<Separator orientation="vertical" />

													{course.section.seats_available > -1 ? (
														<p
															className={cn(
																clsx("", {
																	"text-yellow-600":
																		course.section.seats_available /
																			course.section.seats_total <
																		0.5,
																	"text-destructive":
																		course.section.seats_available /
																			course.section.seats_total <
																		0.25,
																}),
															)}
														>
															{course.section.seats_available} /{" "}
															{course.section.seats_total}{" "}
															<span className="text-muted-foreground">
																{course.section.seats_available > -1
																	? "seats"
																	: "on waitlist"}
															</span>
														</p>
													) : (
														<p className="text-destructive">
															{Math.abs(course.section.seats_available)} on
															waitlist
														</p>
													)}
												</div>
											</div>

											<Separator />

											<MeetingsDisplay section={course.section} />
										</PopoverContent>
									</Popover>
								))
							)}
						</ScrollArea>
						<div className="flex flex-row items-center gap-1 w-full">
							<Button
								disabled={selectedCourse.length === 0}
								variant={selectedCourse.length === 0 ? "secondary" : "default"}
								onClick={handleAddCourse}
								className="flex-1"
							>
								<PlusIcon /> Quick Add
							</Button>
							<Button
								disabled
								variant="secondary"
								className={clsx("", {
									"text-yellow-600":
										selectedCourse.reduce(
											(acc, curr) => acc + parseFloat(curr.credits),
											0,
										) > 18,
								})}
							>
								{selectedCourse.reduce(
									(acc, curr) => acc + parseFloat(curr.credits),
									0,
								)}{" "}
								credits
							</Button>

							<ColorPicker
								className="size-8"
								value={selectedColor}
								onChange={(v) =>
									setSelectedColor(typeof v === "string" ? v : v.target.value)
								}
							/>
						</div>
					</div>
				</div>

				<CourseAddList
					courses={courses}
					externalSelectedCourse={selectedCourse}
					setExternalSelectedCourse={setSelectedCourse}
					multiple
				/>
			</motion.div>
		);
	},
);

CourseAddQuick.displayName = "CourseAddQuick";
export default CourseAddQuick;
