/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6 no-print">
                <h1 className="text-2xl font-bold text-gray-800">Report Details</h1>
                <div className="space-x-4">
                    <button
                        onClick={handlePrint}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow transition"
                    >
                        Print
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition disabled:bg-blue-400"
                    >
                        {downloading ? "Generating PDF..." : "Download PDF"}
                    </button>
                </div>
            </div>

            {/* Printable Area */}
            <div
                ref={reportRef}
                className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:p-0"
                id="report-content"
            >
                <div className="border-b pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{report.title}</h1>
                    <p className="text-gray-500 text-sm">
                        Generated on {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                    </p>
                </div>
                {/* Findings Section */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
                        Detailed Findings
                    </h2>
                    <div className="space-y-6">
                        {findings.findings ? (
                            findings.findings.map((finding: any, index: number) => (
                                <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200 break-inside-avoid">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                                        {index + 1}. {finding.area}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="font-semibold text-gray-600 block">Observation:</span>
                                            <p className="text-gray-800">{finding.observation}</p>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-600 block">Implication:</span>
                                            <p className="text-gray-800">{finding.implication}</p>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-600 block">Recommendation:</span>
                                            <p className="text-gray-800">{finding.recommendation}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No detailed findings available.</p>
                        )}
                    </div>
                </section>

                {/* Images Section */}
                {report.images && report.images.length > 0 && (
                    <section className="break-before-page">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
                            Analyzed Images
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {report.images.map((img: any ) => (
                                <div key={img.id} className="border rounded-lg overflow-hidden break-inside-avoid">
                                    {/* Note: In a real app, you'd serve these images from a storage bucket or DB. 
                                        Since we don't have the actual image data stored (only metadata in DB for now), 
                                        we'll display a placeholder or the filename. 
                                        If you want to display the actual image, we need to store the base64 or upload it to a cloud storage.
                                    */}
                                    <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-500">
                                        [Image: {img.filename}]
                                    </div>
                                    <div className="p-2 bg-gray-50 text-xs text-center text-gray-600">
                                        {img.filename}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-4 italic">
                            * Images are referenced from the analysis session.
                        </p>
                    </section>
                )}

                <div className="mt-12 pt-4 border-t text-center text-gray-400 text-xs">
                    <p>Report generated by Report AI Analysis</p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white;
                    }
                    .container {
                        max-width: 100%;
                        padding: 0;
                    }
                    .shadow-lg {
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
