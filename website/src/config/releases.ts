export interface ReleaseAsset {
  fileName: string;
  url: string;
  sha256?: string;
  sizeBytes?: number;
}

export interface ReleaseInfo {
  version: string;
  releaseDate: string;
  releaseNotesUrl: string;
  windows: {
    installer: ReleaseAsset;
    portableZip: ReleaseAsset;
  };
  android: {
    apk: ReleaseAsset;
  };
  checksumsUrl: string;
}

const GITHUB_REPO = "https://github.com/sagarsahni6/printora-cloud-print";

export const releasesConfig: ReleaseInfo = {
  version: "2.2.3",
  releaseDate: "2026-10-17",
  releaseNotesUrl: `${GITHUB_REPO}/releases/latest`,
  windows: {
    installer: {
      fileName: "PrintoraServer-Setup.exe",
      url: `${GITHUB_REPO}/releases/latest/download/PrintoraServer-Setup.exe`,
      sha256: "a517630d3988f05c7105b707af7bf3e1e58c2a5dd7c25767696c38d5ddb00d29",
      sizeBytes: 96925722,
    },
    portableZip: {
      fileName: "PrintoraServer-Windows-v2.2.3.zip",
      url: `${GITHUB_REPO}/releases/latest/download/PrintoraServer-Windows.zip`,
      sha256: "1ca02910f41ecfc993bff0016ff8d73b4ca9562968bae251b7b57236c4bf4dff",
      sizeBytes: 101919166,
    },
  },
  android: {
    apk: {
      fileName: "Printora-Android-v2.2.3.apk",
      url: `${GITHUB_REPO}/releases/latest/download/Printora-Android.apk`,
      sha256: "f46a79520566a24073dbc471c442d1f3a39a30abc2ce7b32cfe6ddcc6652b58f",
      sizeBytes: 2602512,
    },
  },
  checksumsUrl: `${GITHUB_REPO}/releases/latest/download/SHA256SUMS.txt`,
};
