import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Alert,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error,
  Delete,
  Visibility,
  Download
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { ipfsService, IPFSUploadResult } from '../services/ipfs';

interface IPFSUploaderProps {
  onUploadComplete?: (result: IPFSUploadResult) => void;
  onUploadError?: (error: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
  multiple?: boolean;
  label?: string;
  description?: string;
}

interface UploadedFile {
  file: File;
  result: IPFSUploadResult;
  progress: number;
}

const IPFSUploader: React.FC<IPFSUploaderProps> = ({
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  label = 'Upload Document',
  description = 'Drag and drop files here, or click to select'
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejectionReasons = rejectedFiles.map(rejection => 
        `${rejection.file.name}: ${rejection.errors.map((e: any) => e.message).join(', ')}`
      );
      setError(`Some files were rejected: ${rejectionReasons.join('; ')}`);
      onUploadError?.(rejectionReasons.join('; '));
      return;
    }

    // Limit to single file if multiple is false
    const filesToUpload = multiple ? acceptedFiles : [acceptedFiles[0]];

    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Create initial upload entry
        const initialResult: IPFSUploadResult = {
          success: false,
          error: 'Uploading...'
        };

        const uploadedFile: UploadedFile = {
          file,
          result: initialResult,
          progress: 0
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);

        // Upload to IPFS
        const result = await ipfsService.uploadFile(file);

        // Update the uploaded file with result
        setUploadedFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { ...uf, result, progress: 100 }
              : uf
          )
        );

        if (result.success) {
          onUploadComplete?.(result);
        } else {
          onUploadError?.(result.error || 'Upload failed');
        }

        return result;
      });

      await Promise.all(uploadPromises);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [multiple, onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple
  });

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(uf => uf.file !== fileToRemove));
  };

  const downloadFile = async (hash: string, filename: string) => {
    try {
      const fileData = await ipfsService.getFile(hash);
      if (fileData) {
        const blob = new Blob([fileData]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      case 'doc':
      case 'docx':
        return '📝';
      default:
        return '📁';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <Box textAlign="center">
          <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            {isDragActive ? 'Drop files here' : description}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Supported formats: {acceptedFileTypes.join(', ')}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Max file size: {formatFileSize(maxFileSize)}
          </Typography>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Uploading to IPFS...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Files:
          </Typography>
          {uploadedFiles.map((uploadedFile, index) => (
            <Paper key={index} sx={{ p: 2, mb: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" flex={1}>
                  <Typography sx={{ mr: 1 }}>
                    {getFileIcon(uploadedFile.file.name)}
                  </Typography>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight="medium">
                      {uploadedFile.file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(uploadedFile.file.size)}
                    </Typography>
                  </Box>
                  {uploadedFile.result.success ? (
                    <Chip
                      icon={<CheckCircle />}
                      label="Uploaded"
                      color="success"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  ) : (
                    <Chip
                      icon={<Error />}
                      label="Failed"
                      color="error"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  )}
                </Box>
                
                <Box display="flex" alignItems="center">
                  {uploadedFile.result.success && uploadedFile.result.hash && (
                    <>
                      <Tooltip title="View on IPFS">
                        <IconButton
                          size="small"
                          onClick={() => window.open(ipfsService.getFileURL(uploadedFile.result.hash!), '_blank')}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => downloadFile(uploadedFile.result.hash!, uploadedFile.file.name)}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      onClick={() => removeFile(uploadedFile.file)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {uploadedFile.result.success && uploadedFile.result.hash && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    IPFS Hash: {uploadedFile.result.hash}
                  </Typography>
                </Box>
              )}
              
              {uploadedFile.result.error && !uploadedFile.result.success && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {uploadedFile.result.error}
                </Alert>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default IPFSUploader;
