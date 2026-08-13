import { getAllCoursesWithMeetings } from "@/data/courses";
import EventListClient from "./event-list-client";

export default async function EventList() {
	const courses = await getAllCoursesWithMeetings();

	return <EventListClient courses={courses} />;
}
