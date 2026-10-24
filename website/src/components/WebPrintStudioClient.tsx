"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface WebPrintStudioClientProps {
  hostId: string;
}

interface PrintJob {
  id: string;
  fileName: string;
  status: "Queued" | "Printing" | "Completed" | "Failed";
  printer: string;
  time: string;
  copies: number;
}

export function WebPrintStudioClient({ hostId }: WebPrintStudioClientProps) {
  // Derive server name from hostId: e.g. "DESKTOP-PLK2AIK-91413" -> "DESKTOP-PLK2AIK"
  const serverName = hostId.includes("-") 
    ? hostId.substring(0, hostId.lastIndexOf("-")) 
    : hostId;

  const [activeTab, setActiveTab] = useState<"print" | "queue" | "printers" | "server">("print");
  const [isApproved, setIsApproved] = useState(false);
  const [isWaitingApproval, setIsWaitingApproval] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Print form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [printerList, setPrinterList] = useState<string[]>([
    "Default Host Windows Spooler",
    "HP LaserJet Pro M404n",
    "Brother HL-L2350DW",
    "Canon imageCLASS MF445dw",
    "Epson EcoTank ET-2800",
    "Microsoft Print to PDF",
    "Receipt POS Thermal 80mm",
    "Office Color Copier",
    "Warehouse Shipping Label Printer",
    "Generic / Text Only"
  ]);
  const [selectedPrinter, setSelectedPrinter] = useState("Default Host Windows Spooler");
  const [pageRangeMode, setPageRangeMode] = useState<"all" | "custom" | "odd" | "even">("all");
  const [customRange, setCustomRange] = useState("");
  const [pageSize, setPageSize] = useState<"A4" | "Letter" | "Legal">("A4");
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState<"Color" | "Monochrome">("Color");
  const [duplex, setDuplex] = useState(false);
  const [orientation, setOrientation] = useState<"Portrait" | "Landscape">("Portrait");
  const [isPrinting, setIsPrinting] = useState(false);

  // Queue state
  const [jobs, setJobs] = useState<PrintJob[]>([
    {
      id: "JOB-1042",
      fileName: "Q3_Sales_Report.pdf",
      status: "Completed",
      printer: "HP LaserJet Pro M404n",
      time: "2 mins ago",
      copies: 1,
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleRequestApproval = () => {
    setIsWaitingApproval(true);
    showToast("Notification sent to host PC desktop!");
    // Auto simulate host approving after 3 seconds for seamless demo
    setTimeout(() => {
      setIsWaitingApproval(false);
      setIsApproved(true);
      showToast("Host PC Approved! Print Studio is now unlocked.");
    }, 3200);
  };

  const handleVerifyPin = () => {
    if (pinValue.trim().length === 6) {
      setIsApproved(true);
      setShowPinInput(false);
      setPinError("");
      showToast("PIN verified! Print Studio unlocked.");
    } else {
      setPinError("Please enter a valid 6-digit numeric PIN.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const clearStagedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const adjustCopies = (delta: number) => {
    setCopies((prev) => {
      const next = prev + delta;
      return Math.min(Math.max(next, 1), 3);
    });
  };

  const handleSubmitPrint = () => {
    if (!selectedFile) {
      showToast("Please choose a document to print first.");
      return;
    }
    if (!isApproved) {
      showToast("Host PC approval required before sending to printer queue.");
      return;
    }

    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      const newJob: PrintJob = {
        id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
        fileName: selectedFile.name,
        status: "Queued",
        printer: selectedPrinter,
        time: "Just now",
        copies: copies,
      };
      setJobs((prev) => [newJob, ...prev]);
      showToast("Document spooled successfully to Windows host queue!");
      clearStagedFile();
      setActiveTab("queue");
    }, 1200);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFormatBadge = (name: string): string => {
    const ext = name.split(".").pop()?.toUpperCase() || "DOC";
    if (ext === "JPEG") return "JPG";
    return ext.slice(0, 4);
  };

  return (
    <>
      {/* Load Google Material Symbols Outlined font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />

      <style jsx global>{`
        :root {
          --bg-canvas: #F8FAFC;
          --bg-card: #FFFFFF;
          --bg-subtle: #F1F5F9;
          --bg-hover: #E2E8F0;

          --primary: #0067C0;
          --primary-hover: #0052A3;
          --primary-light: #EBF3FB;
          --primary-border: #BCD7F5;

          --text-main: #0F172A;
          --text-sub: #475569;
          --text-muted: #94A3B8;

          --border: #E2E8F0;
          --border-strong: #CBD5E1;

          --success: #10B981;
          --success-light: #ECFDF5;
          --success-border: #A7F3D0;
          --success-text: #047857;

          --warning: #F59E0B;
          --warning-light: #FFFBEB;
          --warning-border: #FDE68A;
          --warning-text: #B45309;

          --error: #EF4444;
          --error-light: #FEF2F2;
          --error-border: #FECACA;
          --error-text: #B91C1C;

          --radius-xl: 18px;
          --radius-lg: 14px;
          --radius-md: 10px;
          --radius-sm: 6px;
          --radius-full: 9999px;

          --shadow-subtle: 0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02);
          --shadow-card: 0 2px 8px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02);
          --shadow-sheet: 0 -4px 24px rgba(15, 23, 42, 0.15);
          --shadow-floating: 0 8px 24px rgba(0, 103, 192, 0.25);
        }

        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 20px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          vertical-align: middle;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
        }

        .material-symbols-outlined.filled {
          font-variation-settings: 'FILL' 1;
        }

        /* Top Header */
        .mobile-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .header-logo {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #0067C0 0%, #004F96 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0, 103, 192, 0.25);
        }

        .header-info {
          min-width: 0;
        }

        .header-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-sub);
          margin-top: 1px;
        }

        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: var(--success);
          position: relative;
          flex-shrink: 0;
        }

        .pulse-dot::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: var(--success);
          animation: pulse-ring 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-app-download {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          background: #10B981;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .btn-app-download:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .btn-header-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-header-icon:active {
          transform: scale(0.94);
          background: var(--bg-hover);
        }

        /* Security Context Banner */
        .security-banner {
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border-bottom: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .security-banner.tunnel-locked {
          background: var(--warning-light);
          color: var(--warning-text);
          border-color: var(--warning-border);
        }

        .security-banner.tunnel-verified {
          background: var(--success-light);
          color: var(--success-text);
          border-color: var(--success-border);
        }

        .security-badge-left {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .security-badge-action {
          font-size: 11px;
          text-decoration: underline;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* Container */
        .mobile-container {
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          padding: 14px 14px 90px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Cards */
        .m-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 16px;
          box-shadow: var(--shadow-card);
        }

        .m-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .m-card-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .m-card-title .material-symbols-outlined {
          color: var(--primary);
          font-size: 18px;
        }

        /* Host Approval Gate Card */
        .m-approval-gate {
          background: #FFFFFF;
          border: 1px solid var(--primary-border);
          border-radius: var(--radius-xl);
          padding: 24px 18px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 103, 192, 0.08);
          margin-bottom: 14px;
          position: relative;
          overflow: hidden;
        }

        .m-approval-gate::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #0067C0, #38BDF8, #0067C0);
          background-size: 200% 100%;
          animation: gate-shimmer 2.5s linear infinite;
        }

        @keyframes gate-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        .radar-ping-container {
          position: relative;
          width: 64px;
          height: 64px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radar-ping-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0067C0 0%, #0052A3 100%);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 103, 192, 0.35);
          z-index: 2;
        }

        .radar-ping-ring {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 50%;
          border: 2px solid #0067C0;
          animation: radar-wave 2s cubic-bezier(0.2, 0.6, 0.35, 1) infinite;
          opacity: 0;
        }

        .radar-ping-ring.delay {
          animation-delay: 0.8s;
        }

        @keyframes radar-wave {
          0% { transform: scale(0.6); opacity: 0.8; }
          50% { opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .approval-gate-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: var(--primary-light);
          color: var(--primary);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .approval-gate-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .approval-gate-desc {
          font-size: 13px;
          color: var(--text-sub);
          line-height: 1.5;
          max-width: 360px;
          margin: 0 auto 16px;
        }

        .btn-gate-action {
          width: 100%;
          max-width: 340px;
          margin: 0 auto;
          height: 48px;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: var(--radius-lg);
          background: var(--primary);
          color: #FFFFFF;
          border: none;
          cursor: pointer;
          box-shadow: var(--shadow-floating);
          transition: all 0.15s ease;
        }

        .btn-gate-action:hover {
          background: var(--primary-hover);
        }

        .gate-waiting-box {
          margin-top: 14px;
          padding: 12px 14px;
          background: var(--primary-light);
          border: 1px solid var(--primary-border);
          border-radius: var(--radius-md);
          font-size: 12px;
          color: var(--primary);
          font-weight: 600;
          max-width: 340px;
          margin-left: auto;
          margin-right: auto;
        }

        .gate-pin-row {
          margin-top: 12px;
        }

        .btn-text-pin {
          background: none;
          border: none;
          color: var(--text-sub);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
        }

        .btn-text-pin:hover {
          color: var(--primary);
        }

        /* Dropzone */
        .m-dropzone {
          border: 2px dashed var(--border-strong);
          background: var(--bg-subtle);
          border-radius: var(--radius-lg);
          padding: 24px 14px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .m-dropzone:hover {
          border-color: var(--primary);
          background: var(--primary-light);
        }

        .m-drop-icon {
          width: 48px;
          height: 48px;
          background: #FFFFFF;
          border-radius: 50%;
          margin: 0 auto 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--border);
        }

        .m-drop-icon .material-symbols-outlined {
          font-size: 26px;
        }

        .m-drop-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }

        .m-drop-title span {
          color: var(--primary);
          text-decoration: underline;
        }

        .m-drop-sub {
          font-size: 11px;
          color: var(--text-sub);
          margin-top: 4px;
        }

        .m-chip-row {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .m-chip {
          padding: 2px 7px;
          border-radius: var(--radius-sm);
          background: #FFFFFF;
          border: 1px solid var(--border);
          font-size: 10px;
          font-weight: 600;
          color: var(--text-sub);
        }

        .m-quota-badge {
          margin-top: 10px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: #F1F5F9;
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 11px;
          color: var(--text-sub);
          font-weight: 600;
        }

        .m-quota-badge .material-symbols-outlined {
          font-size: 14px;
          color: var(--primary);
        }

        /* Staged File Card */
        .m-staged-file {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: var(--primary-light);
          border: 1px solid var(--primary-border);
          border-radius: var(--radius-lg);
          gap: 10px;
          margin-bottom: 12px;
        }

        .staged-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .format-badge {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--primary);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
          flex-shrink: 0;
        }

        .staged-meta {
          min-width: 0;
        }

        .staged-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .staged-size {
          font-size: 11px;
          color: var(--text-sub);
          margin-top: 1px;
        }

        .btn-remove-file {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: #FFFFFF;
          border: 1px solid var(--border);
          color: var(--error);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* Form elements */
        .m-form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-top: 12px;
        }

        .m-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .m-select, .m-input {
          width: 100%;
          height: 44px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-strong);
          background: #FFFFFF;
          color: var(--text-main);
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .m-select:focus, .m-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0, 103, 192, 0.12);
        }

        /* Stepper */
        .m-stepper {
          display: flex;
          align-items: center;
          height: 44px;
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-md);
          background: #FFFFFF;
          overflow: hidden;
        }

        .m-stepper-btn {
          width: 46px;
          height: 100%;
          background: var(--bg-subtle);
          border: none;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-main);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .m-stepper-val {
          flex: 1;
          height: 100%;
          border: none;
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
          outline: none;
          background: transparent;
        }

        /* Segmented buttons */
        .m-segmented {
          display: flex;
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 3px;
          gap: 2px;
        }

        .m-segment-btn {
          flex: 1;
          height: 36px;
          border: none;
          background: transparent;
          color: var(--text-sub);
          font-size: 12px;
          font-weight: 600;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .m-segment-btn.active {
          background: #FFFFFF;
          color: var(--primary);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .btn-primary {
          width: 100%;
          height: 50px;
          border-radius: var(--radius-lg);
          background: var(--primary);
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 700;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: var(--shadow-floating);
          transition: all 0.15s ease;
          margin-top: 18px;
        }

        .btn-primary:active {
          transform: scale(0.98);
          background: var(--primary-hover);
        }

        .btn-primary:disabled {
          background: var(--border-strong);
          color: var(--text-muted);
          box-shadow: none;
          cursor: not-allowed;
        }

        /* Bottom Nav */
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-around;
          z-index: 50;
          padding-bottom: env(safe-area-inset-bottom, 0);
        }

        .nav-item {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .nav-item.active {
          color: var(--primary);
        }

        .nav-item.active .material-symbols-outlined {
          font-variation-settings: 'FILL' 1;
        }

        .nav-label {
          font-size: 10px;
          font-weight: 600;
        }

        /* Telemetry Bento Grid */
        .telemetry-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .telemetry-box {
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 12px;
          text-align: left;
        }

        .telemetry-val {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-main);
          font-family: monospace;
        }

        .telemetry-lbl {
          font-size: 11px;
          color: var(--text-sub);
          margin-top: 2px;
          font-weight: 500;
        }

        /* Toast */
        .m-toast {
          position: fixed;
          bottom: 78px;
          left: 50%;
          transform: translateX(-50%);
          background: #0F172A;
          color: #FFFFFF;
          padding: 10px 18px;
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          z-index: 80;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      {/* 1. Fixed Top Header */}
      <header className="mobile-header">
        <div className="header-brand">
          <div className="header-logo">
            <span className="material-symbols-outlined filled">print</span>
          </div>
          <div className="header-info">
            <div className="header-title">{serverName}</div>
            <div className="header-status">
              <span className="pulse-dot"></span>
              <span>Online • {printerList.length} printers</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <Link
            href="/download/android"
            className="btn-app-download"
            title="Install Android App"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>android</span>
            <span>Get Android App</span>
          </Link>
          <button
            className="btn-header-icon"
            onClick={() => showToast("Host state refreshed")}
            title="Refresh"
          >
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </header>

      {/* 2. Security Banner Strip */}
      <div className={`security-banner ${isApproved ? "tunnel-verified" : "tunnel-locked"}`}>
        <div className="security-badge-left">
          <span className="material-symbols-outlined">
            {isApproved ? "verified_user" : "lock"}
          </span>
          <span>
            {isApproved
              ? "🔒 Host PC Session Approved • Ready to Print"
              : "🔒 🔓 Host PC Approval Required to Print"}
          </span>
        </div>
        {!isApproved && (
          <span
            className="security-badge-action"
            onClick={handleRequestApproval}
          >
            Request Approval
          </span>
        )}
      </div>

      {/* 3. Main Content Container */}
      <main className="mobile-container">
        {/* TAB 1: PRINT STUDIO */}
        {activeTab === "print" && (
          <div>
            {/* Host Approval Gate Card (Shows when not yet approved) */}
            {!isApproved && (
              <div className="m-approval-gate">
                <div className="radar-ping-container">
                  <div className="radar-ping-ring"></div>
                  <div className="radar-ping-ring delay"></div>
                  <div className="radar-ping-icon">
                    <span className="material-symbols-outlined filled">security</span>
                  </div>
                </div>

                <div className="approval-gate-badge">HOST APPROVAL REQUIRED</div>
                <h2 className="approval-gate-title">Approval Required to Print</h2>
                <p className="approval-gate-desc">
                  Connected to <strong>{serverName}</strong> ({hostId}). For security, web print sessions require 1-click authorization from the host computer before files can be sent to printers.
                </p>

                <button
                  type="button"
                  className="btn-gate-action"
                  onClick={handleRequestApproval}
                  disabled={isWaitingApproval}
                >
                  <span className="material-symbols-outlined">send_to_mobile</span>
                  {isWaitingApproval ? "Sending Request..." : "Request 1-Click Approval on Host PC"}
                </button>

                {isWaitingApproval && (
                  <div className="gate-waiting-box">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span className="pulse-dot"></span>
                      <span>Notification sent to PC screen! Please click <strong>&quot;Approve&quot;</strong> on your computer...</span>
                    </div>
                  </div>
                )}

                <div className="gate-pin-row">
                  <button
                    type="button"
                    className="btn-text-pin"
                    onClick={() => setShowPinInput(!showPinInput)}
                  >
                    <span className="material-symbols-outlined">dialpad</span> Enter 6-digit PIN manually
                  </button>
                </div>

                {showPinInput && (
                  <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
                    <input
                      type="text"
                      className="m-input"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={pinValue}
                      onChange={(e) => setPinValue(e.target.value)}
                      style={{ textAlign: "center", fontSize: 18, fontWeight: 700, letterSpacing: 4, width: 140 }}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleVerifyPin}
                      style={{ width: "auto", height: 44, padding: "0 16px", marginTop: 0 }}
                    >
                      Verify
                    </button>
                  </div>
                )}
                {pinError && (
                  <p style={{ color: "var(--error)", fontSize: 11, marginTop: 6 }}>{pinError}</p>
                )}
              </div>
            )}

            {/* Document to Print Card */}
            <div className="m-card">
              <div className="m-card-header">
                <div className="m-card-title">
                  <span className="material-symbols-outlined">description</span>
                  Document to Print
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-sub)" }}>Max 100MB</span>
              </div>

              {/* Staged file display or Dropzone */}
              {selectedFile ? (
                <div className="m-staged-file">
                  <div className="staged-left">
                    <div className="format-badge">{getFormatBadge(selectedFile.name)}</div>
                    <div className="staged-meta">
                      <div className="staged-name">{selectedFile.name}</div>
                      <div className="staged-size">{formatFileSize(selectedFile.size)}</div>
                    </div>
                  </div>
                  <button className="btn-remove-file" onClick={clearStagedFile} title="Remove file">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ) : (
                <div
                  className="m-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                >
                  <div className="m-drop-icon">
                    <span className="material-symbols-outlined">cloud_upload</span>
                  </div>
                  <div className="m-drop-title">
                    Tap to choose or <span>drop document</span>
                  </div>
                  <div className="m-drop-sub">PDF, Word DOCX, Plain Text, PNG, JPG, WebP</div>
                  <div className="m-chip-row">
                    <span className="m-chip">PDF</span>
                    <span className="m-chip">DOCX</span>
                    <span className="m-chip">TEXT</span>
                    <span className="m-chip">IMAGE</span>
                  </div>
                  <div className="m-quota-badge">
                    <span className="material-symbols-outlined">shield</span>
                    <span>Max 3 copies • Max 30 pages</span>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                accept=".pdf,.doc,.docx,.txt,.text,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
              />

              {/* Target Printer Select */}
              <div className="m-form-group">
                <label className="m-label">
                  Destination Printer
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-sub)" }}>Ready</span>
                </label>
                <select
                  className="m-select"
                  value={selectedPrinter}
                  onChange={(e) => setSelectedPrinter(e.target.value)}
                >
                  {printerList.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Page Number Selection */}
              <div className="m-form-group">
                <div className="m-label">
                  <span>Page Selection</span>
                  <span className="m-chip" style={{ fontSize: 10, textTransform: "none" }}>
                    {pageRangeMode === "all" ? "All Pages" : `${pageRangeMode.toUpperCase()} Pages`}
                  </span>
                </div>
                <div className="m-segmented">
                  <button
                    type="button"
                    className={`m-segment-btn ${pageRangeMode === "all" ? "active" : ""}`}
                    onClick={() => setPageRangeMode("all")}
                  >
                    <span className="material-symbols-outlined">select_all</span> All
                  </button>
                  <button
                    type="button"
                    className={`m-segment-btn ${pageRangeMode === "custom" ? "active" : ""}`}
                    onClick={() => setPageRangeMode("custom")}
                  >
                    <span className="material-symbols-outlined">edit_note</span> Custom
                  </button>
                  <button
                    type="button"
                    className={`m-segment-btn ${pageRangeMode === "odd" ? "active" : ""}`}
                    onClick={() => setPageRangeMode("odd")}
                  >
                    <span className="material-symbols-outlined">filter_1</span> Odd
                  </button>
                  <button
                    type="button"
                    className={`m-segment-btn ${pageRangeMode === "even" ? "active" : ""}`}
                    onClick={() => setPageRangeMode("even")}
                  >
                    <span className="material-symbols-outlined">filter_2</span> Even
                  </button>
                </div>
                {pageRangeMode === "custom" && (
                  <div style={{ marginTop: 6 }}>
                    <input
                      type="text"
                      className="m-input"
                      placeholder="e.g. 1-3, 5, 8-10"
                      value={customRange}
                      onChange={(e) => setCustomRange(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Paper Size */}
              <div className="m-form-group">
                <label className="m-label">Paper Size</label>
                <div className="m-segmented">
                  {(["A4", "Letter", "Legal"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`m-segment-btn ${pageSize === size ? "active" : ""}`}
                      onClick={() => setPageSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Copies Stepper */}
              <div className="m-form-group">
                <label className="m-label">
                  Number of Copies
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>(Max 3)</span>
                </label>
                <div className="m-stepper">
                  <button type="button" className="m-stepper-btn" onClick={() => adjustCopies(-1)}>−</button>
                  <input type="number" className="m-stepper-val" value={copies} readOnly />
                  <button type="button" className="m-stepper-btn" onClick={() => adjustCopies(1)}>+</button>
                </div>
              </div>

              {/* Color Mode */}
              <div className="m-form-group">
                <label className="m-label">Color Mode</label>
                <div className="m-segmented">
                  <button
                    type="button"
                    className={`m-segment-btn ${colorMode === "Color" ? "active" : ""}`}
                    onClick={() => setColorMode("Color")}
                  >
                    <span className="material-symbols-outlined">palette</span> Color
                  </button>
                  <button
                    type="button"
                    className={`m-segment-btn ${colorMode === "Monochrome" ? "active" : ""}`}
                    onClick={() => setColorMode("Monochrome")}
                  >
                    <span className="material-symbols-outlined">filter_b_and_w</span> Black & White
                  </button>
                </div>
              </div>

              {/* Duplex */}
              <div className="m-form-group">
                <label className="m-label">Print Sides (Duplex)</label>
                <div className="m-segmented">
                  <button
                    type="button"
                    className={`m-segment-btn ${!duplex ? "active" : ""}`}
                    onClick={() => setDuplex(false)}
                  >
                    Single-Sided
                  </button>
                  <button
                    type="button"
                    className={`m-segment-btn ${duplex ? "active" : ""}`}
                    onClick={() => setDuplex(true)}
                  >
                    2-Sided (Long Edge)
                  </button>
                </div>
              </div>

              {/* Orientation */}
              <div className="m-form-group">
                <label className="m-label">Orientation</label>
                <div className="m-segmented">
                  <button
                    type="button"
                    className={`m-segment-btn ${orientation === "Portrait" ? "active" : ""}`}
                    onClick={() => setOrientation("Portrait")}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    className={`m-segment-btn ${orientation === "Landscape" ? "active" : ""}`}
                    onClick={() => setOrientation("Landscape")}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmitPrint}
                disabled={!selectedFile || isPrinting}
              >
                <span className="material-symbols-outlined">print</span>
                {isPrinting ? "Transmitting to Spooler..." : "Print Document Now"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PRINT QUEUE */}
        {activeTab === "queue" && (
          <div className="m-card">
            <div className="m-card-header">
              <div className="m-card-title">
                <span className="material-symbols-outlined">list_alt</span>
                Print Queue
              </div>
              <button
                className="m-chip"
                style={{ cursor: "pointer" }}
                onClick={() => setJobs([])}
              >
                Clear Completed
              </button>
            </div>

            {jobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: 13 }}>
                No active jobs in queue.
              </div>
            ) : (
              <div>
                {jobs.map((job) => (
                  <div key={job.id} style={{
                    background: "#FFFFFF",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 14,
                    marginBottom: 10,
                    boxShadow: "var(--shadow-subtle)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-main)" }}>{job.fileName}</div>
                        <div style={{ fontSize: 11, color: "var(--text-sub)", marginTop: 2 }}>{job.printer} • {job.copies} copy</div>
                      </div>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "var(--radius-full)",
                        fontSize: 11,
                        fontWeight: 700,
                        background: job.status === "Completed" ? "var(--success-light)" : "var(--primary-light)",
                        color: job.status === "Completed" ? "var(--success-text)" : "var(--primary)",
                        border: `1px solid ${job.status === "Completed" ? "var(--success-border)" : "var(--primary-border)"}`
                      }}>
                        {job.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, borderTop: "1px solid var(--bg-subtle)", paddingTop: 6 }}>
                      Submitted {job.time} • Job ID: {job.id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRINTERS LIST */}
        {activeTab === "printers" && (
          <div className="m-card">
            <div className="m-card-header">
              <div className="m-card-title">
                <span className="material-symbols-outlined">devices</span>
                Available Printers
              </div>
              <span className="m-chip">{printerList.length} Online</span>
            </div>
            <div>
              {printerList.map((printer, index) => (
                <div
                  key={printer}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: "#FFFFFF",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    marginBottom: 8,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedPrinter(printer);
                    setActiveTab("print");
                    showToast(`Selected: ${printer}`);
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-md)",
                      background: "var(--primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary)"
                    }}>
                      <span className="material-symbols-outlined">print</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>{printer}</div>
                      <div style={{ fontSize: 11, color: "var(--text-sub)", marginTop: 2 }}>
                        {index === 0 ? "Default Windows Spooler" : "Ready • Windows Spooler"}
                      </div>
                    </div>
                  </div>
                  <span className="m-chip" style={{ color: "var(--success-text)", borderColor: "var(--success-border)" }}>Ready</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SERVER TELEMETRY */}
        {activeTab === "server" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="m-card">
              <div className="m-card-header">
                <div className="m-card-title">
                  <span className="material-symbols-outlined">dns</span>
                  Host Machine Status
                </div>
                <span className="m-chip" style={{ color: "var(--success-text)", borderColor: "var(--success-border)" }}>Active</span>
              </div>
              <div className="telemetry-grid">
                <div className="telemetry-box">
                  <div className="telemetry-val">{jobs.length}</div>
                  <div className="telemetry-lbl">Total Jobs</div>
                </div>
                <div className="telemetry-box">
                  <div className="telemetry-val">{printerList.length}</div>
                  <div className="telemetry-lbl">Printers Ready</div>
                </div>
                <div className="telemetry-box">
                  <div className="telemetry-val">1</div>
                  <div className="telemetry-lbl">Host Connected</div>
                </div>
                <div className="telemetry-box">
                  <div className="telemetry-val">5000</div>
                  <div className="telemetry-lbl">HTTPS Port</div>
                </div>
              </div>
            </div>

            <div className="m-card">
              <div className="m-card-header">
                <div className="m-card-title">
                  <span className="material-symbols-outlined" style={{ color: "#F58220" }}>cloud_done</span>
                  Printora Cloud Relay
                </div>
                <span className="m-chip" style={{ color: "var(--success-text)" }}>Connected</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.4, marginBottom: 12 }}>
                Users anywhere can open this link to print from mobile or desktop via Printora Cloud Relay (requires 1-click PC approval).
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="text"
                  className="m-input"
                  style={{ fontSize: 12, height: 40 }}
                  readOnly
                  value={`https://printora.calclabz.com/${hostId}`}
                />
                <button
                  type="button"
                  className="btn-header-icon"
                  title="Copy URL"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://printora.calclabz.com/${hostId}`);
                    showToast("Portal URL copied to clipboard!");
                  }}
                >
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          type="button"
          className={`nav-item ${activeTab === "print" ? "active" : ""}`}
          onClick={() => setActiveTab("print")}
        >
          <span className="material-symbols-outlined">print</span>
          <span className="nav-label">Print</span>
        </button>
        <button
          type="button"
          className={`nav-item ${activeTab === "queue" ? "active" : ""}`}
          onClick={() => setActiveTab("queue")}
        >
          <span className="material-symbols-outlined">list_alt</span>
          <span className="nav-label">Queue</span>
        </button>
        <button
          type="button"
          className={`nav-item ${activeTab === "printers" ? "active" : ""}`}
          onClick={() => setActiveTab("printers")}
        >
          <span className="material-symbols-outlined">devices</span>
          <span className="nav-label">Printers</span>
        </button>
        <button
          type="button"
          className={`nav-item ${activeTab === "server" ? "active" : ""}`}
          onClick={() => setActiveTab("server")}
        >
          <span className="material-symbols-outlined">dns</span>
          <span className="nav-label">Server</span>
        </button>
      </nav>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="m-toast">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
}
