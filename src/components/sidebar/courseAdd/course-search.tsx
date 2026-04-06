import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import type { OrganizedCourses } from "@/data/courses";

export default function CourseSearch({
	courses,
}: {
	courses: OrganizedCourses;
}) {
	console.log(courses);

	return (
		<Combobox
			items={Object.keys(courses).map(
				(courseKey) => courses[courseKey as unknown as number],
			)}
			itemToStringValue={(course) =>
				course.sections.map(
					(section) =>
						`${course.course_code}-${section.section_code}-${course.course_title}`,
				)
			}
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
								<div>
									<p>
										{course.course_code}-{section.section_code}:{" "}
										{course.course_title}
									</p>
									<div>
										<p>
											{section.meetings.flatMap((meeting) =>
												meeting.instructors
													.map(
														(instructor) =>
															`${instructor.first_name} ${instructor.last_name}`,
													)
													.join(", "),
											)}
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
