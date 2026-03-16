"use client";

import clsx from "clsx";
import {
	ArchiveRestore,
	FileCheckCorner,
	FileInput,
	FileUp,
	FileXCorner,
	LoaderCircle,
} from "lucide-react";
import { useState } from "react";
import z from "zod";
import useUserStore from "@/stores/user-store";
import {
	type UserStorePersist,
	userStorePersistSchema,
} from "@/types/user-store";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "../ui/field";

const fileInputCombos = {
	default: {
		text: "Drag and drop a backup file, or click here",
		icon: FileInput,
	},
	hovering: { text: "Upload backup file", icon: FileUp },
	dropped: { text: "Uploading...", icon: LoaderCircle },
	verifying: { text: "Verifying contents...", icon: LoaderCircle },
	success: {
		text: "Backup file valid & ready to import",
		icon: FileCheckCorner,
	},
	error: { text: "Backup file invalid", icon: FileXCorner },
};

enum FileInputStage {
	DEFAULT,
	HOVER,
	DROP,
	VERIFY,
	SUCCESS,

	ERROR = -1,
}

type DragEvent = React.DragEvent<HTMLLabelElement>;

export function ImportItem({
	setOpen,
}: {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	return (
		<DropdownMenuItem onClick={() => setOpen(true)}>
			Import Backup
			<ArchiveRestore />
		</DropdownMenuItem>
	);
}

export function ImportItemModal({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const [fileInputText, setFileInputText] = useState(
		fileInputCombos.default.text,
	);
	const [FileInputIcon, setFileInputIcon] = useState<
		React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>
	>(fileInputCombos.default.icon);
	const [fileInputStage, setFileInputStage] = useState(FileInputStage.DEFAULT);
	const [parsedData, setParsedData] = useState<UserStorePersist | null>(null);

	const [ackDisclaimer, setAckDisclaimer] = useState(false);

	const onDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "copy";
	};

	const onDragEnter = (e: DragEvent) => {
		e.preventDefault();
		setFileInputStage(FileInputStage.HOVER);
		setFileInputText(fileInputCombos.hovering.text);
		setFileInputIcon(fileInputCombos.hovering.icon);
	};

	const onDragLeave = (e: DragEvent) => {
		e.preventDefault();
		setFileInputStage(FileInputStage.DEFAULT);
		setFileInputText(fileInputCombos.default.text);
		setFileInputIcon(fileInputCombos.default.icon);
	};

	const onFileDrop = (e: DragEvent) => {
		e.preventDefault();
		setFileInputStage(FileInputStage.DROP);
		setFileInputText(fileInputCombos.dropped.text);
		setFileInputIcon(fileInputCombos.dropped.icon);

		const files = e.dataTransfer.files;
		const input = document.getElementById("backup-file") as HTMLInputElement;

		input.files = files;
		input.dispatchEvent(new Event("change", { bubbles: true }));
	};

	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFileInputStage(FileInputStage.VERIFY);
		setFileInputText(fileInputCombos.verifying.text);
		setFileInputIcon(fileInputCombos.verifying.icon);

		const reader = new FileReader();
		const files = e.target.files;

		if (files) {
			if (files.length !== 1) {
				errorFileInput("Please select a single backup file");
				return;
			}

			if (files[0].type !== "text/plain") {
				errorFileInput("File type was not recognized");
				return;
			}

			reader.onload = (e) => {
				const base64Data = e.target?.result as string;
				if (!base64Data) {
					errorFileInput("File could not be read");
					return;
				}

				const data = Buffer.from(base64Data, "base64").toString("utf-8");
				if (!data) {
					errorFileInput("File could not be read");
					return;
				}

				try {
					const jsonParsed = JSON.parse(data);
					const schemaParsed = userStorePersistSchema.parse(jsonParsed);
					setParsedData(schemaParsed);

					setFileInputStage(FileInputStage.SUCCESS);
					setFileInputText(fileInputCombos.success.text);
					setFileInputIcon(fileInputCombos.success.icon);

					return;
				} catch (error) {
					if (error instanceof z.ZodError) {
						errorFileInput("Backup contents are invalid");
					} else {
						errorFileInput();
					}

					console.error(error);
					return;
				}
			};

			reader.onerror = (e) => {
				errorFileInput();
				console.error(e);
				return;
			};

			reader.readAsText(files[0]);
		} else {
			errorFileInput("No files selected");
			return;
		}
	};

	const errorFileInput = (description?: string) => {
		setFileInputStage(FileInputStage.ERROR);
		setFileInputText(description ?? fileInputCombos.error.text);
		setFileInputIcon(fileInputCombos.error.icon);
	};

	const handleModalState = (open: boolean) => {
		setOpen(open);

		if (!open) {
			setAckDisclaimer(false);
			setFileInputStage(FileInputStage.DEFAULT);
			setFileInputText(fileInputCombos.default.text);
			setFileInputIcon(fileInputCombos.default.icon);
		}
	};

	const finishImport = () => {
		if (!parsedData) {
			return;
		}

		useUserStore.setState(parsedData.user.state);
		handleModalState(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={handleModalState}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Restore From Backup</AlertDialogTitle>
				</AlertDialogHeader>

				<FieldSet>
					<FieldGroup>
						<Field>
							<label
								htmlFor="backup-file"
								className={clsx(
									"cursor-pointer flex flex-col items-center justify-center gap-2 rounded-lg border border-border border-dashed py-12",
									{
										"border-primary/50 text-primary":
											fileInputStage === FileInputStage.HOVER ||
											fileInputStage === FileInputStage.DROP ||
											fileInputStage === FileInputStage.VERIFY,
										"border-success/50 text-success":
											fileInputStage === FileInputStage.SUCCESS,
										"border-destructive/50 text-destructive":
											fileInputStage === FileInputStage.ERROR,
									},
								)}
								onDragOver={onDragOver}
								onDragEnter={onDragEnter}
								onDragLeave={onDragLeave}
								onDrop={onFileDrop}
							>
								<FileInputIcon
									className={clsx("pointer-events-none", {
										"animate-spin":
											fileInputStage === FileInputStage.DROP ||
											fileInputStage === FileInputStage.VERIFY,
									})}
								/>
								<span className="text-sm pointer-events-none">
									{fileInputText}
								</span>
							</label>
							<input
								id="backup-file"
								type="file"
								name="backup-file-input"
								accept="text/plain"
								max={1}
								className="hidden"
								onChange={onFileChange}
							/>
							<FieldDescription>
								Select a backup file to restore from.
							</FieldDescription>
						</Field>

						<Field orientation="horizontal">
							<Checkbox id="ack" onCheckedChange={setAckDisclaimer} />
							<FieldLabel htmlFor="ack" className="gap-1">
								I acknowledge that continuing will <b>overwrite all</b> current
								schedules.
							</FieldLabel>
						</Field>
					</FieldGroup>
				</FieldSet>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel Import</AlertDialogCancel>
					<AlertDialogAction
						disabled={
							!ackDisclaimer || fileInputStage !== FileInputStage.SUCCESS
						}
						onClick={finishImport}
					>
						Import Data
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
