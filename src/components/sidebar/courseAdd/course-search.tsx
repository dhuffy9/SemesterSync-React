import clsx from "clsx";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import type { CourseResponse } from "@/data/courses";
import { cn } from "@/lib/utils";

const dayMap: Record<string, string> = {
	Monday: "M",
	Tuesday: "T",
	Wednesday: "W",
	Thursday: "R",
	Friday: "F",
	Saturday: "S",
	Sunday: "U",
};

export default function CourseSearch({ courses }: { courses: CourseResponse }) {
	if (typeof courses === "number")
		return (
			<p className="text-destructive bg-destructive/20 rounded-lg text-xs py-2 w-full text-center">
				Error Loading Courses
			</p>
		);

	return (
		<Combobox
			items={Object.keys(courses).map(
				(courseKey) => courses[courseKey as unknown as number],
			)}
		>
			<ComboboxInput placeholder="Search Courses..." />
			<ComboboxContent>
				<ComboboxEmpty>No Courses Found.</ComboboxEmpty>
				<ComboboxList>
					{Object.keys(courses).map((courseKey) => {
						const course = courses[courseKey as unknown as number];

						return course.sections.map((section) => {
							const meetingTimes = section.meetings.reduce(
								(acc, curr) => {
									let added = false;

									acc = acc.map((meetingSet) => {
										if (
											meetingSet.days.length === 0 &&
											meetingSet.times.length === 0
										) {
											meetingSet.days.push(`${dayMap[curr.day]}`);
											meetingSet.times.push(
												`${curr.start_time.slice(0, 5)}-${curr.end_time.slice(0, 5)}`,
											);
											added = true;
										} else if (
											!meetingSet.days.includes(dayMap[curr.day]) &&
											meetingSet.times.includes(
												`${curr.start_time.slice(0, 5)}-${curr.end_time.slice(0, 5)}`,
											)
										) {
											meetingSet.days.push(`${dayMap[curr.day]}`);
											added = true;
										}

										return meetingSet;
									});

									if (!added) {
										acc.push({
											days: [`${dayMap[curr.day]}`],
											times: [
												`${curr.start_time.slice(0, 5)}-${curr.end_time.slice(0, 5)}`,
											],
										});
									}

									return acc;
								},
								[{ days: [] as string[], times: [] as string[] }],
							);

							return (
								<ComboboxItem
									key={`${courseKey}-${section.section_id}`}
									value={`${course.course_code}-${section.section_code}-${course.course_title}`}
								>
									<div className="w-full">
										<p>
											{course.course_code}-{section.section_code}:{" "}
											{course.course_title}
										</p>
										<div className="grid grid-cols-3 w-full gap-2 text-sm text-muted-foreground">
											<p className="truncate">
												{new Set(
													section.meetings.map((meeting) =>
														meeting.instructors
															.map(
																(instructor) =>
																	`${instructor.first_name} ${instructor.last_name}`,
															)
															.join(", "),
													),
												)
													.values()
													.toArray()
													.join(", ")}
											</p>

											<p
												className={cn(
													clsx("", {
														"text-destructive":
															section.seats_available / section.seats_total <
															0.25,
													}),
												)}
											>
												{section.seats_available} / {section.seats_total}
											</p>

											<div className="flex flex-col">
												{meetingTimes.map((meeting) => (
													<div
														key={meeting.days.join()}
														className="flex flex-row items-center justify-between font-mono gap-2"
													>
														<p>{meeting.days.join("")}</p>
														<p>{meeting.times.join("")}</p>
													</div>
												))}
											</div>
										</div>
									</div>
								</ComboboxItem>
							);
						});
					})}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
