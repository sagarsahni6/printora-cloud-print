import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Printer, ShieldCheck, UploadCloud, Smartphone, FileText, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface PageProps {
  params: Promise<{
    hostId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hostId } = await params;
  return {
    title: `Web Print Studio • Host ${hostId} | Printora`,
    description: `Instant zero-install mobile document printing for Host Device ${hostId}. Upload PDF or images directly from iPhone, iPad, or Android browser without installing an app.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

async function HostContent({ params }: PageProps) {
  const { hostId } = await params;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-14">
        {/* Host Header Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {hostId}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                  Ready to Print
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Printora Cloud Print Station • Host Device Session
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 self-stretch sm:self-auto text-center sm:text-right">
            Host ID: <span className="text-slate-900 dark:text-slate-200 font-semibold">{hostId}</span>
          </div>
        </div>

        {/* Upload & Print Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Dropzone Card */}
          <div className="md:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Select Document to Print
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">PDF, JPG, PNG, DOCX</span>
              </div>

              {/* Interactive File Dropzone */}
              <label
                htmlFor="file-upload"
                className="group relative flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer text-center"
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp,.docx,.txt"
                  className="sr-only"
                />
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200">
                  Tap to upload document or photo
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Files are sent directly to host printer queue. No cloud retention.
                </p>
                <div className="mt-4 px-3 py-1 rounded-md text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs">
                  Browse Device Files
                </div>
              </label>
            </div>

            {/* Quick security notice */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>1-Click Host Authorization:</strong> Once submitted, the print job will appear on the host computer ({hostId}) for 1-click operator approval before printing.
              </span>
            </div>
          </div>

          {/* Print Settings Sidebar */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Print Preferences
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Copies
                  </label>
                  <select
                    defaultValue="1"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1 Copy</option>
                    <option value="2">2 Copies</option>
                    <option value="3">3 Copies (Max)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Color Mode
                  </label>
                  <select
                    defaultValue="color"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="color">Color</option>
                    <option value="mono">Black & White (Monochrome)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Orientation
                  </label>
                  <select
                    defaultValue="portrait"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Submit to Host
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Protected by Printora Spooler Guard
              </p>
            </div>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="mt-8 p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3.5">
          <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white mb-0.5">
              Need permanent paired printing from your phone?
            </p>
            <p>
              Download the free Printora Android App or save this Web Print Studio bookmark in Safari/Chrome. Learn more on our{" "}
              <Link href="/qr-code-web-printing" className="text-blue-600 dark:text-blue-400 underline font-medium">
                QR Web Print guide
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function HostWebPrintPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-600 dark:text-slate-400 text-sm">
          Loading Web Print Studio...
        </div>
      }
    >
      <HostContent {...props} />
    </Suspense>
  );
}
