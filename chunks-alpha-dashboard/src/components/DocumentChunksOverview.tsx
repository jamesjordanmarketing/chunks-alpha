import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useDocumentStore } from '../store/document-store';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Eye,
  Brain,
  AlertCircle,
  Hash,
  Type,
  BookOpen,
  ExternalLink
} from 'lucide-react';

export function DocumentChunksOverview() {
  const { currentDocument, markChunkAnalyzed } = useDocumentStore();

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No document selected</p>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'header': return <Hash className="h-4 w-4" />;
      case 'content': return <FileText className="h-4 w-4" />;
      case 'instruction': return <BookOpen className="h-4 w-4" />;
      case 'criteria': return <CheckCircle className="h-4 w-4" />;
      case 'example': return <Eye className="h-4 w-4" />;
      case 'footer': return <Type className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'header': return 'border-blue-200 bg-blue-50';
      case 'content': return 'border-green-200 bg-green-50';
      case 'instruction': return 'border-purple-200 bg-purple-50';
      case 'criteria': return 'border-orange-200 bg-orange-50';
      case 'example': return 'border-yellow-200 bg-yellow-50';
      case 'footer': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const analyzedChunks = currentDocument.chunks.filter(chunk => chunk.isAnalyzed).length;
  const totalChunks = currentDocument.chunks.length;
  const analysisProgress = Math.round((analyzedChunks / totalChunks) * 100);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Filename Display */}
      <div className="text-center">
        <h1 className="font-bold">{currentDocument.filename}</h1>
      </div>
      
      {/* Document Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                {currentDocument.title}
                <Badge variant="outline">{currentDocument.documentType}</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">{currentDocument.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>{currentDocument.totalPages} pages</span>
                <span>{currentDocument.totalWords.toLocaleString()} words</span>
                <span>Uploaded: {currentDocument.uploadDate}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`mb-2 ${
                currentDocument.analysisStatus === 'completed' ? 'bg-green-500' :
                currentDocument.analysisStatus === 'processing' ? 'bg-blue-500' :
                currentDocument.analysisStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
              }`}>
                {currentDocument.analysisStatus.toUpperCase()}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Analysis Progress: {analysisProgress}%
              </div>
              <Progress value={analysisProgress} className="w-32 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Document Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            {currentDocument.title} - Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Main Purpose</h4>
              <p className="text-sm text-muted-foreground mb-4">{currentDocument.overallInsights.mainPurpose}</p>
              
              <h4 className="font-medium mb-2">Target Audience</h4>
              <p className="text-sm text-muted-foreground">{currentDocument.overallInsights.targetAudience}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Key Topics</h4>
              <div className="flex flex-wrap gap-1 mb-4">
                {currentDocument.overallInsights.keyTopics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
              
              <h4 className="font-medium mb-2">Action Items</h4>
              <ul className="space-y-1">
                {currentDocument.overallInsights.actionItems.map((item, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Generated Chunks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Auto-Generated Chunks</h2>
          <Badge variant="secondary">
            {analyzedChunks} / {totalChunks} Analyzed
          </Badge>
        </div>

        {currentDocument.chunks.map((chunk) => (
          <Card key={chunk.id} className={`transition-all ${getCategoryColor(chunk.category)} ${chunk.isAnalyzed ? 'ring-1 ring-green-200' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-lg bg-white/50 ${chunk.isAnalyzed ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {chunk.isAnalyzed ? <CheckCircle className="h-5 w-5" /> : getCategoryIcon(chunk.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{chunk.title}</h3>
                      <Badge variant="outline" className="text-xs capitalize">
                        {chunk.category}
                      </Badge>
                      <Badge className={`text-xs ${getComplexityColor(chunk.metadata.complexity)}`}>
                        {chunk.metadata.complexity} complexity
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  <div>Chunk {chunk.chunkNumber}</div>
                  {chunk.isAnalyzed ? (
                    <Badge variant="default" className="bg-green-500 text-xs mt-1">Analyzed</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs mt-1">Pending</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Top Section: Chunk Metadata */}
              <div className="mb-4 p-3 bg-white/30 rounded border">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  Chunk Metadata
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Lines:</span>
                    <div className="font-medium">{chunk.startLine}-{chunk.endLine}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Words:</span>
                    <div className="font-medium">{chunk.metadata.wordCount}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Page:</span>
                    <div className="font-medium">{chunk.pageNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Read Time:</span>
                    <div className="font-medium">{chunk.metadata.estimatedReadingTime}s</div>
                  </div>
                </div>
              </div>

              {/* Middle Section: Things We Know */}
              <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-3 w-3" />
                  Things We Know ({chunk.aiFindings.thingsWeKnow.length})
                </h5>
                {chunk.aiFindings.thingsWeKnow.length > 0 ? (
                  <div className="space-y-2">
                    {chunk.aiFindings.thingsWeKnow.map((finding) => (
                      <div key={finding.id} className="text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {finding.category}
                          </Badge>
                          <span className="text-green-600 font-medium">{finding.confidence}% confidence</span>
                        </div>
                        <p className="text-green-800">{finding.finding}</p>
                      </div>
                    ))}
                    
                    {/* Semantic Tags */}
                    <div className="mt-3 pt-2 border-t border-green-300">
                      <div className="text-xs text-green-700 mb-1">Semantic Tags:</div>
                      <div className="flex flex-wrap gap-1">
                        {chunk.aiFindings.semanticTags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-green-700">No findings yet analyzed</p>
                )}
              </div>

              {/* Bottom Section: Things We Need to Know */}
              <div className="p-3 bg-orange-50 rounded border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-3 w-3" />
                    Things We Need to Know ({chunk.aiFindings.thingsWeNeedToKnow.length})
                  </h5>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-6 px-2 border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Detail View
                  </Button>
                </div>
                {chunk.aiFindings.thingsWeNeedToKnow.length > 0 ? (
                  <ul className="space-y-1">
                    {chunk.aiFindings.thingsWeNeedToKnow.map((gap, index) => (
                      <li key={index} className="text-xs text-orange-800 flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-orange-700">No knowledge gaps identified</p>
                )}
              </div>


            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-medium text-blue-600">{totalChunks}</div>
              <div className="text-sm text-blue-800">Total Chunks</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-medium text-green-600">{analyzedChunks}</div>
              <div className="text-sm text-green-800">Analyzed</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded">
              <div className="text-2xl font-medium text-orange-600">
                {currentDocument.chunks.reduce((sum, chunk) => sum + chunk.aiFindings.thingsWeKnow.length, 0)}
              </div>
              <div className="text-sm text-orange-800">AI Findings</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-2xl font-medium text-purple-600">
                {currentDocument.chunks.reduce((sum, chunk) => sum + chunk.aiFindings.thingsWeNeedToKnow.length, 0)}
              </div>
              <div className="text-sm text-purple-800">Knowledge Gaps</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}