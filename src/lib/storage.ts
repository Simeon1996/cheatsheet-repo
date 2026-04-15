import { put } from "@vercel/blob";

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const blob = await put(filename, buffer, {
    access: "private",
    contentType: mimeType,
  });
  // Return a proxy path so the DB never stores a Vercel-specific URL.
  // The /api/images route resolves this to a fresh signed download URL.
  return `/api/images?url=${encodeURIComponent(blob.url)}`;
}
