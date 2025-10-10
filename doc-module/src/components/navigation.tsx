import React from 'react';
import { Upload, List, Eye, FileText, Settings, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useDocumentStore } from '../lib/stores/document-store';

const Navigation: React.FC = () => {
  const {
    currentView,
    files,
    processingStats,
    setCurrentView
  } = useDocumentStore();

  const navItems = [
    {
      id: 'upload' as const,
      label: 'Upload',
      icon: Upload,
      description: 'Add new documents',
      badge: files.length >= 100 ? 'Full' : null
    },
    {
      id: 'queue' as const,
      label: 'Documents',
      icon: List,
      description: 'Manage Document Setup',
      badge: processingStats.processingFiles > 0 ? processingStats.processingFiles.toString() : null
    },
    {
      id: 'preview' as const,
      label: 'Preview',
      icon: Eye,
      description: 'View content',
      badge: null
    }
  ];

  return (
    <div className="w-64 border-r bg-muted/20 p-4">
      <div className="space-y-4">
        {/* Logo/Header */}
        <div className="flex items-center gap-2 px-2">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h2 className="font-semibold">Document Processor</h2>
            <p className="text-xs text-muted-foreground">FR1.1.0 - Stage 1</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start h-auto p-3"
                onClick={() => setCurrentView(item.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant={isActive ? 'secondary' : 'outline'} className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </nav>

        {/* Stats Summary */}
        <Card>
          <CardContent className="p-3 space-y-2">
            <h4 className="text-sm font-medium">Processing Summary</h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Total Files:</span>
                <div className="font-medium">{processingStats.totalFiles}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Completed:</span>
                <div className="font-medium text-green-600">{processingStats.completedFiles}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Processing:</span>
                <div className="font-medium text-blue-600">{processingStats.processingFiles}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Errors:</span>
                <div className="font-medium text-red-600">{processingStats.errorFiles}</div>
              </div>
            </div>

            {processingStats.totalProgress > 0 && (
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{Math.round(processingStats.totalProgress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingStats.totalProgress}%` }}
                  />
                </div>
              </div>
            )}

            {processingStats.estimatedTimeRemaining && (
              <div className="text-xs text-muted-foreground">
                <span>ETA: {processingStats.estimatedTimeRemaining} minutes</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardContent className="p-3 space-y-2">
            <h4 className="text-sm font-medium">System Status</h4>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Throughput:</span>
                <span>{processingStats.throughputPerMinute}/min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Queue Capacity:</span>
                <span>{100 - processingStats.totalFiles} remaining</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">All systems operational</span>
            </div>
          </CardContent>
        </Card>

        {/* Transformation Dashboard */}
        <Button
          variant="outline"
          className="w-full justify-center bg-[#fdc218] text-white hover:bg-[#fdc218]/90 hover:text-white border-[#fdc218] h-auto py-2 px-2"
          onClick={() => window.open('https://chunks-alpha.vercel.app/dashboard', '_blank', 'noopener,noreferrer')}
        >
          <span className="text-center leading-snug">
            Transformation<br />Dashboard
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
