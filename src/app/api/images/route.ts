import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const blobUrl = req.nextUrl.searchParams.get("url");

  if (!blobUrl || !blobUrl.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const blobRes = await fetch(blobUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!blobRes.ok) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const contentType = blobRes.headers.get("content-type") ?? "application/octet-stream";
  const buffer = await blobRes.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
