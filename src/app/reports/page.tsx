/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const reports = await prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        include: { images: true }
    });

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Saved Reports</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                    <Link href={`/reports/${report.id}`} key={report.id} className="block">
                        <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer h-full border border-gray-200">
                            <h2 className="text-xl font-semibold mb-2 truncate">{report.title}</h2>
                            <p className="text-gray-500 text-sm mb-4">
                                {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString()}
                            </p>
                            <div className="text-gray-700 line-clamp-3 mb-4">
                                {(report.findings as any)?.summary || "No summary available."}
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-blue-600 text-sm font-medium">View Report &rarr;</span>
                                <span className="text-gray-400 text-xs">{report.images.length} images</span>
                            </div>
                        </div>
                    </Link>
                ))}
                {reports.length === 0 && (
                    <p className="text-gray-500 col-span-full text-center py-10">No reports found. Generate one in AI Analysis.</p>
                )}
            </div>
        </div>
    );
}
