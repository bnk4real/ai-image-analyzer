/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { signInWithUsernameAndPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function analyzeImages(formData: FormData): Promise<any> {
    const files = formData.getAll("images") as File[];
    const prompt = formData.get("prompt") as string;

    if (!files || files.length === 0) {
        return { error: "Please select at least one image." };
    }

    const fd = new FormData();
    files.forEach((file) => fd.append("images", file));
    fd.append("prompt", prompt);

    try {
        const res = await fetch("/api/analyze", {
            method: "POST",
            body: fd,
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Request failed: ${res.status}`);
        }

        const json = await res.json();
        return json;
    } catch (e: any) {
        return { error: e.message || "Unexpected error" };
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData
) {
    try {
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const user = await signInWithUsernameAndPassword(username, password);
        if (!user) {
            return "Invalid username or password.";
        }
    } catch (error) {
        console.error(error);
        return "An error occurred. Please try again.";
    }
    redirect("/dashboard");
}