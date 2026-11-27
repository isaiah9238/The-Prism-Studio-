/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

export class DriveAuthError extends Error {
  constructor(message = "Google Drive session expired. Please sign in again.") {
    super(message);
    this.name = "DriveAuthError";
  }
}

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3";

async function assertDriveResponse(res: Response): Promise<void> {
  if (res.status === 401) {
    throw new DriveAuthError();
  }
  if (!res.ok) {
    let details = `Google Drive API error (${res.status})`;
    try {
      const errBody = await res.json();
      if (errBody?.error?.message) {
        details = errBody.error.message;
      }
    } catch {
      // ignore non-json error response
    }
    throw new Error(details);
  }
}

export async function listDriveFiles(
  accessToken: string,
  options?: { searchQuery?: string; onlyPrism?: boolean; pageSize?: number }
): Promise<DriveFileItem[]> {
  const filters: string[] = ["trashed = false"];

  if (options?.onlyPrism) {
    filters.push("(name contains '.prism.json' or name contains '_prism.md')");
  }

  if (options?.searchQuery && options.searchQuery.trim()) {
    const escaped = options.searchQuery.trim().replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    filters.push(`name contains '${escaped}'`);
  }

  const params = new URLSearchParams({
    q: filters.join(" and "),
    orderBy: "modifiedTime desc",
    pageSize: String(options?.pageSize ?? 30),
    fields: "files(id,name,mimeType,modifiedTime,size,webViewLink)",
  });

  const res = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await assertDriveResponse(res);
  const data = await res.json();
  return Array.isArray(data.files) ? (data.files as DriveFileItem[]) : [];
}

export async function findDriveFileByName(
  accessToken: string,
  fileName: string
): Promise<DriveFileItem | null> {
  const escaped = fileName.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const params = new URLSearchParams({
    q: `name = '${escaped}' and trashed = false`,
    pageSize: "1",
    fields: "files(id,name,mimeType,modifiedTime,size,webViewLink)",
  });

  const res = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await assertDriveResponse(res);
  const data = await res.json();
  return Array.isArray(data.files) && data.files.length > 0
    ? (data.files[0] as DriveFileItem)
    : null;
}

export async function readDriveFileContent(
  accessToken: string,
  file: DriveFileItem
): Promise<string> {
  let url: string;
  if (file.mimeType === "application/vnd.google-apps.document") {
    url = `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}/export?mimeType=text/plain`;
  } else if (file.mimeType === "application/vnd.google-apps.spreadsheet") {
    url = `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}/export?mimeType=text/csv`;
  } else if (file.mimeType === "application/vnd.google-apps.presentation") {
    url = `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}/export?mimeType=text/plain`;
  } else {
    url = `${DRIVE_API_BASE}/files/${encodeURIComponent(file.id)}?alt=media`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await assertDriveResponse(res);
  return await res.text();
}

export async function createDriveFile(
  accessToken: string,
  params: { name: string; content: string; mimeType: string }
): Promise<DriveFileItem> {
  const boundary = "prism_studio_boundary_" + Date.now();
  const metadata = JSON.stringify({
    name: params.name,
    mimeType: params.mimeType,
  });

  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    metadata,
    `--${boundary}`,
    `Content-Type: ${params.mimeType}; charset=UTF-8`,
    "",
    params.content,
    `--${boundary}--`,
  ].join("\r\n");

  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  await assertDriveResponse(res);
  return (await res.json()) as DriveFileItem;
}

export async function updateDriveFile(
  accessToken: string,
  fileId: string,
  params: { name?: string; content: string; mimeType: string }
): Promise<DriveFileItem> {
  const boundary = "prism_studio_update_" + Date.now();
  const metadataObj: Record<string, string> = { mimeType: params.mimeType };
  if (params.name) metadataObj.name = params.name;

  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(metadataObj),
    `--${boundary}`,
    `Content-Type: ${params.mimeType}; charset=UTF-8`,
    "",
    params.content,
    `--${boundary}--`,
  ].join("\r\n");

  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files/${encodeURIComponent(fileId)}?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  await assertDriveResponse(res);
  return (await res.json()) as DriveFileItem;
}

export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(
    `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  await assertDriveResponse(res);
}
