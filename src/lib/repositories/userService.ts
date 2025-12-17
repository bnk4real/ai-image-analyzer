import { prisma } from "@/lib/prisma";

export async function fetchUsers() {
    try {
        return await prisma.people.findMany({

        });
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
}