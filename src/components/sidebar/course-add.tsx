"use client";

import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { classByTermQuery } from "@/queries/courses";
import useUserStore from "@/stores/user-store";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export default function CourseAddModal() {
	const selectedTerm = useUserStore((state) => state.activeTerm);

	const { data, isLoading, isError } = useQuery(classByTermQuery(selectedTerm));

  console.log(data);

	return (
		<Dialog>
			<DialogTrigger render={<Button />}>
				<PlusIcon /> Add Course
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Course</DialogTitle>
				</DialogHeader>

				<DialogFooter>
					<Button variant="outline">Cancel</Button>
					<Button>Add Course</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
