import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "404 - Page Not Found",
	description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
	return (
		<html lang="en" className={inter.className}>
			<body className="bg-background text-foreground text-center w-full mt-[40%]">
				<h1 className="font-black ">404 - Page Not Found</h1>
				<p>This page does not exist.</p>
				<a href="/" className="hover:underline text-primary">
					Return Home
				</a>
			</body>
		</html>
	);
}
