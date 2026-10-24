/**
 * PrintoraWorkflow (v3, realistic hardware)
 *
 * Android / iPhone / iPad / Browser -> encrypted connection -> Windows PC
 * (Printora App -> Windows Print System) -> printer.
 *
 * Two connection modes in one 20s loop:
 *   LOCAL  (0-47%)   phone -> local Wi-Fi -> PC
 *   REMOTE (47-100%) phone -> 4G/5G -> Cloudflare Tunnel -> PC
 * The PDF leaves the phone screen, travels encrypted (lock on the packet),
 * opens in Printora App on the PC, goes through the Windows Print System,
 * prints, and the temporary file is deleted ("leave no trace").
 *
 * - No dependencies, no hooks: inline SVG + CSS keyframes only.
 *   Works as a server component in Next.js (no "use client").
 * - prefers-reduced-motion is respected (pass motion="always" to force it).
 * - Hardware (phone, monitor, printer) keeps its own realistic colours.
 *   Brand/diagram colours come from the --prw-* tokens below.
 */

import React from "react";

const css = `
/* ---------- THEME TOKENS (edit these to match the site) ---------- */
.prw-root {
  --prw-bg:#F4F7FB; --prw-panel:#FFFFFF; --prw-card:#F1F5FA; --prw-track:#DDE5F0;
  --prw-line:#CBD6E6; --prw-text:#0F1B2D; --prw-muted:#5A6B85;
  --prw-accent:#0E9F7E; --prw-accent2:#0284C7; --prw-onacc:#FFFFFF;
  --prw-paper:#FFFFFF; --prw-edge:#C7D0DF; --prw-ink:#1B2A44;
}
.prw-root[data-theme="dark"],
:is(.dark) .prw-root {
  --prw-bg:#0B1220; --prw-panel:#101A2E; --prw-card:#15223A; --prw-track:#223250;
  --prw-line:#2A3B59; --prw-text:#F1F5FB; --prw-muted:#93A4BF;
  --prw-accent:#22D3A6; --prw-accent2:#38BDF8; --prw-onacc:#04201A;
  --prw-paper:#F6F7F9; --prw-edge:#C7D0DF; --prw-ink:#1B2A44;
}
.prw-root[data-theme="light"],
:not(.dark) .prw-root[data-theme="auto"] {
  --prw-bg:#F4F7FB; --prw-panel:#FFFFFF; --prw-card:#F1F5FA; --prw-track:#DDE5F0;
  --prw-line:#CBD6E6; --prw-text:#0F1B2D; --prw-muted:#5A6B85;
  --prw-accent:#0E9F7E; --prw-accent2:#0284C7; --prw-onacc:#FFFFFF;
  --prw-paper:#FFFFFF; --prw-edge:#C7D0DF; --prw-ink:#1B2A44;
}

.prw-root text { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
.pf-bg{fill:var(--prw-bg)} .pf-panel{fill:var(--prw-panel)} .pf-card{fill:var(--prw-card)}
.pf-track{fill:var(--prw-track)} .pf-text{fill:var(--prw-text)} .pf-muted{fill:var(--prw-muted)}
.pf-accent{fill:var(--prw-accent)} .pf-accent2{fill:var(--prw-accent2)} .pf-onacc{fill:var(--prw-onacc)}
.pf-paper{fill:var(--prw-paper)} .pf-edge{fill:var(--prw-edge)} .pf-ink{fill:var(--prw-ink)}
.pf-none{fill:none}
.ps-line{stroke:var(--prw-line)} .ps-accent{stroke:var(--prw-accent)} .ps-muted{stroke:var(--prw-muted)}
.ps-edge{stroke:var(--prw-edge)}

/* ---------- Motion (one 20s loop) ---------- */
.prw-flow { stroke-dasharray: 6 10; animation: prw-dash 1s linear infinite !important; }
@keyframes prw-dash { to { stroke-dashoffset: -16; } }
.prw-blink { animation: prw-blink 3s ease-in-out infinite !important; }
@keyframes prw-blink { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }

/* Print button press on the phone */
.prw-btn { opacity: 0; animation: prw-btn 20s linear infinite !important; }
@keyframes prw-btn {
  0%     { opacity: 0; }
  0.4%   { opacity: 0.6; }
  1.5%   { opacity: 0; }
  46.5%  { opacity: 0; }
  47.3%  { opacity: 0.6; }
  48.5%  { opacity: 0; }
  100%   { opacity: 0; }
}

/* Document packets */
.prw-pkt { opacity: 0; filter: drop-shadow(0 0 4px var(--prw-accent)); }
.prw-pkt-local  { animation: prw-local 20s linear infinite !important; }
.prw-pkt-remote { animation: prw-remote 20s linear infinite !important; }

@keyframes prw-local {
  0%    { transform: translate(131px,193px); opacity: 0; }
  1.5%  { transform: translate(131px,193px); opacity: 1; }
  2%    { transform: translate(131px,193px); }
  16%   { transform: translate(755px,193px); }
  20%   { transform: translate(755px,193px); }
  23%   { transform: translate(931px,236px); }
  27%   { transform: translate(931px,236px); }
  31%   { transform: translate(1030px,246px); }
  32.5% { transform: translate(1067px,246px); }
  34.5% { transform: translate(1067px,296px); }
  36.5% { transform: translate(1112px,296px); opacity: 1; }
  37%   { transform: translate(1124px,296px); opacity: 0; }
  100%  { transform: translate(1124px,296px); opacity: 0; }
}
@keyframes prw-remote {
  0%,47% { transform: translate(131px,193px); opacity: 0; }
  48.5%  { transform: translate(131px,193px); opacity: 1; }
  50.2%  { transform: translate(216px,193px); }
  55.4%  { transform: translate(216px,470px); }
  62.4%  { transform: translate(590px,470px); }
  67.6%  { transform: translate(590px,193px); }
  71%    { transform: translate(755px,193px); }
  75%    { transform: translate(755px,193px); }
  78%    { transform: translate(931px,236px); }
  82%    { transform: translate(931px,236px); }
  86%    { transform: translate(1030px,246px); }
  87.5%  { transform: translate(1067px,246px); }
  89.5%  { transform: translate(1067px,296px); }
  91.5%  { transform: translate(1112px,296px); opacity: 1; }
  92%    { transform: translate(1124px,296px); opacity: 0; }
  100%   { transform: translate(1124px,296px); opacity: 0; }
}

/* Lock on the packet while it is encrypted in transit */
.prw-plock { opacity: 0; }
.prw-plock-local  { animation: prw-pl-local 20s linear infinite !important; }
.prw-plock-remote { animation: prw-pl-remote 20s linear infinite !important; }
@keyframes prw-pl-local {
  0%,1.5% { opacity: 0; }
  3%,16%  { opacity: 1; }
  19%     { opacity: 0; }
  100%    { opacity: 0; }
}
@keyframes prw-pl-remote {
  0%,48%  { opacity: 0; }
  50%,71% { opacity: 1; }
  74%     { opacity: 0; }
  100%    { opacity: 0; }
}

/* Halos and glows, timed to the packets */
.prw-halo { opacity: 0; transform-box: fill-box; transform-origin: center; }
.prw-glow { opacity: 0; }
.prw-halo-wifi { animation: prw-h-wifi 20s ease-out infinite !important; }
.prw-halo-4g   { animation: prw-h-4g 20s ease-out infinite !important; }
.prw-halo-lock { animation: prw-h-lock 20s ease-out infinite !important; }
.prw-glow-tunnel { animation: prw-g-tunnel 20s ease-in-out infinite !important; }
.prw-glow-app    { animation: prw-g-app 20s ease-in-out infinite !important; }
.prw-glow-spool  { animation: prw-g-spool 20s ease-in-out infinite !important; }

@keyframes prw-h-wifi {
  0%,4%   { opacity: 0; transform: scale(0.8); }
  7.6%    { opacity: 0.9; transform: scale(1); }
  11.5%   { opacity: 0; transform: scale(1.5); }
  100%    { opacity: 0; transform: scale(1.5); }
}
@keyframes prw-h-4g {
  0%,54%  { opacity: 0; transform: scale(0.8); }
  57.5%   { opacity: 0.9; transform: scale(1); }
  61%     { opacity: 0; transform: scale(1.5); }
  100%    { opacity: 0; transform: scale(1.5); }
}
@keyframes prw-h-lock {
  0%,10%  { opacity: 0; transform: scale(0.8); }
  13.2%   { opacity: 0.9; transform: scale(1); }
  16.5%   { opacity: 0; transform: scale(1.6); }
  65%     { opacity: 0; transform: scale(0.8); }
  68.4%   { opacity: 0.9; transform: scale(1); }
  72%     { opacity: 0; transform: scale(1.6); }
  100%    { opacity: 0; transform: scale(1.6); }
}
@keyframes prw-g-tunnel {
  0%,57.5% { opacity: 0; }
  59.5%,62% { opacity: 0.95; }
  64.5%   { opacity: 0; }
  100%    { opacity: 0; }
}
@keyframes prw-g-app {
  0%,14%  { opacity: 0; }
  16%,21% { opacity: 0.9; }
  23%     { opacity: 0; }
  69%     { opacity: 0; }
  71%,76% { opacity: 0.9; }
  78%     { opacity: 0; }
  100%    { opacity: 0; }
}
@keyframes prw-g-spool {
  0%,21%  { opacity: 0; }
  23%,28% { opacity: 0.9; }
  30%     { opacity: 0; }
  76%     { opacity: 0; }
  78%,83% { opacity: 0.9; }
  85%     { opacity: 0; }
  100%    { opacity: 0; }
}

/* Job row in Printora App: arrives, is received, then deleted after printing */
.prw-job { opacity: 0; animation: prw-job 20s ease-in-out infinite !important; }
@keyframes prw-job {
  0%,15%  { opacity: 0; }
  17%,36% { opacity: 1; }
  39%     { opacity: 0; }
  70%     { opacity: 0; }
  72%,91% { opacity: 1; }
  94%     { opacity: 0; }
  100%    { opacity: 0; }
}
.prw-del { opacity: 0; animation: prw-del 20s ease-in-out infinite !important; }
@keyframes prw-del {
  0%,38%  { opacity: 0; }
  40%,45% { opacity: 1; }
  48%     { opacity: 0; }
  93%     { opacity: 0; }
  95%,99% { opacity: 1; }
  100%    { opacity: 0; }
}
.prw-bar, .prw-shim { transform-box: fill-box; transform-origin: left center; transform: scaleX(0); }
.prw-bar  { animation: prw-bar 20s ease-in-out infinite !important; }
.prw-shim { animation: prw-shim 20s ease-in-out infinite !important; }
@keyframes prw-bar {
  0%,15%  { transform: scaleX(0); }
  19%,36% { transform: scaleX(1); }
  38%     { transform: scaleX(0); }
  70%     { transform: scaleX(0); }
  74%,91% { transform: scaleX(1); }
  93%     { transform: scaleX(0); }
  100%    { transform: scaleX(0); }
}
@keyframes prw-shim {
  0%,22%  { transform: scaleX(0); }
  26%,29% { transform: scaleX(1); }
  30%     { transform: scaleX(0); }
  77%     { transform: scaleX(0); }
  81%,84% { transform: scaleX(1); }
  85%     { transform: scaleX(0); }
  100%    { transform: scaleX(0); }
}

/* Printer: output paper, display state, status light */
.prw-paper { opacity: 0; animation: prw-paper 20s ease-in-out infinite !important; }
@keyframes prw-paper {
  0%,36%   { transform: translateY(0); opacity: 0; }
  37%      { transform: translateY(0); opacity: 1; }
  43%,46%  { transform: translateY(86px); opacity: 1; }
  47.5%    { transform: translateY(86px); opacity: 0; }
  91%      { transform: translateY(0); opacity: 0; }
  92%      { transform: translateY(0); opacity: 1; }
  98%,99%  { transform: translateY(86px); opacity: 1; }
  100%     { transform: translateY(86px); opacity: 0; }
}
.prw-ready { opacity: 1; animation: prw-ready 20s linear infinite !important; }
@keyframes prw-ready {
  0%,36%      { opacity: 1; }
  36.5%,46%   { opacity: 0; }
  47%,91%     { opacity: 1; }
  91.5%,99.5% { opacity: 0; }
  100%        { opacity: 1; }
}
.prw-printing, .prw-led { opacity: 0; animation: prw-printing 20s linear infinite !important; }
@keyframes prw-printing {
  0%,36%      { opacity: 0; }
  36.5%,46%   { opacity: 1; }
  47%,91%     { opacity: 0; }
  91.5%,99.5% { opacity: 1; }
  100%        { opacity: 0; }
}
`;

function Lock({ scale = 1 }: { scale?: number }) {
  return (
    <g transform={`scale(${scale})`}>
      <path
        className="pf-none ps-accent"
        d="M-3.5,-1 V-4 a3.5,3.5 0 0 1 7,0 V-1"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect className="pf-accent" x="-5.5" y="-1" width="11" height="8.5" rx="2" />
    </g>
  );
}

function PdfPacket({ variant }: { variant: "local" | "remote" }) {
  return (
    <g>
      <rect x="-11" y="-14" width="22" height="28" rx="3" fill="#FFFFFF" stroke="#C7D0DF" strokeWidth="1" />
      <rect className="pf-accent" x="-11" y="5" width="22" height="9" rx="3" />
      <rect className="pf-accent" x="-11" y="5" width="22" height="3" />
      <text className="pf-onacc" x="0" y="12" textAnchor="middle" fontSize="7" fontWeight="700">PDF</text>
      <rect x="-6" y="-9" width="12" height="2" fill="#1B2A44" />
      <rect x="-6" y="-4" width="12" height="1.6" fill="#C7D0DF" />
      <rect x="-6" y="-0.5" width="8" height="1.6" fill="#C7D0DF" />
      <g className={`prw-plock prw-plock-${variant}`} transform="translate(11,-14)">
        <circle className="pf-panel ps-accent" r="8" strokeWidth="1.2" />
        <g transform="translate(0,0.5)"><Lock scale={0.6} /></g>
      </g>
    </g>
  );
}

function Pill({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect className="pf-card ps-line" x={x} y={y} width="200" height="28" rx="14" />
      <path
        className="pf-none ps-accent"
        d={`M${x + 14},${y + 14} l3.5,3.5 l6.5,-7.5`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text className="pf-muted" x={x + 34} y={y + 18.5} fontSize="12.5">{label}</text>
    </g>
  );
}

export interface PrintoraWorkflowProps {
  className?: string;
  theme?: "light" | "dark" | "auto";
  motion?: "auto" | "always";
  accent?: string;
  accent2?: string;
  idPrefix?: string;
}

export default function PrintoraWorkflow({
  className,
  theme = "auto",
  motion = "always",
  accent,
  accent2,
  idPrefix = "prw",
}: PrintoraWorkflowProps) {
  const style: React.CSSProperties & Record<string, string> = {};
  if (accent) style["--prw-accent"] = accent;
  if (accent2) style["--prw-accent2"] = accent2;
  const g = (n: string) => `${idPrefix}-${n}`;
  const u = (n: string) => `url(#${g(n)})`;

  return (
    <svg
      className={`prw-root ${className || ""}`}
      data-theme={theme}
      data-motion={motion}
      style={style}
      viewBox="0 44 1400 570"
      width="100%"
      role="img"
      aria-label="Printora workflow: a phone, tablet or browser sends a PDF over an encrypted connection, either locally over Wi-Fi or remotely over 4G or 5G through a Cloudflare Tunnel, to a Windows PC running the Printora app. The app hands it to the Windows print system and on to the printer, and the temporary file is deleted after printing."
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{css}</style>
      <defs>
        <linearGradient id={g("ink")} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--prw-accent)" />
          <stop offset="1" stopColor="var(--prw-accent2)" />
        </linearGradient>
        <linearGradient id={g("frame")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D5DAE3" />
          <stop offset="0.35" stopColor="#8D95A4" />
          <stop offset="0.7" stopColor="#E3E7EE" />
          <stop offset="1" stopColor="#7B8393" />
        </linearGradient>
        <linearGradient id={g("scr")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#12233F" />
          <stop offset="1" stopColor="#0A1424" />
        </linearGradient>
        <linearGradient id={g("mon")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2E3541" />
          <stop offset="1" stopColor="#10141B" />
        </linearGradient>
        <linearGradient id={g("neck")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6C7585" />
          <stop offset="0.5" stopColor="#A8B0BE" />
          <stop offset="1" stopColor="#5A6372" />
        </linearGradient>
        <linearGradient id={g("wall")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A2B6E" />
          <stop offset="0.55" stopColor="#1A5BD1" />
          <stop offset="1" stopColor="#4BA3F5" />
        </linearGradient>
        <linearGradient id={g("body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A4252" />
          <stop offset="1" stopColor="#1A1F28" />
        </linearGradient>
        <linearGradient id={g("lid")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A5465" />
          <stop offset="1" stopColor="#2A303C" />
        </linearGradient>
        <pattern id={g("keys")} width="8" height="5" patternUnits="userSpaceOnUse">
          <rect width="6.4" height="3.6" rx="0.8" fill="#3A4252" />
        </pattern>
        <clipPath id={g("phone-screen")}>
          <rect x="6" y="6" width="84" height="188" rx="11" />
        </clipPath>
        <clipPath id={g("pad-screen")}>
          <rect x="5" y="5" width="52" height="74" rx="3" />
        </clipPath>
        <clipPath id={g("pc-screen")}>
          <rect x="660" y="110" width="360" height="202" rx="3" />
        </clipPath>
        <clipPath id={g("paper-clip")}>
          <rect x="1100" y="326" width="262" height="110" />
        </clipPath>
      </defs>

      <rect className="pf-bg" x="0" y="44" width="1400" height="570" rx="24" />

      {/* ================= DEVICES ================= */}
      <rect className="pf-panel ps-line" x="36" y="64" width="190" height="424" rx="18" />
      <text className="pf-text" x="56" y="86" fontSize="13" fontWeight="700">Your devices</text>

      {/* Phone */}
      <g transform="translate(83,100)">
        <ellipse cx="48" cy="207" rx="42" ry="5" fill="#000" opacity="0.15" />
        <rect x="-2" y="52" width="3" height="26" rx="1.5" fill="#8D95A4" />
        <rect x="-2" y="84" width="3" height="26" rx="1.5" fill="#8D95A4" />
        <rect x="95" y="70" width="3" height="34" rx="1.5" fill="#8D95A4" />
        <rect width="96" height="200" rx="17" fill={u("frame")} />
        <rect x="2" y="2" width="92" height="196" rx="15" fill="#06090F" />
        <g clipPath={u("phone-screen")}>
          <rect x="6" y="6" width="84" height="188" fill={u("scr")} />
          {/* status bar */}
          <text x="14" y="17" fontSize="6.5" fontWeight="600" fill="#FFFFFF">9:41</text>
          <g fill="#FFFFFF">
            <rect x="58" y="16" width="2" height="2.5" rx="0.5" />
            <rect x="61" y="14.5" width="2" height="4" rx="0.5" />
            <rect x="64" y="13" width="2" height="5.5" rx="0.5" />
            <rect x="67" y="11.5" width="2" height="7" rx="0.5" />
          </g>
          <rect x="72" y="12" width="11" height="6" rx="1.6" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          <rect x="73.2" y="13.2" width="7" height="3.6" rx="0.8" fill="#FFFFFF" />
          <rect x="83.3" y="14" width="1" height="2" rx="0.4" fill="#FFFFFF" />
          <circle cx="48" cy="15" r="2.4" fill="#000" stroke="#1D2638" strokeWidth="0.8" />
          {/* app header */}
          <circle className="pf-accent" cx="17" cy="32" r="4.5" />
          <rect x="14.8" y="30.4" width="4.4" height="3.2" rx="0.8" fill="#FFFFFF" />
          <text x="25" y="35" fontSize="8.5" fontWeight="700" fill="#FFFFFF">Printora</text>
          {/* printer selector */}
          <rect x="12" y="42" width="72" height="20" rx="6" fill="#18263F" stroke="#243556" strokeWidth="0.8" />
          <rect x="19" y="45.5" width="6" height="3" fill="#FFFFFF" />
          <rect x="17" y="48" width="10" height="7" rx="1.5" fill="#9FB3C8" />
          <text x="31" y="51" fontSize="5.8" fontWeight="600" fill="#FFFFFF">HP LaserJet Pro</text>
          <circle className="pf-accent" cx="33" cy="57" r="1.4" />
          <text x="37" y="58.5" fontSize="5" fill="#8FA3BF">Ready</text>
          {/* document preview */}
          <rect x="28" y="66" width="40" height="54" rx="2" fill="#FFFFFF" />
          <rect x="33" y="71" width="18" height="3" fill="#1B2A44" />
          <rect x="33" y="78" width="30" height="1.6" fill="#C7D0DF" />
          <rect x="33" y="82" width="30" height="1.6" fill="#C7D0DF" />
          <rect x="33" y="86" width="20" height="1.6" fill="#C7D0DF" />
          <rect x="33" y="92" width="30" height="18" rx="1.5" fill={u("ink")} />
          <rect x="33" y="114" width="14" height="1.6" fill="#C7D0DF" />
          {/* settings chips */}
          {[12, 37, 62].map((x, i) => (
            <g key={x}>
              <rect x={x} y="126" width="22" height="12" rx="4" fill="#18263F" />
              <text x={x + 11} y="134" fontSize="5" textAnchor="middle" fill="#C8D4E6">
                {["1 copy", "Color", "Duplex"][i]}
              </text>
            </g>
          ))}
          {/* print button */}
          <rect className="pf-accent" x="12" y="146" width="72" height="22" rx="11" />
          <rect className="prw-btn" x="12" y="146" width="72" height="22" rx="11" fill="#FFFFFF" />
          <text className="pf-onacc" x="48" y="160" fontSize="8.5" fontWeight="700" textAnchor="middle">Print</text>
          <rect x="34" y="186" width="28" height="2.5" rx="1.25" fill="#FFFFFF" opacity="0.55" />
          <path d="M6,6 H64 L6,92 Z" fill="#FFFFFF" opacity="0.06" />
        </g>
      </g>

      {/* iPad */}
      <g transform="translate(52,322)">
        <rect width="62" height="84" rx="8" fill={u("frame")} />
        <rect x="2" y="2" width="58" height="80" rx="6" fill="#06090F" />
        <g clipPath={u("pad-screen")}>
          <rect x="5" y="5" width="52" height="74" fill={u("scr")} />
          <circle className="pf-accent" cx="12" cy="14" r="3" />
          <text x="18" y="16.5" fontSize="6" fontWeight="700" fill="#FFFFFF">Printora</text>
          <rect x="17" y="24" width="28" height="34" rx="1.5" fill="#FFFFFF" />
          <rect x="21" y="28" width="12" height="2.2" fill="#1B2A44" />
          <rect x="21" y="33" width="20" height="1.4" fill="#C7D0DF" />
          <rect x="21" y="37" width="20" height="1.4" fill="#C7D0DF" />
          <rect x="21" y="42" width="20" height="11" rx="1" fill={u("ink")} />
          <rect className="pf-accent" x="14" y="64" width="34" height="9" rx="4.5" />
          <path d="M5,5 H40 L5,50 Z" fill="#FFFFFF" opacity="0.06" />
        </g>
      </g>

      {/* Browser window with QR */}
      <g transform="translate(124,334)">
        <rect width="82" height="56" rx="5" fill="#F3F6FA" stroke="#C9D3E0" />
        <path d="M0,11 V5 a5,5 0 0 1 5,-5 H77 a5,5 0 0 1 5,5 V11 Z" fill="#E5EBF3" />
        <circle cx="6" cy="5.5" r="1.8" fill="#FF5F57" />
        <circle cx="12" cy="5.5" r="1.8" fill="#FEBC2E" />
        <circle cx="18" cy="5.5" r="1.8" fill="#28C840" />
        <rect x="24" y="2.5" width="52" height="6" rx="3" fill="#FFFFFF" stroke="#D5DDE8" strokeWidth="0.6" />
        <g fill="none" stroke="#111827" strokeWidth="1.6">
          <rect x="8.8" y="17.8" width="7.4" height="7.4" />
          <rect x="26.8" y="17.8" width="7.4" height="7.4" />
          <rect x="8.8" y="35.8" width="7.4" height="7.4" />
        </g>
        <g fill="#111827">
          <rect x="11" y="20" width="3" height="3" />
          <rect x="29" y="20" width="3" height="3" />
          <rect x="11" y="38" width="3" height="3" />
          <rect x="19" y="18" width="2.4" height="2.4" />
          <rect x="22" y="22" width="2.4" height="2.4" />
          <rect x="18" y="27" width="2.4" height="2.4" />
          <rect x="24" y="30" width="2.4" height="2.4" />
          <rect x="29" y="28" width="2.4" height="2.4" />
          <rect x="20" y="34" width="2.4" height="2.4" />
          <rect x="27" y="36" width="2.4" height="2.4" />
          <rect x="31" y="40" width="2.4" height="2.4" />
        </g>
        <text x="42" y="24" fontSize="6.5" fontWeight="700" fill="#0F1B2D">Web Print</text>
        <rect x="42" y="28" width="30" height="1.6" fill="#C7D0DF" />
        <rect x="42" y="32" width="24" height="1.6" fill="#C7D0DF" />
        <rect className="pf-accent" x="42" y="38" width="30" height="9" rx="4.5" />
        <text className="pf-onacc" x="57" y="44.4" fontSize="5.5" fontWeight="700" textAnchor="middle">Print</text>
      </g>

      <text className="pf-text" x="131" y="432" textAnchor="middle" fontSize="11.5" fontWeight="600">Android, iPhone, iPad, Browser</text>
      <text className="pf-muted" x="131" y="450" textAnchor="middle" fontSize="10.5">Auto-discover, scan QR or Web Print</text>

      {/* ================= LANES ================= */}
      <text className="pf-text" x="250" y="160" fontSize="14" fontWeight="600">Local mode: same Wi-Fi</text>
      <text className="pf-text" x="250" y="428" fontSize="14" fontWeight="600">Remote mode: over 4G or 5G</text>

      <line className="prw-flow ps-line" x1="181" y1="193" x2="670" y2="193" strokeWidth="2" />
      <polyline className="prw-flow pf-none ps-line" points="216,193 216,470 590,470 590,193" strokeWidth="2" strokeLinejoin="round" />
      <circle className="pf-track" cx="590" cy="193" r="4" />

      {/* Wi-Fi node */}
      <g transform="translate(380,193)">
        <circle className="pf-card ps-line" r="26" strokeWidth="2" />
        <circle className="pf-none ps-accent prw-halo prw-halo-wifi" r="26" strokeWidth="2" />
        <g className="pf-none ps-accent" strokeWidth="2" strokeLinecap="round">
          <path d="M-11,-3 a15,15 0 0 1 22,0" />
          <path d="M-6.5,2 a8.5,8.5 0 0 1 13,0" />
        </g>
        <circle className="pf-accent" cy="8" r="2" />
      </g>
      <text className="pf-muted" x="380" y="239" textAnchor="middle" fontSize="13">Local Wi-Fi</text>

      {/* 4G/5G node */}
      <g transform="translate(330,470)">
        <circle className="pf-card ps-line" r="26" strokeWidth="2" />
        <circle className="pf-none ps-accent prw-halo prw-halo-4g" r="26" strokeWidth="2" />
        <g className="pf-accent">
          <rect x="-11" y="3" width="4" height="6" rx="1" />
          <rect x="-5" y="-1" width="4" height="10" rx="1" />
          <rect x="1" y="-5" width="4" height="14" rx="1" />
          <rect x="7" y="-9" width="4" height="18" rx="1" />
        </g>
      </g>
      <text className="pf-muted" x="330" y="516" textAnchor="middle" fontSize="13">4G / 5G</text>

      {/* Cloudflare Tunnel */}
      <g transform="translate(460,470)">
        <rect className="pf-bg ps-line" x="-70" y="-18" width="140" height="36" rx="18" strokeWidth="2" />
        <rect className="pf-none ps-accent prw-glow prw-glow-tunnel" x="-70" y="-18" width="140" height="36" rx="18" strokeWidth="2.5" />
        <line className="prw-flow ps-accent" x1="-56" y1="0" x2="56" y2="0" strokeWidth="2" opacity="0.5" />
        <circle className="pf-card ps-accent" r="14" strokeWidth="1.5" />
        <Lock scale={0.85} />
      </g>
      <text className="pf-muted" x="460" y="516" textAnchor="middle" fontSize="13">Cloudflare Tunnel</text>
      <text className="pf-muted" x="460" y="532" textAnchor="middle" fontSize="11" opacity="0.8">No open ports</text>

      {/* Encrypted connection badge at PC entry (both modes) */}
      <text className="pf-muted" x="648" y="166" textAnchor="end" fontSize="12">Encrypted, TLS 1.2+</text>
      <g transform="translate(630,193)">
        <circle className="pf-bg ps-accent" r="13" strokeWidth="1.5" />
        <circle className="pf-none ps-accent prw-halo prw-halo-lock" r="13" strokeWidth="2" />
        <Lock scale={0.8} />
      </g>

      {/* ================= DESK ================= */}
      <rect className="pf-track ps-line" x="630" y="382" width="740" height="38" rx="10" strokeWidth="1" />
      <rect x="634" y="383" width="732" height="2" rx="1" fill="#FFFFFF" opacity="0.5" />

      {/* ================= WINDOWS PC ================= */}
      <ellipse cx="840" cy="384" rx="92" ry="4" fill="#000" opacity="0.15" />
      <rect x="826" y="322" width="28" height="52" fill={u("neck")} />
      <rect x="772" y="372" width="136" height="10" rx="5" fill={u("neck")} />
      <rect x="650" y="100" width="380" height="226" rx="12" fill={u("mon")} stroke="#3A4252" strokeWidth="1" />
      <circle className="pf-accent prw-blink" cx="1008" cy="319" r="1.8" />

      <g clipPath={u("pc-screen")}>
        {/* Windows-style desktop */}
        <rect x="660" y="110" width="360" height="202" fill={u("wall")} />
        <ellipse cx="780" cy="190" rx="190" ry="62" fill="#7CC0FF" opacity="0.22" transform="rotate(-24 780 190)" />
        <ellipse cx="930" cy="240" rx="150" ry="46" fill="#2E7BEF" opacity="0.35" transform="rotate(-24 930 240)" />

        {/* Window A: Printora App */}
        <rect x="670" y="128" width="170" height="100" rx="6" fill="#000" opacity="0.18" />
        <rect className="pf-none ps-accent prw-glow prw-glow-app" x="670" y="126" width="170" height="100" rx="6" strokeWidth="2.5" />
        <rect x="670" y="126" width="170" height="100" rx="6" fill="#FFFFFF" stroke="#D5DDE8" strokeWidth="0.8" />
        <path d="M670,142 V132 a6,6 0 0 1 6,-6 H834 a6,6 0 0 1 6,6 V142 Z" fill="#F3F6FA" />
        <circle className="pf-accent" cx="679" cy="134" r="3.4" />
        <text x="687" y="137" fontSize="8" fontWeight="600" fill="#1B2A44">Printora App</text>
        <line x1="802" y1="134" x2="808" y2="134" stroke="#5A6B85" strokeWidth="1" />
        <rect x="813" y="131" width="6" height="6" fill="none" stroke="#5A6B85" strokeWidth="0.9" />
        <path d="M824,131 l6,6 M830,131 l-6,6" stroke="#5A6B85" strokeWidth="1" />
        <circle className="pf-accent prw-blink" cx="680" cy="152" r="2.2" />
        <text x="686" y="154.8" fontSize="7" fill="#5A6B85">Listening</text>
        <rect x="790" y="147" width="42" height="11" rx="5.5" fill="#E3F6F0" />
        <text className="pf-accent" x="811" y="154.9" fontSize="6.2" fontWeight="700" textAnchor="middle">TLS 1.2+</text>
        <rect x="680" y="165" width="150" height="56" rx="6" fill="#F1F5FA" stroke="#DCE4EF" strokeWidth="0.8" />
        <g className="prw-job">
          <rect x="688" y="176" width="16" height="22" rx="2" fill="#FFFFFF" stroke="#C7D0DF" strokeWidth="0.8" />
          <rect className="pf-accent" x="688" y="189" width="16" height="9" rx="2" />
          <rect className="pf-accent" x="688" y="189" width="16" height="3" />
          <text x="712" y="186" fontSize="7.6" fontWeight="600" fill="#0F1B2D">invoice_0412.pdf</text>
          <text x="712" y="195.5" fontSize="6.2" fill="#5A6B85">Received and decrypted</text>
          <rect x="712" y="203" width="108" height="5" rx="2.5" fill="#DCE4EF" />
          <rect className="pf-accent prw-bar" x="712" y="203" width="108" height="5" rx="2.5" />
        </g>
        <g className="prw-del">
          <path className="pf-none ps-accent" d="M690,191 l4,4 l8,-9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <text className="pf-accent" x="712" y="196" fontSize="8" fontWeight="700">Temp file deleted</text>
        </g>

        {/* Window B: Windows Print System */}
        <rect x="850" y="172" width="162" height="122" rx="6" fill="#000" opacity="0.18" />
        <rect className="pf-none ps-accent prw-glow prw-glow-spool" x="850" y="170" width="162" height="122" rx="6" strokeWidth="2.5" />
        <rect x="850" y="170" width="162" height="122" rx="6" fill="#FFFFFF" stroke="#D5DDE8" strokeWidth="0.8" />
        <path d="M850,186 V176 a6,6 0 0 1 6,-6 H1006 a6,6 0 0 1 6,6 V186 Z" fill="#F3F6FA" />
        <rect x="857" y="175" width="8" height="8" rx="1.5" fill="#2E7BEF" />
        <text x="869" y="181.5" fontSize="7.6" fontWeight="600" fill="#1B2A44">Windows Print System</text>
        <line x1="976" y1="178" x2="982" y2="178" stroke="#5A6B85" strokeWidth="1" />
        <rect x="987" y="175" width="6" height="6" fill="none" stroke="#5A6B85" strokeWidth="0.9" />
        <path d="M998,175 l6,6 M1004,175 l-6,6" stroke="#5A6B85" strokeWidth="1" />
        <text x="860" y="201" fontSize="7" fontWeight="600" fill="#1B2A44">Print queue</text>
        <circle cx="974" cy="198.6" r="2.2" fill="#28C840" />
        <text x="1004" y="201" fontSize="6.5" textAnchor="end" fill="#5A6B85">Spooler running</text>
        <rect x="860" y="208" width="142" height="24" rx="4" fill="#F1F5FA" />
        <rect className="pf-accent prw-shim" x="860" y="208" width="142" height="24" rx="4" opacity="0.22" />
        <rect x="866" y="212" width="9" height="14" rx="1.4" fill="#FFFFFF" stroke="#C7D0DF" strokeWidth="0.7" />
        <text x="880" y="218.5" fontSize="6.8" fontWeight="600" fill="#0F1B2D">invoice_0412.pdf</text>
        <text className="pf-accent" x="880" y="227" fontSize="6" fontWeight="600">Printing</text>
        <rect x="860" y="238" width="142" height="16" rx="4" fill="#F1F5FA" />
        <rect x="860" y="258" width="142" height="16" rx="4" fill="#F1F5FA" />
        <text x="860" y="285" fontSize="6.5" fill="#5A6B85">Driver: HP LaserJet Pro</text>

        {/* Taskbar */}
        <rect x="660" y="294" width="360" height="18" fill="#0C1220" opacity="0.9" />
        <g fill="#4BA3F5">
          <rect x="822" y="299" width="4" height="4" />
          <rect x="827" y="299" width="4" height="4" />
          <rect x="822" y="304" width="4" height="4" />
          <rect x="827" y="304" width="4" height="4" />
        </g>
        <rect x="836" y="298" width="22" height="10" rx="5" fill="#FFFFFF" opacity="0.15" />
        <circle cx="868" cy="303" r="4" fill="#8FA3BF" opacity="0.6" />
        <rect x="877" y="300" width="8" height="6" rx="1" fill="#FFC93C" />
        <rect className="pf-accent" x="891" y="298" width="10" height="10" rx="3" />
        <rect className="pf-accent" x="893" y="310" width="6" height="1.6" rx="0.8" />
        <text x="1010" y="305.5" fontSize="5.5" textAnchor="end" fill="#FFFFFF">10:42</text>

        <path d="M660,110 H830 L660,236 Z" fill="#FFFFFF" opacity="0.05" />
      </g>

      {/* Keyboard and mouse */}
      <rect x="738" y="394" width="188" height="16" rx="3" fill="#2A303C" stroke="#3A4252" strokeWidth="0.8" />
      <rect x="742" y="397" width="180" height="10" fill={u("keys")} />
      <ellipse cx="962" cy="402" rx="7" ry="9" fill="#2A303C" stroke="#3A4252" strokeWidth="0.8" />
      <line x1="962" y1="394" x2="962" y2="400" stroke="#3A4252" strokeWidth="0.8" />

      <text className="pf-text" x="840" y="446" textAnchor="middle" fontSize="15" fontWeight="700">Windows PC</text>
      <text className="pf-muted" x="840" y="463" textAnchor="middle" fontSize="11">Printora App + Windows Print System</text>

      {/* PC to printer link */}
      <polyline className="prw-flow pf-none ps-line" points="1030,246 1067,246 1067,296 1104,296" strokeWidth="2" strokeLinejoin="round" />

      {/* ================= PRINTER ================= */}
      <ellipse cx="1230" cy="384" rx="140" ry="5" fill="#000" opacity="0.16" />
      <rect x="1124" y="374" width="24" height="8" rx="2" fill="#11151C" />
      <rect x="1312" y="374" width="24" height="8" rx="2" fill="#11151C" />

      {/* rear paper tray with sheets */}
      <polygon className="pf-paper ps-edge" points="1150,242 1164,198 1296,198 1310,242" strokeWidth="1" />
      <rect className="pf-edge" x="1180" y="210" width="100" height="2" />
      <rect className="pf-edge" x="1180" y="218" width="100" height="2" />
      <rect className="pf-edge" x="1180" y="226" width="70" height="2" />
      {/* scanner lid */}
      <rect x="1112" y="238" width="236" height="30" rx="8" fill={u("lid")} stroke="#4A5364" strokeWidth="1" />
      <rect x="1124" y="244" width="212" height="14" rx="3" fill="#0B1220" opacity="0.55" />
      <rect x="1118" y="240" width="224" height="2" rx="1" fill="#FFFFFF" opacity="0.18" />
      {/* body */}
      <rect x="1104" y="264" width="252" height="110" rx="12" fill={u("body")} stroke="#3A4252" strokeWidth="1" />
      <rect x="1110" y="266" width="240" height="1.6" rx="0.8" fill="#FFFFFF" opacity="0.16" />
      {/* control panel */}
      <rect x="1122" y="276" width="84" height="40" rx="5" fill="#0B1018" stroke="#4A5364" strokeWidth="0.8" />
      <rect x="1128" y="281" width="72" height="22" rx="2" fill="#0B2238" />
      <text className="prw-ready" x="1164" y="296" fontSize="8.5" fontWeight="600" textAnchor="middle" fill="#7FE3C8">Ready</text>
      <text className="prw-printing" x="1164" y="296" fontSize="8.5" fontWeight="600" textAnchor="middle" fill="#FFD479">Printing…</text>
      <g fill="#2B3240" stroke="#4A5364" strokeWidth="0.8">
        <circle cx="1140" cy="309" r="3" />
        <circle cx="1158" cy="309" r="3" />
        <circle cx="1176" cy="309" r="3" />
        <circle cx="1194" cy="309" r="3.2" />
      </g>
      {/* status light and vents */}
      <circle cx="1336" cy="284" r="3.2" fill="#1B2A20" />
      <circle className="pf-accent prw-led" cx="1336" cy="284" r="3.2" />
      <g fill="#11151C">
        <rect x="1262" y="292" width="76" height="1.4" />
        <rect x="1262" y="298" width="76" height="1.4" />
        <rect x="1262" y="304" width="76" height="1.4" />
      </g>
      {/* output slot and tray */}
      <rect x="1130" y="326" width="200" height="14" rx="4" fill="#06090E" />
      <rect x="1134" y="338" width="192" height="1" fill="#FFFFFF" opacity="0.08" />
      <rect x="1150" y="346" width="160" height="12" rx="3" fill="#252C39" stroke="#3A4252" strokeWidth="0.8" />
      {/* printed page sliding out of the slot */}
      <g clipPath={u("paper-clip")}>
        <g className="prw-paper">
          <rect x="1180" y="214" width="100" height="112" rx="3" fill="#FFFFFF" stroke="#C7D0DF" strokeWidth="1" />
          <rect x="1190" y="244" width="40" height="5" fill="#1B2A44" />
          <rect x="1190" y="256" width="80" height="2.4" fill="#C7D0DF" />
          <rect x="1190" y="263" width="80" height="2.4" fill="#C7D0DF" />
          <rect x="1190" y="270" width="56" height="2.4" fill="#C7D0DF" />
          <rect x="1190" y="280" width="80" height="26" rx="2" fill={u("ink")} />
          <rect x="1190" y="312" width="36" height="2.4" fill="#C7D0DF" />
        </g>
      </g>

      <text className="pf-text" x="1230" y="446" textAnchor="middle" fontSize="15" fontWeight="700">Printer</text>
      <text className="pf-muted" x="1230" y="463" textAnchor="middle" fontSize="11">Any Windows printer</text>

      {/* ================= TRUST STRIP ================= */}
      <Pill x={384} y={560} label="No account needed" />
      <Pill x={600} y={560} label="TLS 1.2+ in transit" />
      <Pill x={816} y={560} label="0 cloud bytes stored" />

      {/* ================= TRAVELLING DOCUMENTS (on top) ================= */}
      <g className="prw-pkt prw-pkt-local"><PdfPacket variant="local" /></g>
      <g className="prw-pkt prw-pkt-remote"><PdfPacket variant="remote" /></g>
    </svg>
  );
}
