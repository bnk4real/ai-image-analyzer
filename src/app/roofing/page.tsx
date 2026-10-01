/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { AlertIcon, Spinner } from "@/components/Icons";

// Helper component to parse and format the report content
const FormattedReport = ({ content }: { content: string }) => {
    if (!content) return null;

    // Split content into lines
    const lines = content.split('\n');

    const formatLine = (line: string) => {
        // Replace **text** with <strong>text</strong> for bolding
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Replace [text] with a placeholder style
        line = line.replace(/\[(.*?)\]/g, '<span class="text-muted italic">[$1]</span>');
        return line;
    };

    return (
        <div className="space-y-2 text-sm leading-relaxed">
            {lines.map((line, index) => {
                const trimmedLine = line.trim();

                if (trimmedLine.startsWith('---')) {
                    return <hr key={index} className="my-6 border-line" />;
                }
                // Main section headers like "1. Inspection Details"
                if (trimmedLine.match(/^\d+\.\s/)) {
                    return <h3 key={index} className="mb-3 mt-6 text-lg font-semibold" dangerouslySetInnerHTML={{ __html: formatLine(trimmedLine) }} />;
                }
                // Sub-section headers like "* 3.1. Roof Surface/Field"
                if (trimmedLine.match(/^\*\s\d+\.\d+\./)) {
                    return <h4 key={index} className="mb-2 mt-4 text-base font-semibold" dangerouslySetInnerHTML={{ __html: formatLine(trimmedLine.substring(2)) }} />;
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
            const response = await fetch("/ai-image-analyzer/api/roofing", {
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
        <div className="mx-auto max-w-3xl">
            <PageHeader
                title="Roofing Report"
                description="Describe the roof and let AI draft the report description."
            />

            <div className="card p-6 sm:p-8">
                <label htmlFor="roofing-prompt" className="label">
                    Roof details
                </label>
                <textarea
                    id="roofing-prompt"
                    className="input mb-4 resize-none"
                    rows={5}
                    placeholder="e.g., 'The house has a 15-year-old architectural shingle roof. There are visible signs of hail damage on the south slope and the gutters are clogged with leaves.'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <button className="btn-primary w-full py-3" onClick={generateDescription} disabled={loading || !prompt}>
                    {loading ? (
                        <>
                            <Spinner />
                            Generating...
                        </>
                    ) : (
                        "Generate Description"
                    )}
                </button>
            </div>

            {error && (
                <div className="alert-error mt-6 flex items-start gap-2.5" role="alert">
                    <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
                    <p>{error}</p>
                </div>
            )}

            {description && (
                <div className="card mt-6 p-6 sm:p-8">
                    <h2 className="mb-5 border-b border-line pb-3 text-lg font-semibold">Generated Report</h2>
                    <FormattedReport content={description} />
                </div>
            )}
        </div>
    );
}
