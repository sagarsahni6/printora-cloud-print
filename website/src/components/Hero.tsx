import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-6 text-left">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf6ed] dark:bg-emerald-950/60 border border-[#cbe5d4] dark:border-emerald-800/80 text-[#0a7746] dark:text-emerald-300 font-mono text-xs font-semibold tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-[#0a7746] dark:bg-emerald-400" />
              <span>FREE • NO ACCOUNT REQUIRED</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#0e171b] dark:text-white leading-[1.12]">
              Print from your phone{" "}
              <span className="text-[#0a7746] dark:text-emerald-400">
                using the printer you already own.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Send PDFs and photos from Android, iPhone, iPad, or any browser to a printer connected to your Windows PC. Print over local Wi-Fi or configure optional remote access.
            </p>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              A Windows PC running Printora is required to receive print jobs. Your PC must be running and accessible when you print.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/download/windows"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-[#0a7746] hover:bg-[#08633a] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl transition-all duration-150 shadow-sm text-center"
              >
                Download for Windows
              </Link>

              <Link
                href="/download/android"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-150 shadow-xs text-center"
              >
                Get the Android app
              </Link>
            </div>

            {/* Sub-CTA Link */}
            <div className="mt-5">
              <Link
                href="/qr-code-web-printing"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a7746] dark:text-emerald-400 hover:underline transition-colors group"
              >
                <span>Print from iPhone or browser (no app required)</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Supporting Trust Points */}
            <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Standard Windows drivers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Local Wi-Fi printing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Optional remote access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Privacy-conscious handling</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Demo Video Player */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[540px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-2xl shadow-emerald-950/10 dark:shadow-black/50 relative">
              
              {/* Window Header */}
              <div className="flex items-center justify-between px-3 py-2 mb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/90 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 inline-block" />
                  <span className="ml-2 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Printora Software Demo
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-[#0a7746] dark:text-emerald-300 font-mono text-[10px] font-bold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0a7746] dark:bg-emerald-400 animate-pulse" />
                  <span>HD PREVIEW</span>
                </div>
              </div>

              {/* Video Player */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/60 dark:border-slate-800 shadow-inner">
                <video
                  className="w-full h-auto aspect-video object-cover block rounded-2xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  poster="/printora-video-poster.jpg"
                >
                  <source src="/printora-product-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Bottom Feature Pill Strip */}
              <div className="mt-3 pt-2 flex items-center justify-between px-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Local Wi-Fi + Tunnel
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Spooling
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  0 Cloud Footprint
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
