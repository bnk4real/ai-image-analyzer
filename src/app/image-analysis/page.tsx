/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

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
        <main className="container mx-auto p-6 max-w-4xl">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-blue-600 p-6 text-white">
                    <h1 className="text-3xl font-bold">AI Image Analysis</h1>
                    <p className="mt-2 opacity-90">Upload images of property defects or conditions to generate a professional inspection report.</p>
                </div>
                
                <div className="p-8">
                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* File Upload Area */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Upload Images
                            </label>
                            <div 
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out ${
                                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
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
                                
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-700">
                                            Drag & drop images here, or <button type="button" onClick={onButtonClick} className="text-blue-600 hover:underline font-semibold">browse</button>
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG, WEBP</p>
                                    </div>
                                </div>
                            </div>

                            {/* File Preview List */}
                            {files && files.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Array.from(files).map((file, idx) => (
                                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200">
                                            <div className="aspect-square bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                {/* In a real app, use URL.createObjectURL(file) for preview */}
                                                <span className="p-2 text-center break-all">{file.name}</span>
                                            </div>
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Prompt Area */}
                        <div>
                            <label htmlFor="prompt" className="block text-gray-700 text-sm font-bold mb-2">
                                Analysis Instructions (Optional)
                            </label>
                            <textarea
                                id="prompt"
                                rows={4}
                                className="block w-full p-4 text-gray-900 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                placeholder="E.g., 'Focus on the water damage on the ceiling', 'Check for structural cracks', 'Assess the condition of the roof shingles'..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Action Button */}
                        <button
                            disabled={loading || !files?.length}
                            type="submit"
                            className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing Images...
                                </>
                            ) : (
                                "Generate Inspection Report"
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Results Section */}
                    {result && (
                        <section className="mt-10 border-t pt-8 animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Analysis Result</h2>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    Analysis Complete
                                </span>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner max-h-125 overflow-y-auto">
                                <div className="prose max-w-none">
                                    <h3 className="text-xl font-semibold mb-2">{result.report.title}</h3>
                                    <p className="text-gray-600 mb-4 italic">{result.report.summary}</p>
                                    
                                    <h4 className="font-semibold mt-4 mb-2">Key Findings:</h4>
                                    <ul className="list-disc pl-5 space-y-2">
                                        {result.report.findings.map((finding: any, idx: number) => (
                                            <li key={idx} className="text-sm">
                                                <span className="font-medium">{finding.area}:</span> {finding.observation}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={saveReport}
                                    disabled={loading}
                                    className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    {loading ? "Saving..." : "Save Report to Dashboard"}
                                </button>
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-4 text-center">
                                Disclaimer: This is an AI-generated analysis and should be verified by a certified professional.
                            </p>
                        </section>
                    )}
                </div>
            </div>
        </main>
    );
}
