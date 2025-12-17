/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { prisma } from "@/lib/prisma";

export async function testDbConnection() {
    try {
        await prisma.$connect();
        return "Successfully connected to the database.";
    } catch (error: any) {
        return `Failed to connect to the database: ${error.message}`;
    } finally {
        await prisma.$disconnect();
    }
}
