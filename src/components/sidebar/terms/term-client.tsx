"use client";

import { ChevronDown } from "lucide-react";
import type { TermTableResult } from "@/db/schemas/terms";
import useUserStore from "@/stores/user-store";
import { Button } from "../../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export default function TermDropdownClient({
	terms,
}: {
	terms: Array<TermTableResult>;
}) {
	const selectedTerm = useUserStore((state) => state.activeTerm);
	const setSelectedTerm = useUserStore((state) => state.setActiveTerm);

	// const { data, isLoading, isError } = useQuery(termQueryOptions);
	// const [terms, setTerms] = useState<Array<Term>>([]);

	// useEffect(() => {
	// 	if (data?.data.terms) {
	// 		setTerms(data?.data.terms);
	// 	}
	// }, [data]);

	// if (isLoading) return <Skeleton className="w-full h-8" />;

	// if (isError)
	// 	return (
	// 		<p className="text-destructive bg-destructive/20 rounded-lg text-xs py-2 w-full text-center">
	// 			Error Loading Terms
	// 		</p>
	// 	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="outline" className="justify-between w-full" />}
			>
				<span>
					{selectedTerm
						? terms.find((term) => term.term_code === selectedTerm)?.term_name
						: "Select Term"}
				</span>
				<ChevronDown />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuRadioGroup value={selectedTerm}>
					{terms.map((term) => (
						<DropdownMenuRadioItem
							key={term.term_code}
							value={term.term_code}
							onClick={() => setSelectedTerm(term.term_code)}
						>
							{term.term_name}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
