/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("images") as File[];
        const prompt = (formData.get("prompt") as string) || "";

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: "Please select at least one image." },
                { status: 400 }
            );
        }

        const imageParts = await Promise.all(
            files.map(async (file) => {
                const buffer = Buffer.from(await file.arrayBuffer());
                const tempFilePath = path.join(os.tmpdir(), `upload-${crypto.randomUUID()}-${file.name}`);
                
                await writeFile(tempFilePath, buffer);
                
                try {
                    const uploadResult = await genAI.files.upload({
                        file: tempFilePath,
                        config: {
                            mimeType: file.type,
                            displayName: file.name,
                        },
                    });
                    return {
                        fileData: {
                            mimeType: uploadResult.mimeType,
                            fileUri: uploadResult.uri,
                        },
                    };
                } finally {
                    await unlink(tempFilePath).catch(console.error);
                }
            })
        );

        const generationConfig = {
            temperature: 0.4,
            topP: 1,
            topK: 32,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const fullPrompt = `
      You are an expert property inspector. Analyze the provided images and generate a detailed inspection report in JSON format. 
      The JSON object must have a single key "report" which contains "title", "summary", and an array of "findings". 
      Each object in the "findings" array should have "area", "observation", "implication", and "recommendation".
      ${prompt ? `The user has provided the following specific instructions: ${prompt}` : ""}
    `;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [...imageParts, { text: fullPrompt }] }],
            config: {
                ...generationConfig,
                safetySettings,
            }
        });

        const jsonResponse = result.text;
        const report = JSON.parse(jsonResponse || "{}");

        return NextResponse.json(report);

    } catch (e: any) {
        console.error("Error in API route:", e);
        return NextResponse.json(
            { error: e.message || "An unexpected error occurred during analysis." },
            { status: 500 }
        );
    }
}
