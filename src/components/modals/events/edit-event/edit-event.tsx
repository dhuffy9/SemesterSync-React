"use client";

import { Edit } from "lucide-react";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { TermResponse } from "@/data/terms";
import useUserStore from "@/stores/user-store";
import type { CourseResponse } from "@/types/courses";
import EditLinkedEvent from "./edit-linked-event";
import EditPersonalEvent from "./edit-personal-event";
import EditUnlinkedEvent from "./edit-unlinked-event";

export type EventEditModalProps = {
	eventId: string;
	terms: TermResponse;
	courses: CourseResponse;

	trigger?: React.ReactNode;

	open?: boolean;
	onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;

	cancelOnClick?: () => void;
	actionSecondaryOnClick?: () => void;
};

export default function EditEventModal({
	eventId,
	terms,
	courses,

	trigger,

	open,
	onOpenChange,

	cancelOnClick,
	actionSecondaryOnClick,
}: EventEditModalProps) {
	const tabId = useUserStore((state) => state.activeTab);
	const eventData = useUserStore((state) => state.getEvent(tabId, eventId));

	if (!eventData || typeof courses === "number" || typeof terms === "number")
		return null;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			{trigger ? (
				trigger
			) : (
				<AlertDialogTrigger render={<Button variant="secondary" size="icon" />}>
					<Edit />
				</AlertDialogTrigger>
			)}

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Edit Event</AlertDialogTitle>
					{eventData.kind === "linked-course" && (
						<AlertDialogDescription className="text-wrap">
							Select a new course section from the list below. <br />{" "}
							<span className="text-xs">
								Note: You are not able to transform a linked course event to an
								unlinked course event at this time.
							</span>
						</AlertDialogDescription>
					)}
				</AlertDialogHeader>

				{eventData.kind === "linked-course" && (
					<EditLinkedEvent
						eventId={eventId}
						courses={courses}
						cancelOnClick={cancelOnClick}
						actionSecondaryOnClick={actionSecondaryOnClick}
					/>
				)}

				{eventData.kind === "unlinked-course" && (
					<EditUnlinkedEvent
						eventId={eventId}
						terms={terms}
						courses={courses}
						cancelOnClick={cancelOnClick}
						actionSecondaryOnClick={actionSecondaryOnClick}
					/>
				)}

				{eventData.kind === "personal" && (
					<EditPersonalEvent
						eventId={eventId}
						terms={terms}
						courses={courses}
						cancelOnClick={cancelOnClick}
						actionSecondaryOnClick={actionSecondaryOnClick}
					/>
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
}
