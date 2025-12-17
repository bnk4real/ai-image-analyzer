/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { title, prompt, findings, images } = await req.json();

        if (!title || !findings) {
            return NextResponse.json({ error: "Title and findings are required" }, { status: 400 });
        }

        const report = await prisma.report.create({
            data: {
                title,
                prompt,
                findings,
                images: {
                    create: images.map((img: any) => ({
                        filename: img.filename,
                        mimeType: img.mimeType,
                        size: img.size,
                    })),
                },
            },
            include: {
                images: true,
            },
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error("Error saving report:", error);
        return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
    }
}
