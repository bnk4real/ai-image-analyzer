/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

// Helper component to parse and format the report content
const FormattedReport = ({ content }: { content: string }) => {
    if (!content) return null;

    // Split content into lines
    const lines = content.split('\n');

    const formatLine = (line: string) => {
        // Replace **text** with <strong>text</strong> for bolding
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Replace [text] with a placeholder style
        line = line.replace(/\[(.*?)\]/g, '<span class="text-gray-500 italic">[$1]</span>');
        return line;
    };

    return (
        <div className="prose prose-sm max-w-none">
            {lines.map((line, index) => {
                const trimmedLine = line.trim();

                if (trimmedLine.startsWith('---')) {
                    return <hr key={index} className="my-6 border-gray-300" />;
                }
                // Main section headers like "1. Inspection Details"
                if (trimmedLine.match(/^\d+\.\s/)) {
                    return <h3 key={index} className="text-xl font-semibold mt-6 mb-3" dangerouslySetInnerHTML={{ __html: formatLine(trimmedLine) }} />;
                }
                // Sub-section headers like "* 3.1. Roof Surface/Field"
                if (trimmedLine.match(/^\*\s\d+\.\d+\./)) {
                    return <h4 key={index} className="text-lg font-semibold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: formatLine(trimmedLine.substring(2)) }} />;
                }
                // List items like "* Date of Inspection: [YYYY-MM-DD]"
                if (trimmedLine.startsWith('*')) {
                    return <p key={index} className="ml-4" dangerouslySetInnerHTML={{ __html: formatLine(trimmedLine) }} />;
                }
                // Render other lines as paragraphs
                return <p key={index} dangerouslySetInnerHTML={{ __html: formatLine(line) }} />;
            })}
        </div>
    );
};


export default function RoofingReportPage() {
    const [prompt, setPrompt] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateDescription = async () => {
        setLoading(true);
        setDescription("");
        setError(null);
        try {
            const response = await fetch("/api/roofing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate description");
            }

            setDescription(data.description || "No description generated.");
        } catch (error: any) {
            console.error("Error generating description:", error);
            setError(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Roofing Report Description Generator</h1>
                <div className="bg-white shadow-lg rounded-lg p-8">
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        rows={5}
                        placeholder="e.g., 'The house has a 15-year-old architectural shingle roof. There are visible signs of hail damage on the south slope and the gutters are clogged with leaves.'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                        onClick={generateDescription}
                        disabled={loading || !prompt}
                    >
                        {loading ? "Generating..." : "Generate Description"}
                    </button>
                </div>

                {error && (
                    <div className="mt-8 p-4 border-l-4 border-red-500 bg-red-100 text-red-700">
                        <p>{error}</p>
                    </div>
                )}

                {description && (
                    <div className="mt-8 p-8 border rounded-lg bg-white shadow-md">
                        <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Generated Report</h2>
                        <FormattedReport content={description} />
                    </div>
                )}
            </div>
        </div>
    );
}