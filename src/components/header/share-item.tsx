import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {LinkIcon} from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
    AlertDialogDescription
} from "../ui/alert-dialog";

export function ShareItem({
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

export function ShareItemModal({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {

    console.log("ShareItemModal open:", open);
    const [shareSuccess, setShareSuccess] = useState(false);
    
    const [expiration, setExpiration] = useState("24");
    const [permission, setPermission] = useState<"view" | "edit">("view");

    const handleCreateLink = () => {
        setShareSuccess(true);
        console.log("Creating share link:", { expiration, permission });
    };

    const handleModalState = (open: boolean) => {
		setOpen(open);

		if (!open) {
            setShareSuccess(false);
		}
	};
    return (
        <AlertDialog open={open} onOpenChange={handleModalState}>
              <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Share Your Schedule
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Choose how people can access your schedule.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-6 py-4">
                    {/* Link expiration */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Link expiration
                        </label>

                        <select
                            value={expiration}
                            onChange={(event) =>
                                setExpiration(event.target.value)
                            }
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        >
                            <option value="1">1 hour</option>
                            <option value="24">1 day</option>
                            <option value="168">7 days</option>
                            <option value="720">30 days</option>
                            <option value="never">Never</option>
                        </select>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-3">
<label className="text-sm font-medium">
                            Permissions
                        </label>

                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                            <input
                                type="radio"
                                name="permission"
                                value="view"
                                checked={permission === "view"}
                                onChange={(event) =>
                                    setPermission(event.target.value as "view" | "edit")
                                }
                                className="mt-1"
                            />

                            <div>
                                <p className="text-sm font-medium">
                                    View only
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    People can view your schedule but cannot
                                    make changes.
                                </p>
                            </div>
                        </label>

                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
                            <input
                                type="radio"
                                name="permission"
                                value="edit"
                                checked={permission === "edit"}
                                onChange={(event) =>
                                    setPermission(event.target.value as "view" | "edit")
                                }
                                className="mt-1"
                            />

                            <div>
                                <p className="text-sm font-medium">
                                    Can edit
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    People can make changes to the shared
                                    schedule.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction onClick={handleCreateLink}>
                        Create Link
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>

        </AlertDialog>
    );
}
