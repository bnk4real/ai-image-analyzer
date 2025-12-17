/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GOOGLE_API_KEY is not set" }, { status: 500 });
        }

        // The SDK doesn't have a direct listModels method, so we'll fetch it manually.
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
            headers: {
                'x-goog-api-key': apiKey,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: `Failed to list models: ${errorText}` }, { status: response.status });
        }

        const data = await response.json();

        // Filter for models that support 'generateContent'
        const supportedModels = data.models.filter((model: any) =>
            model.supportedGenerationMethods.includes('generateContent')
        );

        return NextResponse.json({ models: supportedModels });
    } catch (e: any) {
        console.error("Error listing models:", e);
        return NextResponse.json(
            { error: e.message || "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
