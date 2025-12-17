import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReportViewer from "@/components/ReportViewer";

interface ReportPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
    const { id } = await params;
    
    const report = await prisma.report.findUnique({
        where: {
            id: id,
        },
        include: {
            images: true,
        },
    });

    if (!report) {
        notFound();
    }


    return <ReportViewer report={report} />;
}
