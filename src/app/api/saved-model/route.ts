import { NextResponse } from "next/server";
import { getSavedModel } from "@/lib/repositories/aiModelsRepository";

export async function GET() {
    try {
        const model = await getSavedModel();
        return NextResponse.json({ model });
    } catch (error) {
        console.error("Error fetching saved model:", error);
        return NextResponse.json({ error: "Failed to fetch saved model" }, { status: 500 });
    }
}
