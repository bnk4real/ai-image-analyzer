/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PageHeader from "@/components/PageHeader";
import { DownloadIcon, PrinterIcon, Spinner } from "@/components/Icons";

export default function ReportViewer({ report }: { report: any }) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // Important for images if they are external
                logging: false,
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${report.title.replace(/\s+/g, "_")}_Report.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF.");
        } finally {
            setDownloading(false);
        }
    };

    let findings = report.findings as any;
    // Handle legacy/broken data where findings is just the array
    if (Array.isArray(findings)) {
        findings = {
            summary: "Summary not available for this report.",
            findings: findings
        };
    }

    return (
        <div className="mx-auto max-w-4xl">
            <div className="print:hidden">
                <PageHeader
                    title="Report Details"
                    actions={
                        <>
                            <button onClick={handlePrint} className="btn-secondary">
                                <PrinterIcon width={16} height={16} />
                                Print
                            </button>
                            <button onClick={handleDownloadPDF} disabled={downloading} className="btn-primary">
                                {downloading ? <Spinner /> : <DownloadIcon width={16} height={16} />}
                                {downloading ? "Generating PDF..." : "Download PDF"}
                            </button>
                        </>
                    }
                />
            </div>

            {/* Printable area: always light "paper". Only theme tokens here, no
                opacity-modified colors, so html2canvas can render it. */}
            <div
                ref={reportRef}
                className="report-paper rounded-lg border border-line p-6 sm:p-10 print:border-0 print:p-0"
                id="report-content"
            >
                <div className="mb-8 border-b border-line pb-5">
                    <h2 className="mb-2 text-3xl font-semibold tracking-tight">{report.title}</h2>
                    <p className="text-sm text-muted">
                        Generated on {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                    </p>
                    {findings.summary && <p className="mt-4 text-sm leading-relaxed">{findings.summary}</p>}
                </div>

                <section className="mb-8">
                    <h3 className="mb-4 border-l-4 border-accent pl-3 text-lg font-semibold">Detailed Findings</h3>
                    <div className="space-y-4">
                        {findings.findings ? (
                            findings.findings.map((finding: any, index: number) => (
                                <div key={index} className="break-inside-avoid rounded-lg border border-line bg-surface-2 p-5">
                                    <h4 className="mb-3 font-semibold">
                                        {index + 1}. {finding.area}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                        <div>
                                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">Observation</span>
                                            <p>{finding.observation}</p>
                                        </div>
                                        <div>
                                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">Implication</span>
                                            <p>{finding.implication}</p>
                                        </div>
                                        <div>
                                            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">Recommendation</span>
                                            <p>{finding.recommendation}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted">No detailed findings available.</p>
                        )}
                    </div>
                </section>

                {report.images && report.images.length > 0 && (
                    <section className="break-before-page">
                        <h3 className="mb-4 border-l-4 border-accent pl-3 text-lg font-semibold">Analyzed Images</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {report.images.map((img: any) => (
                                <div key={img.id} className="break-inside-avoid overflow-hidden rounded-lg border border-line">
                                    {/* Only image metadata is stored (no pixels), so show the filename as a placeholder. */}
                                    <div className="flex h-44 items-center justify-center bg-surface-2 text-sm text-muted">
                                        [Image: {img.filename}]
                                    </div>
                                    <div className="border-t border-line px-3 py-2 text-center text-xs text-muted">
                                        {img.filename}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-xs italic text-muted">* Images are referenced from the analysis session.</p>
                    </section>
                )}

                <div className="mt-12 border-t border-line pt-4 text-center text-xs text-muted">
                    <p>Report generated by Report AI Analysis</p>
                </div>
            </div>
        </div>
    );
}
