import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useDocumentStore } from '../lib/stores/document-store';

const UploadInterface: React.FC = () => {
  const { 
    files, 
    isDragOver, 
    isUploading, 
    processingStats,
    addFiles, 
    setIsDragOver, 
    setIsUploading,
    setCurrentView
  } = useDocumentStore();

  const [fileInputKey, setFileInputKey] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  }, [isDragOver, setIsDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, [setIsDragOver]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  }, [setIsDragOver]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      handleFileUpload(selectedFiles);
    }
    // Reset file input to allow selecting the same files again
    setFileInputKey(prev => prev + 1);
  }, []);

  const handleFileUpload = useCallback((filesToUpload: File[]) => {
    if (filesToUpload.length + files.length > 100) {
      alert(`Cannot upload more than 100 files total. Currently have ${files.length} files.`);
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      addFiles(filesToUpload);
      setIsUploading(false);
      
      // Auto-navigate to queue view after upload
      if (filesToUpload.length > 0) {
        setTimeout(() => setCurrentView('queue'), 500);
      }
    }, 1000);
  }, [files.length, addFiles, setIsUploading, setCurrentView]);

  const getSupportedFormats = () => [
    'PDF (.pdf)',
    'Microsoft Word (.docx)',
    'Text Files (.txt)',
    'Markdown (.md)',
    'Rich Text (.rtf)'
  ];

  const getStatusSummary = () => {
    if (files.length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-medium text-primary">{processingStats.totalFiles}</div>
            <div className="text-sm text-muted-foreground">Total Files</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-medium text-blue-600">{processingStats.queuedFiles}</div>
            <div className="text-sm text-muted-foreground">Queued</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-medium text-yellow-600">{processingStats.processingFiles}</div>
            <div className="text-sm text-muted-foreground">Processing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-medium text-green-600">{processingStats.completedFiles}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-medium text-red-600">{processingStats.errorFiles}</div>
            <div className="text-sm text-muted-foreground">Errors</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1>Document Upload</h1>
        <p className="text-muted-foreground">
          Upload up to 100 documents for processing. Supported formats include PDF, Word, text, and markdown files.
        </p>
      </div>

      {getStatusSummary()}

      <div className="flex-1 flex flex-col">
        {/* Main Upload Zone */}
        <Card 
          className={`flex-1 border-2 border-dashed transition-all duration-200 ${
            isDragOver 
              ? 'border-primary bg-primary/5 shadow-lg' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/40'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isDragOver ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Upload className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-medium">
                  {isDragOver ? 'Drop files here' : 'Upload Documents'}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {isDragOver 
                    ? `Drop ${files.length > 0 ? `up to ${100 - files.length} more` : 'up to 100'} files to begin processing`
                    : 'Drag and drop files here, or click to select files'
                  }
                </p>
              </div>

              <div className="space-y-3">
                <input
                  key={fileInputKey}
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  accept=".pdf,.docx,.doc,.txt,.md,.rtf"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload">
                  <Button 
                    asChild
                    size="lg" 
                    disabled={isUploading || files.length >= 100}
                    className="cursor-pointer"
                  >
                    <span>
                      {isUploading ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Select Files
                        </>
                      )}
                    </span>
                  </Button>
                </label>

                {files.length >= 100 && (
                  <div className="flex items-center justify-center text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Maximum file limit reached (100 files)
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {isUploading && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uploading files...</span>
                  <span className="text-sm text-muted-foreground">Please wait</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supported Formats */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4>Supported File Formats</h4>
              <div className="flex flex-wrap gap-2">
                {getSupportedFormats().map((format, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {format}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Maximum file size: 100MB per file</p>
                <p>• Maximum total files: 100 files per batch</p>
                <p>• Files are automatically validated and processed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {files.length > 0 && (
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('queue')}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              View Queue ({files.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadInterface;