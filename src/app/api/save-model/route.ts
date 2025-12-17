import { NextResponse } from "next/server";
import { saveModel } from "@/lib/repositories/aiModelsRepository";

export async function POST(req: Request) {
    try {
        const { model } = await req.json();
        if (!model) {
            return NextResponse.json({ error: "Model name is required" }, { status: 400 });
        }

        const savedModel = await saveModel(model);

        return NextResponse.json(savedModel);
    } catch (error) {
        console.error("Error saving model:", error);
        return NextResponse.json({ error: "Failed to save model" }, { status: 500 });
    }
}