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
import { BackupItem, BackupItemModal } from "./backup-item";
import { ImportItem, ImportItemModal } from "./import-item";

export default function ShareDropdown() {
	const [backupOpen, setBackupOpen] = useState(false);
	const [importOpen, setImportOpen] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger render={<Button size={"icon"} />}>
					<Share />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" side="top" className="w-36">
					<DropdownMenuItem>
						Share
						<LinkIcon />
					</DropdownMenuItem>

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
