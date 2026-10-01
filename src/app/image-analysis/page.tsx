/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { AlertIcon, CheckIcon, Spinner, UploadIcon } from "@/components/Icons";

export default function Home() {
    const [files, setFiles] = useState<FileList | null>(null);
    const [prompt, setPrompt] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files);
        }
    };

    const onButtonClick = () => {
        fileInputRef.current?.click();
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!files?.length) { setError("Please select at least one image."); return; }
        setLoading(true);
        const fd = new FormData();
        Array.from(files).forEach((f) => fd.append("images", f));
        fd.append("prompt", prompt);
        try {
            const res = await fetch("/ai-image-analyzer/api/analyze", { method: "POST", body: fd });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Request failed: ${res.status}`);
            }
            const json = await res.json();
            setResult(json);
        } catch (e: any) {
            setError(e.message || "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    const saveReport = async () => {
        if (!result?.report) return;
        setLoading(true);
        try {
            const imageMeta = files ? Array.from(files).map(f => ({
                filename: f.name,
                mimeType: f.type,
                size: f.size
            })) : [];

            const res = await fetch("/ai-image-analyzer/api/save-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: result.report.title,
                    prompt: prompt,
                    findings: {
                        summary: result.report.summary,
                        findings: result.report.findings
                    },
                    images: imageMeta
                })
            });

            const data = await res.json();
            alert("Report saved successfully!");
            router.push(`/reports/${data.id}`);
        } catch (e: any) {
            setError(e.message || "Failed to save report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl">
            <PageHeader
                title="New Report"
                description="Upload images of property defects or conditions to generate an inspection report."
                actions={
                    <Link href="/reports" className="btn-secondary">
                        Back to Reports
                    </Link>
                }
            />

            <div className="card p-6 sm:p-8">
                <form onSubmit={onSubmit} className="space-y-7">
                    <div>
                        <span className="label">Images</span>
                        <div
                            className={`rounded-lg border border-dashed p-8 text-center transition-colors ${
                                dragActive ? "border-accent bg-accent-soft" : "border-line hover:border-accent/50 hover:bg-surface-2"
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                className="hidden"
                                id="file_input"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleChange}
                            />
                            <UploadIcon className="mx-auto mb-3 text-muted" width={24} height={24} />
                            <p className="text-sm font-medium">
                                Drag and drop images here, or{" "}
                                <button type="button" onClick={onButtonClick} className="font-semibold text-accent hover:underline">
                                    browse
                                </button>
                            </p>
                            <p className="mt-1 text-xs text-muted">Supports JPG, PNG, WEBP</p>
                        </div>

                        {files && files.length > 0 && (
                            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                                {Array.from(files).map((file, idx) => (
                                    <li
                                        key={idx}
                                        className="flex aspect-square items-center justify-center rounded-lg border border-line bg-surface-2 p-2 text-center text-xs text-muted break-all"
                                    >
                                        {file.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div>
                        <label htmlFor="prompt" className="label">
                            Analysis instructions <span className="font-normal text-muted">(optional)</span>
                        </label>
                        <textarea
                            id="prompt"
                            rows={4}
                            className="input resize-none"
                            placeholder="E.g., 'Focus on the water damage on the ceiling', 'Check for structural cracks', 'Assess the condition of the roof shingles'..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    <button disabled={loading || !files?.length} type="submit" className="btn-primary w-full py-3">
                        {loading ? (
                            <>
                                <Spinner />
                                Analyzing images...
                            </>
                        ) : (
                            "Generate Inspection Report"
                        )}
                    </button>
                </form>

                {error && (
                    <div className="alert-error mt-6 flex items-start gap-2.5" role="alert">
                        <AlertIcon className="mt-0.5 shrink-0" width={18} height={18} />
                        <p>{error}</p>
                    </div>
                )}

                {result && (
                    <section className="mt-10 border-t border-line pt-8">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold">Analysis Result</h2>
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                                <CheckIcon width={14} height={14} />
                                Analysis complete
                            </span>
                        </div>

                        <div className="max-h-[32rem] overflow-y-auto rounded-lg border border-line bg-surface-2 p-6">
                            <h3 className="text-lg font-semibold">{result.report.title}</h3>
                            <p className="mb-5 mt-1 text-sm italic text-muted">{result.report.summary}</p>

                            <h4 className="mb-2 text-sm font-semibold">Key findings</h4>
                            <ul className="list-disc space-y-2 pl-5 text-sm">
                                {result.report.findings.map((finding: any, idx: number) => (
                                    <li key={idx}>
                                        <span className="font-medium">{finding.area}:</span> {finding.observation}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={saveReport} disabled={loading} className="btn-primary">
                                {loading ? "Saving..." : "Save Report to Dashboard"}
                            </button>
                        </div>

                        <p className="mt-4 text-center text-xs text-muted">
                            Disclaimer: This is an AI-generated analysis and should be verified by a certified professional.
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}
