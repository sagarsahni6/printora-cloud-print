import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Printer, ExternalLink, Mail } from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-[#09150f] dark:via-[#07110c] dark:to-[#040906] text-slate-600 dark:text-slate-400 border-t border-slate-200/80 dark:border-emerald-950/60 pt-16 pb-12 text-xs overflow-hidden transition-colors">
      {/* Ambient background glow accents */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 translate-x-1/2 w-96 h-96 bg-blue-500/5 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-10 pb-12 border-b border-slate-200 dark:border-slate-800/80">
          {/* Brand Column (2 cols on md) */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 dark:text-white group">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 dark:bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform duration-200">
                <Printer className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Printora
              </span>
            </Link>

            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
              Print from Android, iPhone, iPad, or any modern web browser to printers connected to your Windows computer. Privacy-first, local-first architecture.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={siteConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-800 text-xs shadow-xs"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>Open Source Repository</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Col 1: Product Features */}
          <div className="space-y-3">
            <p className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">Product</p>
            <ul className="space-y-2">
              <li>
                <Link href="/features/wireless-printing" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Wireless Printing
                </Link>
              </li>
              <li>
                <Link href="/features/document-scanner" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Document Scanner
                </Link>
              </li>
              <li>
                <Link href="/features/id-card-scanner" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  ID Card Scanner
                </Link>
              </li>
              <li>
                <Link href="/features/ocr" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  OCR Text Extraction
                </Link>
              </li>
              <li>
                <Link href="/features/web-print" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  QR Web Print
                </Link>
              </li>
              <li>
                <Link href="/features/remote-printing" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Remote Printing
                </Link>
              </li>
              <li>
                <Link href="/features/printer-management" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Printer Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Solutions & Step-by-Step Guides */}
          <div className="space-y-3">
            <p className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">Solutions</p>
            <ul className="space-y-2">
              <li>
                <Link href="/print-from-android-to-windows-printer" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Print from Android
                </Link>
              </li>
              <li>
                <Link href="/print-from-iphone-to-windows-printer" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Print from iPhone
                </Link>
              </li>
              <li>
                <Link href="/print-from-ipad-to-windows-printer" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Print from iPad
                </Link>
              </li>
              <li>
                <Link href="/print-from-phone-to-usb-printer" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Print to USB Printer
                </Link>
              </li>
              <li>
                <Link href="/remote-printing-from-phone" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Remote 4G/5G Print
                </Link>
              </li>
              <li>
                <Link href="/id-card-scanner-to-pdf" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  ID Card to A4 PDF
                </Link>
              </li>
              <li>
                <Link href="/mobile-document-scanner-to-pdf" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Phone Scan to PDF
                </Link>
              </li>
              <li>
                <Link href="/qr-code-web-printing" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  QR Web Print Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <p className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">Resources</p>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors">
                  Compare Alternatives
                </Link>
              </li>
              <li>
                <Link href="/compare/printershare-alternative" className="hover:text-slate-900 dark:hover:text-white transition-colors text-[11px]">
                  vs PrinterShare
                </Link>
              </li>
              <li>
                <Link href="/compare/google-cloud-print-alternative" className="hover:text-slate-900 dark:hover:text-white transition-colors text-[11px]">
                  vs Google Cloud Print
                </Link>
              </li>
              <li>
                <Link href="/compare/nokoprint-alternative" className="hover:text-slate-900 dark:hover:text-white transition-colors text-[11px]">
                  vs NokoPrint
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Guides &amp; Tutorials
                </Link>
              </li>
              <li>
                <Link href="/compatibility" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Compatibility Matrix
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Support &amp; Help Desk
                </Link>
              </li>
              <li>
                <a 
                  href={siteConfig.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-emerald-600 dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Documentation</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Downloads */}
          <div className="space-y-3">
            <p className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">Trust &amp; Get</p>
            <ul className="space-y-2">
              <li>
                <Link href="/security" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Security Whitepaper
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/download/windows" className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-semibold text-blue-600 dark:text-blue-400">
                  Download Windows (.NET 8)
                </Link>
              </li>
              <li>
                <Link href="/download/android" className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors font-semibold text-emerald-600 dark:text-emerald-400">
                  Get Android App (APK)
                </Link>
              </li>
            </ul>
          </div>
        </div>
 
        {/* Developer Showcase Card */}
        <div className="my-10 p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-emerald-950/20 border border-slate-200/90 dark:border-emerald-900/40 backdrop-blur-xl shadow-xl shadow-slate-950/5 dark:shadow-emerald-950/20 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-emerald-500/40 dark:hover:border-emerald-500/50">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20 shrink-0 bg-slate-900">
              <Image
                src={siteConfig.developer.avatar}
                alt={`${siteConfig.developer.name} - ${siteConfig.developer.role}`}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-slate-900 dark:text-white font-bold text-base tracking-tight">{siteConfig.developer.name}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-500/20">
                  {siteConfig.developer.role}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 max-w-md leading-relaxed">
                Creator of Printora • Engineered for privacy-first, local Wi-Fi and remote printing across Windows, Android, and iOS.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href={siteConfig.developer.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-all border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>@sagarsahni6</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href={`mailto:${siteConfig.developer.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-200 transition-all border border-transparent dark:border-emerald-500/30 text-xs font-semibold shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-white dark:text-emerald-300" />
              <span>{siteConfig.developer.email}</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
          <p>© 2026 Printora by Sagar Sahni. All rights reserved. Local-first printing architecture.</p>
          <p className="flex items-center gap-1">
            <span>Windows PC is the print host • Zero permanent cloud document storage</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
