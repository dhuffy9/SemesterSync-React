import { ArchiveRestore } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function ImportItem() {
  return (
    <DropdownMenuItem>
      Import Backup
      <ArchiveRestore />
    </DropdownMenuItem>
  )
}