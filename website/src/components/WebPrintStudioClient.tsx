"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  Printer, 
  ShieldCheck, 
  UploadCloud, 
  Smartphone, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Sliders,
  X,
  Clock,
  Laptop
} from "lucide-react";

interface WebPrintStudioClientProps {
  hostId: string;
}

export function WebPrintStudioClient({ hostId }: WebPrintStudioClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copies, setCopies] = useState("1");
  const [colorMode, setColorMode] = useState("color");
  const [orientation, setOrientation] = useState("portrait");
  const [status, setStatus] = useState<"idle" | "submitting" | "waiting_approval" | "completed">("idle");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStatus("idle");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setStatus("idle");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setStatus("idle");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setStatus("submitting");
    setTimeout(() => {
      setStatus("waiting_approval");
    }, 800);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* 1. Dedicated Web Print Studio App Header (No marketing navigation or landing page navbar) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Printora
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 hidden sm:inline-block">
                  Web Print Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Host Station: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{hostId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ready to Print</span>
            </span>
          </div>
        </div>
      </header>

      {/* 2. Security Context Pill Banner */}
      <div className="bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 px-4 py-2 text-center text-xs text-blue-900 dark:text-blue-200 font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>
          Private Host Spooler Session • Direct-to-Device • Zero Cloud Storage
        </span>
      </div>

      {/* 3. Main Web Print Studio Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10">
        {/* Host Identification Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900/50">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {hostId}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Target Host PC
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Zero-install web printing directly to this Windows computer&apos;s printers.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 self-stretch sm:self-auto text-center sm:text-right">
            Host ID: <span className="text-slate-900 dark:text-slate-200 font-semibold">{hostId}</span>
          </div>
        </div>

        {/* Upload & Print Preferences Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Dropzone Card */}
          <div className="md:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Select Document or Photo
                </h2>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">PDF, JPG, PNG, DOCX</span>
              </div>

              {/* Interactive File Dropzone */}
              {!selectedFile ? (
                <label
                  htmlFor="file-upload"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`group relative flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-xl transition-all cursor-pointer text-center ${
                    dragActive
                      ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40"
                      : "border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp,.docx,.txt"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200">
                    Tap to upload document or photo
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Files are spooled directly into the host printer queue. Zero cloud retention.
                  </p>
                  <div className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs group-hover:border-blue-400 transition-colors">
                    Browse Device Files
                  </div>
                </label>
              ) : (
                <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatFileSize(selectedFile.size)} • Ready for spooling
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0"
                    title="Remove selected file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Status alerts */}
            {status === "waiting_approval" && (
              <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-spin" />
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-100">
                    Print Job Transmitted to Host PC!
                  </p>
                  <p className="mt-0.5">
                    A 1-click notification has appeared on <span className="font-mono font-semibold">{hostId}</span>. The computer operator can click <strong>Approve</strong> to start printing.
                  </p>
                </div>
              </div>
            )}

            {/* Quick security notice */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>1-Click Host Authorization:</strong> Once submitted, the print request appears instantly on the host computer ({hostId}) for 1-click operator approval before printing.
              </span>
            </div>
          </div>

          {/* Print Preferences Sidebar Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Print Preferences
                </h3>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Printer
                  </label>
                  <select
                    defaultValue="default"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default">Host Default Windows Printer</option>
                    <option value="all">Auto-Spool / First Available</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Copies
                  </label>
                  <select
                    value={copies}
                    onChange={(e) => setCopies(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1 Copy</option>
                    <option value="2">2 Copies</option>
                    <option value="3">3 Copies</option>
                    <option value="4">4 Copies</option>
                    <option value="5">5 Copies (Max)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Color Mode
                  </label>
                  <select
                    value={colorMode}
                    onChange={(e) => setColorMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="color">Full Color</option>
                    <option value="mono">Black & White (Monochrome)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={!selectedFile || status === "submitting"}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md ${
                  selectedFile
                    ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] cursor-pointer shadow-blue-600/25"
                    : "bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-70"
                }`}
              >
                <Printer className="w-4 h-4" />
                {status === "submitting" ? "Sending to Spooler..." : "Submit to Host Spooler"}
              </button>
              <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Protected by Printora Spooler Guard
              </p>
            </div>
          </div>
        </form>

        {/* Mobile Paired App Info Card */}
        <div className="mt-8 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 shadow-xs">
          <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-slate-900 dark:text-white mb-0.5">
              Print often from this phone?
            </p>
            <p>
              Bookmark this page in Safari or Chrome, or download the{" "}
              <Link href="/download/android" className="text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-700">
                Printora Android App
              </Link>{" "}
              for 1-tap permanent direct printing.
            </p>
          </div>
        </div>
      </main>

      {/* 4. Minimal Web App Footer (No marketing links) */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Printora Cloud Print Station • Direct Spooler Protocol</span>
          <span className="font-mono text-[11px]">Host: {hostId}</span>
        </div>
      </footer>
    </div>
  );
}
