import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {LinkIcon} from "lucide-react";

export default function ShareItem({
    setOpen,
}: {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    return (
        <DropdownMenuItem onClick={() => setOpen(true)}>
            Share
            <LinkIcon />
        </DropdownMenuItem>
    );
}