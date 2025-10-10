import React, { useState } from 'react';
import { 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Download, 
  Copy, 
  Search,
  List,
  Grid,
  Info,
  Clock,
  User,
  Calendar,
  Hash,
  FileType,
  Layers,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { useDocumentStore, DocumentFile, ValidationResult } from '../lib/stores/document-store';

const ContentPreview: React.FC = () => {
  const {
    files,
    selectedFileForPreview,
    setSelectedFileForPreview,
    setCurrentView
  } = useDocumentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('content');

  const currentFile = files.find(f => f.id === selectedFileForPreview);

  if (!currentFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <FileText className="w-16 h-16 text-muted-foreground" />
        <div className="text-center">
          <h3>No file selected for preview</h3>
          <p className="text-muted-foreground">Select a file from the queue to view its content and metadata.</p>
        </div>
        <Button onClick={() => setCurrentView('queue')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Queue
        </Button>
      </div>
    );
  }

  const getValidationIcon = (result: ValidationResult) => {
    switch (result.status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getValidationBadge = (result: ValidationResult) => {
    const variants = {
      passed: 'default',
      warning: 'outline',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[result.status]} className="capitalize">
        {result.status}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const highlightSearchQuery = (text: string) => {
    if (!searchQuery || !text) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentView('queue')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Queue
          </Button>
          
          <div>
            <h1 className="truncate">{currentFile.name}</h1>
            <p className="text-muted-foreground text-sm">
              {formatFileSize(currentFile.size)} • {currentFile.format.toUpperCase()} • 
              Uploaded {formatDate(currentFile.uploadedAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={currentFile.status === 'completed' ? 'default' : 'secondary'}>
            {currentFile.status}
          </Badge>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {currentFile.status === 'error' && currentFile.errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Processing failed: {currentFile.errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {currentFile.status === 'processing' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            This file is currently being processed. Some content may not be available yet.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-6">
        {/* Content Panel */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Extracted Content
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-48"
                        prefix={<Search className="w-4 h-4" />}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(currentFile.extractedContent?.text || '')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4 text-sm leading-relaxed">
                      {currentFile.extractedContent ? (
                        <div className="whitespace-pre-wrap font-mono">
                          {highlightSearchQuery(currentFile.extractedContent.text)}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <FileText className="w-8 h-8 mx-auto mb-2" />
                          <p>Content not yet extracted</p>
                          <p className="text-xs">Processing may still be in progress</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="structure" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Document Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {currentFile.extractedContent?.structure ? (
                      <div className="space-y-2">
                        {currentFile.extractedContent.structure.map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                                {item.level && ` ${item.level}`}
                              </Badge>
                              <span className="text-sm truncate">{item.text}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {item.position}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <List className="w-8 h-8 mx-auto mb-2" />
                        <p>Structure analysis not available</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Validation Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentFile.validationResults?.map((result, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {getValidationIcon(result)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium capitalize">{result.type} Check</span>
                            {getValidationBadge(result)}
                          </div>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                          {result.details && (
                            <p className="text-xs text-muted-foreground mt-1">{result.details}</p>
                          )}
                        </div>
                      </div>
                    )) || (
                      <div className="text-center text-muted-foreground py-8">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>No validation results available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Document Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentFile.metadata && (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Author</p>
                              <p className="text-sm text-muted-foreground">
                                {currentFile.metadata.author || 'Unknown'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Created</p>
                              <p className="text-sm text-muted-foreground">
                                {currentFile.metadata.createdAt 
                                  ? formatDate(currentFile.metadata.createdAt)
                                  : 'Unknown'
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <FileType className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Application</p>
                              <p className="text-sm text-muted-foreground">
                                {currentFile.metadata.application || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Checksum</p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {currentFile.metadata.checksum}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-2">Keywords</p>
                            <div className="flex flex-wrap gap-1">
                              {currentFile.metadata.keywords?.map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              )) || <span className="text-sm text-muted-foreground">None</span>}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium">Subject</p>
                            <p className="text-sm text-muted-foreground">
                              {currentFile.metadata.subject || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Stats Sidebar */}
        <div className="w-80">
          <Card>
            <CardHeader>
              <CardTitle>Content Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentFile.extractedContent ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Word Count</p>
                        <p className="text-xl font-medium">
                          {currentFile.extractedContent.wordCount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Characters</p>
                        <p className="text-xl font-medium">
                          {currentFile.extractedContent.characterCount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Pages</p>
                        <p className="text-xl font-medium">{currentFile.extractedContent.pages}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Language</p>
                        <p className="text-xl font-medium">{currentFile.extractedContent.language.toUpperCase()}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Contains Images</span>
                        <Badge variant={currentFile.extractedContent.hasImages ? 'default' : 'outline'}>
                          {currentFile.extractedContent.hasImages ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Contains Tables</span>
                        <Badge variant={currentFile.extractedContent.hasTables ? 'default' : 'outline'}>
                          {currentFile.extractedContent.hasTables ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Encoding</span>
                        <Badge variant="outline">
                          {currentFile.extractedContent.encoding}
                        </Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Grid className="w-8 h-8 mx-auto mb-2" />
                    <p>Statistics not available</p>
                    <p className="text-xs">Content not yet processed</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentPreview;