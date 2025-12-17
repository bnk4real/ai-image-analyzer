/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSavedModel } from "@/lib/repositories/aiModelsRepository";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required." },
                { status: 400 }
            );
        }

        const savedModel = await getSavedModel();
        if (savedModel) {
            console.log("Using saved model");
        } else {
            console.log("No saved model found, using default.");
        }

        const model = genAI.getGenerativeModel({ model: savedModel ? savedModel.name : "gemini-2.5-flash" });
        // Sample: Write a template for roofing observation in 200 words. Be concise and punctual.
        const fullPrompt = `Generate a detailed description for a roofing inspection report based on the following prompt: ${prompt}`;

        const result = await model.generateContent(fullPrompt);

        const textResponse = result.response.text();

        return NextResponse.json({ description: textResponse });
    } catch (e: any) {
        console.error("Error in roofing API route:", e);
        return NextResponse.json(
            { error: e.message || "An unexpected error occurred." },
            { status: 500 }
        );
    }
}