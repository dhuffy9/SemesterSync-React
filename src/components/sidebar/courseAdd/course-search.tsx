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

						return course.sections.map((section) => (
							<ComboboxItem
								key={`${courseKey}-${section.section_id}`}
								value={`${course.course_code}-${section.section_code}-${course.course_title}`}
							>
								<div className="w-full">
									<p>
										{course.course_code}-{section.section_code}:{" "}
										{course.course_title}
									</p>
									<div className="flex flex-row items-center gap-2 justify-between text-sm text-muted-foreground">
										<p>
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
									</div>
								</div>
							</ComboboxItem>
						));
					})}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
