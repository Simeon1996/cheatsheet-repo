const BLOB_API_URL = process.env.VERCEL_BLOB_API_URL ?? "https://vercel.com/api/blob";

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not set");

  const params = new URLSearchParams({ pathname: filename });
  const res = await fetch(`${BLOB_API_URL}/?${params}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "x-content-type": mimeType,
      "x-add-random-suffix": "0",
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Blob upload failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { url: string };
  // Return a proxy path so the DB never stores a Vercel-specific URL.
  // /api/images fetches it server-side with the store token.
  return `/api/images?url=${encodeURIComponent(data.url)}`;
}
