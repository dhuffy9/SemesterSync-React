"use client";

import { LinkIcon, Share } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import ShareItem from "./share-item";
import { BackupItem, BackupItemModal } from "./backup-item";
import { ImportItem, ImportItemModal } from "./import-item";

export default function ShareDropdown() {
	const [shareOpen, setShareOpen] = useState(false);
	const [backupOpen, setBackupOpen] = useState(false);
	const [importOpen, setImportOpen] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button size={"icon"} />}>
					<Share />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" side="top" className="w-36">
					<ShareItem setOpen={setShareOpen} />
					<Separator />

					<BackupItem setOpen={setBackupOpen} />
					<ImportItem setOpen={setImportOpen} />
				</DropdownMenuContent>
			</DropdownMenu>

			<BackupItemModal open={backupOpen} setOpen={setBackupOpen} />
			<ImportItemModal open={importOpen} setOpen={setImportOpen} />
		</>
	);
}
