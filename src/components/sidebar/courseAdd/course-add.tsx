import { getTerms } from "@/data/terms";
import CourseAddModalClient from "./course-add-client";

export default async function CourseAddModal() {
	const terms = await getTerms();

	return <CourseAddModalClient termsRes={terms} />;
}
