import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Reports</h2>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{totalReports}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Users</h2>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{totalUsers}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/image-analysis"
                        className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Report
                    </Link>
                    <Link
                        href="/roofing"
                        className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Create Roofing Report
                    </Link>
                </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Reports</h2>
                    <Link href="/reports" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View All &rarr;
                    </Link>
                </div>
                <ul className="divide-y divide-gray-200">
                    {recentReports.length > 0 ? (
                        recentReports.map((report) => (
                            <li key={report.id} className="hover:bg-gray-50 transition-colors">
                                <Link href={`/reports/${report.id}`} className="block px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-blue-600 truncate">{report.title}</p>
                                        <div className="ml-2 shrink-0 flex">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Completed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                Created on {new Date(report.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="px-6 py-4 text-center text-gray-500">
                            No reports created yet.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
