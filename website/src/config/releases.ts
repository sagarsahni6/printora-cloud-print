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
      sha256: "65cad21265be105a06a267eb08d83ec5bf71769e894820ba6300fd88df7cc2dc",
      sizeBytes: 177314,
    },
    portableZip: {
      fileName: "PrintoraServer-Windows-v2.2.3.zip",
      url: `${GITHUB_REPO}/releases/latest/download/PrintoraServer-Windows.zip`,
      sha256: "12f1203d097b9f68b80bdd14c921b506debb58e6637c30d7973c30759a6ce0af",
      sizeBytes: 86893177,
    },
  },
  android: {
    apk: {
      fileName: "Printora-Android-v2.2.3.apk",
      url: `${GITHUB_REPO}/releases/latest/download/Printora-Android.apk`,
      sha256: "d0c76805078b6552b4bc83c4cc131ba9fa85d268d34fa1be4cc8fc0d7f4570cb",
      sizeBytes: 2602512,
    },
  },
  checksumsUrl: `${GITHUB_REPO}/releases/latest/download/SHA256SUMS.txt`,
};
