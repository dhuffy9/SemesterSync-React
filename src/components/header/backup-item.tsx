"use client";

import { Archive } from "lucide-react";
import { useState } from "react";
import useUserStore from "@/stores/user-store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export function BackupItem({
	setOpen,
}: {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	return (
		<DropdownMenuItem onClick={() => setOpen(true)}>
			Backup Data
			<Archive />
		</DropdownMenuItem>
	);
}

export function BackupItemModal({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const [backupSuccess, setBackupSuccess] = useState(false);
	const store = useUserStore;

	const createBackup = async () => {
		//data fetch
		const state = JSON.stringify(store.getState());
    const userSchemaVersion = 1; 
		const backupVersion = 1;

		if (state.length === 0) {
			alert("No data to backup");
			return;
		}

		//data encoding
		const data = `{"user":{"state":${state},"schemaVersion":${userSchemaVersion}},"version":${backupVersion}}`;
		const encoded = Buffer.from(data).toString("base64");
		const blob = new Blob([encoded], { type: "text/plain" });

		// data download
		const a = document.createElement("a");
		a.href = window.URL.createObjectURL(blob);
		a.download = "semester-sync-backup.txt";
		a.dataset.downloadurl = ["text/plain", a.download, a.href].join(":");

		a.style.display = "none";
		document.body.appendChild(a);

		a.click();

		document.body.removeChild(a);
		setTimeout(() => {
			URL.revokeObjectURL(a.href);
			setBackupSuccess(true);
		}, 100);
	};

	const handleOpenChange = (open: boolean) => {
		setOpen(open);

		if (!open) {
			setBackupSuccess(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className={backupSuccess ? "ring-success/30" : ""}>
				<DialogHeader>
					<DialogTitle>Backup Data</DialogTitle>
				</DialogHeader>

				<div>
					<Accordion defaultValue={["what-do"]}>
						<AccordionItem value="what-do">
							<AccordionTrigger>What does a backup do?</AccordionTrigger>
							<AccordionContent>
								Creating a backup will provide you with a file containing all of
								the tabs and schedules that you have created.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="why-do">
							<AccordionTrigger>Why should I create a backup?</AccordionTrigger>
							<AccordionContent>
								Creating a backup will help prevent against data loss should
								your browser ever have issues. You can also use backups to
								transfer your schedules to a new browser, or to another one of
								your devices.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="how-often">
							<AccordionTrigger>
								How often should I create a backup?
							</AccordionTrigger>
							<AccordionContent>
								You should create a backup every time you make any significant
								changes so if you ever need to restore it is as close to
								up-to-date.
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>

				<DialogFooter>
					<Button
						variant="destructive"
						className={backupSuccess ? "hidden" : ""}
						onClick={() => setOpen(false)}
					>
						Cancel Backup
					</Button>
					<Button
						variant={backupSuccess ? "success" : "default"}
						disabled={backupSuccess}
						onClick={createBackup}
					>
						{backupSuccess ? "Backup Created" : "Create Backup"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
