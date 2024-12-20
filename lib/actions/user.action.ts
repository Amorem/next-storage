"use server";

import { Models, Query, ID } from "node-appwrite";
import User = Models.User;
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

export async function createAccount({
	fullName,
	email,
}: {
	fullName: string;
	email: string;
}) {
	const existingUser = await getUserByEmail(email);

	const accountId = await sendEmailOTP({ email });
	if (!accountId) {
		throw new Error("Failed to send an OTP");
	}

	if (!existingUser) {
		const { databases } = await createAdminClient();
		await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.usersCollectionId,
			ID.unique(),
			{
				fullName,
				email,
				avatar: avatarPlaceholderUrl,
				accountId,
			}
		);
	}

	return parseStringify({ accountId });
}

async function getUserByEmail(email: string): Promise<User> {
	const { databases } = await createAdminClient();
	const result = await databases.listDocuments(
		appwriteConfig.databaseId,
		appwriteConfig.usersCollectionId,
		[Query.equal("email", [email])]
	);
	return result.total > 0 ? result.documents[0] : null;
}

export async function sendEmailOTP({ email }: { email: string }) {
	const { account } = await createAdminClient();
	try {
		const session = await account.createEmailToken(ID.unique(), email);
		return session.userId;
	} catch (error) {
		handleError(error, "Failed to send email OTP");
	}
}

function handleError(error: unknown, message: string) {
	console.log(error, message);
	throw error;
}

export async function verifySecret({
	secret,
	accountId,
}: {
	secret: string;
	accountId: string;
}) {
	try {
		const { account } = await createAdminClient();
		const session = await account.createSession(accountId, secret);
		(await cookies()).set("appwrite-session", session.secret, {
			path: "/",
			httpOnly: true,
			sameSite: "strict",
			secure: true,
		});
		return parseStringify({ sessionId: session.$id });
	} catch (error) {
		handleError(error, "Failed to verify OTP");
	}
}

export async function getCurrentUser() {
	const { databases, account } = await createSessionClient();
	const result = await account.get();

	const user = await databases.listDocuments(
		appwriteConfig.databaseId,
		appwriteConfig.usersCollectionId,
		[Query.equal("accountId", result.$id)]
	);

	if (user.total === 0) return null;

	return parseStringify(user.documents[0]);
}

export async function signOutUser() {
	const { account } = await createSessionClient();
	try {
		await account.deleteSession("current");
		(await cookies()).delete("appwrite-session");
	} catch (error) {
		handleError(error, "Failed to sign out");
	} finally {
		redirect("/sign-in");
	}
}

export async function signInUser({ email }: { email: string }) {
	try {
		const existingUser = await getUserByEmail(email);
		if (!existingUser) {
			return parseStringify({ accountId: null, error: "User not found" });
		}
		if (existingUser) {
			await sendEmailOTP({ email });
			return parseStringify({ accountId: existingUser.accountId });
		}
	} catch (error) {
		handleError(error, "Failed to sign in");
	}
}
