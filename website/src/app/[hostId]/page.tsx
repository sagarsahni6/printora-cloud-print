import type { Metadata } from "next";
import { Suspense } from "react";
import { WebPrintStudioClient } from "@/components/WebPrintStudioClient";

interface PageProps {
  params: Promise<{
    hostId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hostId } = await params;
  return {
    title: `Web Print Studio • Host ${hostId} | Printora`,
    description: `Zero-install mobile document printing for Host Device ${hostId}. Upload PDF or images directly from iPhone, iPad, or Android browser without installing an app.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

async function HostContent({ params }: PageProps) {
  const { hostId } = await params;
  return <WebPrintStudioClient hostId={hostId} />;
}

export default function HostWebPrintPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span>Connecting to Printora Web Print Studio...</span>
        </div>
      }
    >
      <HostContent {...props} />
    </Suspense>
  );
}
