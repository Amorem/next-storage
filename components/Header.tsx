import { signOutUser } from "@/lib/actions/user.action";
import FileUploader from "./FileUploader";
import Search from "./Search";
import { Button } from "./ui/button";
import Image from "next/image";

export default function Header() {
	return (
		<header className="header">
			<Search />
			<div className="header-wrapper">
				<FileUploader />
				<form
					action={async function () {
						"use server";
						await signOutUser();
					}}
				>
					<Button type="submit" className="sign-out-button">
						<Image
							src="/assets/icons/logout.svg"
							alt="logo"
							width={24}
							height={24}
							className="w-6"
						/>
					</Button>
				</form>
			</div>
		</header>
	);
}
