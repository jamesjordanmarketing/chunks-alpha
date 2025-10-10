import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Eye,
  Search,
  Filter,
  MoreVertical,
  Download,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { useDocumentStore, DocumentFile } from '../lib/stores/document-store';

const QueueManagement: React.FC = () => {
  const {
    files,
    selectedFileIds,
    processingStats,
    selectFile,
    selectMultipleFiles,
    clearSelection,
    updateFilePriority,
    pauseFile,
    resumeFile,
    retryFile,
    removeFile,
    removeFiles,
    pauseAllFiles,
    resumeAllFiles,
    clearCompletedFiles,
    clearErrorFiles,
    setCurrentView,
    setSelectedFileForPreview
  } = useDocumentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getStatusIcon = (status: DocumentFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'processing':
      case 'validating':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'queued':
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: DocumentFile['status']) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      validating: 'secondary',
      error: 'destructive',
      paused: 'outline',
      queued: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status === 'validating' ? 'Validating' : status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: DocumentFile['priority']) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return (
      <Badge variant="outline" className={`capitalize ${colors[priority]}`}>
        {priority}
      </Badge>
    );
  };

  const filteredAndSortedFiles = files
    .filter(file => {
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && file.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== 'all' && file.priority !== priorityFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'uploadedAt':
        default:
          aValue = a.uploadedAt.getTime();
          bValue = b.uploadedAt.getTime();
          break;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectMultipleFiles(filteredAndSortedFiles.map(f => f.id));
    } else {
      clearSelection();
    }
  };

  const handleRowSelect = (fileId: string, checked: boolean) => {
    if (checked) {
      selectMultipleFiles([...selectedFileIds, fileId]);
    } else {
      selectMultipleFiles(selectedFileIds.filter(id => id !== fileId));
    }
  };

  const handleBatchPriority = (priority: DocumentFile['priority']) => {
    selectedFileIds.forEach(fileId => {
      updateFilePriority(fileId, priority);
    });
    clearSelection();
  };

  const handleBatchPause = () => {
    selectedFileIds.forEach(fileId => {
      const file = files.find(f => f.id === fileId);
      if (file && (file.status === 'processing' || file.status === 'queued')) {
        pauseFile(fileId);
      }
    });
    clearSelection();
  };

  const handleBatchResume = () => {
    selectedFileIds.forEach(fileId => {
      const file = files.find(f => f.id === fileId);
      if (file && file.status === 'paused') {
        resumeFile(fileId);
      }
    });
    clearSelection();
  };

  const handleBatchRetry = () => {
    selectedFileIds.forEach(fileId => {
      const file = files.find(f => f.id === fileId);
      if (file && file.status === 'error') {
        retryFile(fileId);
      }
    });
    clearSelection();
  };

  const handleBatchDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedFileIds.length} selected files?`)) {
      removeFiles(selectedFileIds);
      clearSelection();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDuration = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h1>Processing Queue</h1>
        <p className="text-muted-foreground">
          Monitor and manage document processing with batch operations and priority controls.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Progress</p>
                <p className="text-2xl font-medium">{Math.round(processingStats.totalProgress)}%</p>
              </div>
              <Progress value={processingStats.totalProgress} className="w-12 h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Throughput</p>
              <p className="text-2xl font-medium">{processingStats.throughputPerMinute}/min</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-2xl font-medium text-blue-600">{processingStats.processingFiles}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">ETA</p>
              <p className="text-2xl font-medium">
                {processingStats.estimatedTimeRemaining ? `${processingStats.estimatedTimeRemaining}m` : '--'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              prefix={<Search className="w-4 h-4" />}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Batch Operations */}
      {selectedFileIds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedFileIds.length} files selected
              </span>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Set Priority
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBatchPriority('high')}>
                      <ArrowUp className="w-4 h-4 mr-2 text-red-600" />
                      High Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBatchPriority('medium')}>
                      <ArrowDown className="w-4 h-4 mr-2 text-yellow-600" />
                      Medium Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBatchPriority('low')}>
                      <ArrowDown className="w-4 h-4 mr-2 text-gray-600" />
                      Low Priority
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="outline" size="sm" onClick={handleBatchPause}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleBatchResume}>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleBatchRetry}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                
                <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Table */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Files ({filteredAndSortedFiles.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedFileIds.length === filteredAndSortedFiles.length && filteredAndSortedFiles.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedFiles.map((file) => (
                  <TableRow key={file.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedFileIds.includes(file.id)}
                        onCheckedChange={(checked) => handleRowSelect(file.id, checked as boolean)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="font-medium truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {file.format}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status)}
                        {getStatusBadge(file.status)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getPriorityBadge(file.priority)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{Math.round(file.progress)}%</span>
                        </div>
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </TableCell>
                    
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDuration(file.uploadedAt)}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedFileForPreview(file.id);
                              setCurrentView('preview');
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          
                          {file.status === 'paused' && (
                            <DropdownMenuItem onClick={() => resumeFile(file.id)}>
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </DropdownMenuItem>
                          )}
                          
                          {(file.status === 'processing' || file.status === 'queued') && (
                            <DropdownMenuItem onClick={() => pauseFile(file.id)}>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </DropdownMenuItem>
                          )}
                          
                          {file.status === 'error' && (
                            <DropdownMenuItem onClick={() => retryFile(file.id)}>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Retry
                            </DropdownMenuItem>
                          )}
                          
                          <Separator />
                          
                          <DropdownMenuItem 
                            onClick={() => removeFile(file.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredAndSortedFiles.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2" />
                <p>No files found matching your filters.</p>
                <Button 
                  variant="link" 
                  onClick={() => setCurrentView('upload')}
                  className="mt-2"
                >
                  Upload some files to get started
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueManagement;