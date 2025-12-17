import { NextResponse } from "next/server";
import { fetchUsers } from "@/lib/repositories/userService";

export async function GET() {
    try {
        const users = await fetchUsers();

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error in API route:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}