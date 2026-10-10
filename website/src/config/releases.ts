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
  releaseDate: "2026-10-10",
  releaseNotesUrl: `${GITHUB_REPO}/releases/latest`,
  windows: {
    installer: {
      fileName: "PrintoraServer-Setup.exe",
      url: `${GITHUB_REPO}/releases/latest/download/PrintoraServer-Setup.exe`,
    },
    portableZip: {
      fileName: "PrintoraServer-Windows-v2.2.2.zip",
      url: `${GITHUB_REPO}/releases/latest/download/PrintoraServer-Windows.zip`,
    },
  },
  android: {
    apk: {
      fileName: "Printora-Android-v2.2.2.apk",
      url: `${GITHUB_REPO}/releases/latest/download/Printora-Android.apk`,
    },
  },
  checksumsUrl: `${GITHUB_REPO}/releases/latest/download/SHA256SUMS.txt`,
};
