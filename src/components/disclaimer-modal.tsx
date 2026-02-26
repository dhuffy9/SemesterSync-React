"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";
import { Checkbox } from "./ui/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./ui/collapsible";
import { Field, FieldLabel } from "./ui/field";
import { ScrollArea } from "./ui/scroll-area";

export default function DisclaimerModal() {
	const [open, setOpen] = useState(false);
	const [dismissedDisclaimer, setDismissedDisclaimer] = useState(false);
	const [howToOpen, setHowToOpen] = useState(false);

	useEffect(() => {
		const didDismiss = localStorage.getItem("dismissed-disclaimer") === "true";

		setDismissedDisclaimer(didDismiss);
		setOpen(!didDismiss);
	}, []);

	useEffect(() => {
		localStorage.setItem(
			"dismissed-disclaimer",
			dismissedDisclaimer.toString(),
		);
	}, [dismissedDisclaimer]);

	return (
		<AlertDialog open={open}>
			<AlertDialogContent className="sm:max-w-2xl">
				<AlertDialogHeader>
					<AlertDialogTitle>Important Notice</AlertDialogTitle>
				</AlertDialogHeader>

				<ScrollArea className="max-h-[70dvh]">
					<div className="gap-4 flex flex-col">
						<h2 className="font-bold text-xl">
							This website is not affiliated with the school
						</h2>

						<Collapsible
							className="bg-accent rounded-md p-2"
							onOpenChange={setHowToOpen}
						>
							<CollapsibleTrigger
								render={
									<button
										type="button"
										className="flex justify-between w-full cursor-pointer"
									/>
								}
							>
								<p>How to Add a Course</p>
								<ChevronDown
									className={clsx("transition-all", {
										"rotate-180": howToOpen,
									})}
								/>
							</CollapsibleTrigger>
							<CollapsibleContent className="mt-2 pt-2 border border-t-border border-transparent">
								<ol className="list-decimal list-inside space-y-2">
									<li>
										Click the <b>New Course</b> button
									</li>
									<li>Search the course to autofill</li>
									<li>
										Or add manually the
										<ol className="list-[lower-alpha] list-inside ml-4">
											<li>Course number</li>
											<li>Course title</li>
											<li>Instructor</li>
											<li>Credits</li>
											<li>Days</li>
											<li>Start/end time</li>
											<li>
												Term name/number{" "}
												<span className="text-muted-foreground">
													(optional; but recommended)
												</span>
											</li>
											<li>
												Term start/end time{" "}
												<span className="text-muted-foreground">
													(recommended so seamsters don't overlap)
												</span>
											</li>
										</ol>
									</li>
								</ol>
							</CollapsibleContent>
						</Collapsible>
					</div>

					<AlertDialogDescription className="pt-2">
						If you find bugs or want to suggest new features please email{" "}
						<MailTo email="djh61@pct.edu" /> or <MailTo email="nxt19@pct.edu" />
					</AlertDialogDescription>
				</ScrollArea>

				<AlertDialogFooter className="justify-between">
					<Field orientation="horizontal">
						<Checkbox
							id="show-again"
							checked={dismissedDisclaimer}
							onCheckedChange={setDismissedDisclaimer}
						/>
						<FieldLabel
							htmlFor="show-again"
							className="text-muted-foreground w-max"
						>
							Don't show this again
						</FieldLabel>
					</Field>
					<AlertDialogAction onClick={() => setOpen(false)}>
						Close
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function MailTo({ email }: { email: string }) {
	return (
		<a
			href={`mailto:${email}`}
			className="text-primary hover:underline focus-visible:underline"
		>
			{email}
		</a>
	);
}
