"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { termQueryOptions } from "@/queries/terms";
import useUserStore from "@/stores/user-store";
import type { Term } from "@/types/terms";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";

export default function TermDropdown() {
	const selectedTerm = useUserStore((state) => state.activeTerm);
	const setSelectedTerm = useUserStore((state) => state.setActiveTerm);

	const { data, isLoading, isError } = useQuery(termQueryOptions);
	const [terms, setTerms] = useState<Array<Term>>([]);

	useEffect(() => {
		if (data?.data.terms) {
			setTerms(data?.data.terms);
		}
	}, [data]);

	if (isLoading) return <Skeleton className="w-full h-8" />;

	if (isError)
		return (
			<p className="text-destructive bg-destructive/20 rounded-lg text-xs py-2 w-full text-center">
				Error Loading Terms
			</p>
		);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="outline" className="justify-between w-full" />}
			>
				<span>
					{selectedTerm
						? terms.find((term) => term.termCode === selectedTerm)?.displayName
						: "Select Term"}
				</span>
				<ChevronDown />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuRadioGroup value={selectedTerm}>
					{terms.map((term) => (
						<DropdownMenuRadioItem
							key={term.termCode}
							value={term.termCode}
							onClick={() => setSelectedTerm(term.termCode)}
						>
							{term.displayName}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
