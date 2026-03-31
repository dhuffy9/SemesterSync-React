import { getTerms } from "@/data/terms";
import TermDropdownClient from "./term-client";

export default async function TermDropdown() {
	const terms = await getTerms();

	return <TermDropdownClient terms={terms} />;
}
