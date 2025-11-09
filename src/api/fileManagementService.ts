// File Management API Service
// This module provides file management functionality for admin users

const API_BASE_URL = "http://172.17.0.2:3001";

export interface FileItem {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  modifiedTime: number;
}

export interface FileListResponse {
  success: boolean;
  files?: FileItem[];
  error?: string;
}

/**
 * Fetch list of files from the backend server
 */
export async function listFiles(): Promise<FileListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching file list:", error);
    return {
      success: false,
      error: "Failed to connect to file server. Make sure the backend is running.",
    };
  }
}

/**
 * Get download URL for a specific file
 */
export function getFileDownloadUrl(fileName: string): string {
  return `${API_BASE_URL}/api/files/download/${encodeURIComponent(fileName)}`;
}

/**
 * Check if backend server is reachable
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data.status === "healthy";
  } catch (error) {
    console.error("Server health check failed:", error);
    return false;
  }
}
