"use client";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function MobileNavigation({
	ownerId,
	accountId,
	fullName,
	avatar,
	email,
}: {
	ownerId: string;
	accountId: string;
	fullName: string;
	avatar: string;
	email: string;
}) {
	const [open, setOpen] = useState(false);
	const { pathname } = usePathname();
	return (
		<header className="mobile-header">
			<Image
				src="/assets/icons/logo-full-brand.svg"
				alt="Logo"
				width={120}
				height={52}
				className="h-auto"
			/>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger>
					<Image
						src="/assets/icons/menu.svg"
						alt="menu"
						width={30}
						height={30}
					/>
				</SheetTrigger>
				<SheetContent className="shad-sheet h-screen px-3">
					<SheetTitle>
						<div className="header-user">
							<Image
								src={avatar}
								alt="Avatar"
								width={44}
								height={44}
								className="header-user-avatar"
							/>
						</div>
					</SheetTitle>
				</SheetContent>
			</Sheet>
		</header>
	);
}
