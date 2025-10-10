'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '../../../components/upload/upload-dropzone';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { ArrowLeft, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { UploadDocumentResponse } from '../../../lib/types/upload';

interface UploadedDocument {
  id: string;
  title: string;
  status: string;
  file_path: string;
  created_at: string;
  file_name: string;
  file_size: number;
}

/**
 * Upload Page Component
 * 
 * Main page for uploading documents
 * Features:
 * - File selection via dropzone
 * - Sequential file upload to API
 * - Progress tracking
 * - Success/error feedback
 * - Recently uploaded documents list
 */
export default function UploadPage() {
  const router = useRouter();
  
  // State management
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    completed: 0,
    failed: 0
  });

  /**
   * Handle files added from dropzone
   */
  const handleFilesAdded = async (files: File[]) => {
    await uploadFiles(files);
  };

  /**
   * Upload files to API sequentially
   */
  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStats({
      total: files.length,
      completed: 0,
      failed: 0
    });

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required', {
          description: 'Please sign in to upload documents'
        });
        router.push('/signin');
        return;
      }

      const token = session.access_token;
      const uploaded: UploadedDocument[] = [];
      let completedCount = 0;
      let failedCount = 0;

      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        const progressPercent = Math.round(((i / files.length) * 100));
        setUploadProgress(progressPercent);

        try {
          // Create form data
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', file.name.replace(/\.[^/.]+$/, '')); // Remove extension

          // Call upload API
          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          const data: UploadDocumentResponse = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Upload failed');
          }

          // Add to uploaded list
          if (data.document) {
            uploaded.push({
              ...data.document,
              file_name: file.name,
              file_size: file.size
            });
            completedCount++;
            
            toast.success(`Uploaded: ${file.name}`, {
              description: 'Text extraction started automatically'
            });
          }

        } catch (error) {
          failedCount++;
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`, {
            description: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        // Update stats
        setUploadStats({
          total: files.length,
          completed: completedCount,
          failed: failedCount
        });
      }

      // Final progress
      setUploadProgress(100);

      // Update uploaded documents list
      setUploadedDocuments(prev => [...uploaded, ...prev]);

      // Show summary
      if (completedCount > 0) {
        toast.success('Upload complete', {
          description: `Successfully uploaded ${completedCount} of ${files.length} file(s)`
        });
      }

      if (failedCount === files.length) {
        toast.error('All uploads failed', {
          description: 'Please check your files and try again'
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsUploading(false);
      // Keep progress at 100% for a moment before resetting
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  };

  /**
   * Clear uploaded documents list
   */
  const handleClearList = () => {
    setUploadedDocuments([]);
    setUploadStats({ total: 0, completed: 0, failed: 0 });
  };

  /**
   * Navigate to document in workflow
   */
  const handleViewDocument = (documentId: string) => {
    router.push(`/workflow/${documentId}/stage1`);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Document Upload</h1>
        <p className="text-muted-foreground">
          Upload up to 100 documents for processing. Supported formats include PDF, Word, text, markdown, and HTML files.
        </p>
      </div>

      {/* Upload Statistics */}
      {(uploadStats.total > 0 || uploadedDocuments.length > 0) && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Upload Session Progress</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadStats.completed} uploaded • {uploadStats.failed} failed • {uploadedDocuments.length} total
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{uploadStats.completed}</div>
                    <div className="text-xs text-muted-foreground">Uploaded</div>
                  </div>
                  {uploadStats.failed > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{uploadStats.failed}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{uploadedDocuments.length}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Dropzone */}
      <UploadDropzone
        onFilesAdded={handleFilesAdded}
        currentFileCount={uploadedDocuments.length}
        maxFiles={100}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />

      {/* Recently Uploaded Documents */}
      {uploadedDocuments.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recently Uploaded Documents</h3>
            <Button variant="outline" size="sm" onClick={handleClearList}>
              Clear List
            </Button>
          </div>
          
          <div className="space-y-2">
            {uploadedDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.file_name} • {(doc.file_size / 1024).toFixed(0)} KB • Uploaded • Processing
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewDocument(doc.id)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex gap-3">
            <Button onClick={() => router.push('/dashboard')}>
              View All Documents
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Upload More Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

