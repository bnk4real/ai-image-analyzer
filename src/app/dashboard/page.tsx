import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { PlusIcon, RoofIcon } from "@/components/Icons";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const [totalReports, totalUsers, recentReports] = await Promise.all([
        prisma.report.count(),
        prisma.people.count(),
        prisma.report.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    const stats = [
        { label: "Total Reports", value: totalReports },
        { label: "Total Users", value: totalUsers },
    ];

    return (
        <div>
            <PageHeader
                title="Dashboard"
                description="Overview of your reports and quick ways to create new ones."
                actions={
                    <>
                        <Link href="/roofing" className="btn-secondary">
                            <RoofIcon width={16} height={16} />
                            Roofing Report
                        </Link>
                        <Link href="/image-analysis" className="btn-primary">
                            <PlusIcon width={16} height={16} />
                            Create Report
                        </Link>
                    </>
                }
            />

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {stats.map(({ label, value }) => (
                    <div key={label} className="card p-5">
                        <p className="text-sm text-muted">{label}</p>
                        <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
                    </div>
                ))}
            </div>

            <section className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                    <h2 className="font-semibold">Recent Reports</h2>
                    <Link href="/reports" className="text-sm font-medium text-accent hover:underline">
                        View all &rarr;
                    </Link>
                </div>
                <ul className="divide-y divide-line">
                    {recentReports.length > 0 ? (
                        recentReports.map((report) => (
                            <li key={report.id}>
                                <Link
                                    href={`/reports/${report.id}`}
                                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-2"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{report.title}</p>
                                        <p className="mt-0.5 text-xs text-muted">
                                            Created on {new Date(report.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-md bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                                        Completed
                                    </span>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="px-5 py-10 text-center text-sm text-muted">No reports created yet.</li>
                    )}
                </ul>
            </section>
        </div>
    );
}
