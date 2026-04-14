import { put } from "@vercel/blob";

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const blob = await put(filename, buffer, {
    access: "public",
    contentType: mimeType,
  });
  return blob.url;
}
