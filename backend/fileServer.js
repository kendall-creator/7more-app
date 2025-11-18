const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const WORKSPACE_DIR = '/home/user/workspace/';

// List files in workspace
router.get('/api/files/list', (req, res) => {
  try {
    const files = fs.readdirSync(WORKSPACE_DIR);

    const filesWithInfo = files.map(fileName => {
      const filePath = path.join(WORKSPACE_DIR, fileName);
      try {
        const stats = fs.statSync(filePath);
        return {
          name: fileName,
          path: filePath,
          size: stats.size,
          isDirectory: stats.isDirectory(),
          modifiedTime: Math.floor(stats.mtimeMs / 1000), // Convert to seconds
        };
      } catch (error) {
        return {
          name: fileName,
          path: filePath,
          size: 0,
          isDirectory: false,
          modifiedTime: 0,
        };
      }
    });

    // Sort: directories first, then by name
    filesWithInfo.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({ success: true, files: filesWithInfo });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ success: false, error: 'Failed to list files' });
  }
});

// Download a specific file
router.get('/api/files/download/:filename(*)', (req, res) => {
  try {
    const fileName = req.params.filename;
    // Support subdirectories by using the full path
    const filePath = path.join(WORKSPACE_DIR, fileName);

    // Security check: ensure file is within workspace
    if (!filePath.startsWith(WORKSPACE_DIR)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Check if it's a file (not directory)
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return res.status(400).json({ success: false, error: 'Cannot download directories' });
    }

    // Set appropriate headers
    const baseFileName = path.basename(fileName);
    res.setHeader('Content-Disposition', `attachment; filename="${baseFileName}"`);
    res.setHeader('Content-Type', getMimeType(baseFileName));
    res.setHeader('Content-Length', stats.size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ success: false, error: 'Failed to download file' });
  }
});

function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.zip': 'application/zip',
    '.pdf': 'application/pdf',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.ts': 'text/typescript',
    '.tsx': 'text/typescript',
    '.jsx': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

module.exports = router;
