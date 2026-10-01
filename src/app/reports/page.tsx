/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { ChevronRightIcon, PlusIcon } from "@/components/Icons";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const reports = await prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        include: { images: true }
    });

    return (
        <div>
            <PageHeader
                title="Reports"
                description={`${reports.length} saved ${reports.length === 1 ? "report" : "reports"}`}
                actions={
                    <Link href="/image-analysis" className="btn-primary">
                        <PlusIcon width={16} height={16} />
                        New Report
                    </Link>
                }
            />

            {reports.length === 0 ? (
                <div className="card py-14 text-center text-sm text-muted">
                    No reports found. Create one with New Report.
                </div>
            ) : (
                <ul className="card divide-y divide-line overflow-hidden">
                    {reports.map((report) => {
                        const created = new Date(report.createdAt);
                        return (
                            <li key={report.id}>
                                <Link
                                    href={`/reports/${report.id}`}
                                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{report.title}</p>
                                        <p className="mt-0.5 truncate text-sm text-muted">
                                            {(report.findings as any)?.summary || "No summary available."}
                                        </p>
                                    </div>
                                    <div className="hidden shrink-0 text-right text-xs text-muted sm:block">
                                        <p>{created.toLocaleDateString()}</p>
                                        <p className="mt-0.5">
                                            {report.images.length} {report.images.length === 1 ? "image" : "images"}
                                        </p>
                                    </div>
                                    <ChevronRightIcon
                                        className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                                        width={18}
                                        height={18}
                                    />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
