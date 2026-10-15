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
  version: "2.2.2",
  releaseDate: "2026-10-15",
  releaseNotesUrl: `${GITHUB_REPO}/releases/latest`,
  windows: {
    installer: {
      fileName: "PrintoraServer-Setup.exe",
      url: `${GITHUB_REPO}/releases/latest/download/PrintoraServer-Setup.exe`,
      sha256: "f3b669e603be74400115b7957fa00635264f87486e99716fee4eda771b1b4d34",
      sizeBytes: 96924519,
    },
    portableZip: {
      fileName: "PrintoraServer-Windows-v2.2.2.zip",
      url: `${GITHUB_REPO}/releases/latest/download/PrintoraServer-Windows.zip`,
      sha256: "c6c524d6a34ff07d71330f5fb1577ff6a01c50f0203252cfdb83b0b8fe54e58a",
      sizeBytes: 101921023,
    },
  },
  android: {
    apk: {
      fileName: "Printora-Android-v2.2.2.apk",
      url: `${GITHUB_REPO}/releases/latest/download/Printora-Android.apk`,
      sha256: "f46a79520566a24073dbc471c442d1f3a39a30abc2ce7b32cfe6ddcc6652b58f",
      sizeBytes: 2602512,
    },
  },
  checksumsUrl: `${GITHUB_REPO}/releases/latest/download/SHA256SUMS.txt`,
};
