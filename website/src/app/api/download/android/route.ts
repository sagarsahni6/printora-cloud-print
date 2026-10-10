import { NextResponse } from "next/server";
import { releasesConfig } from "@/config/releases";

export async function GET() {
  return NextResponse.redirect(releasesConfig.android.apk.url, {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
