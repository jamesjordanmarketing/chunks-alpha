import React, { useEffect } from 'react';
import { Toaster } from 'sonner@2.0.3';
import Navigation from './components/navigation';
import UploadInterface from './components/upload-interface';
import QueueManagement from './components/queue-management';
import ContentPreview from './components/content-preview';
import { useDocumentStore } from './lib/stores/document-store';

const App: React.FC = () => {
  const { currentView } = useDocumentStore();

  // Initialize the store with some demo data after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const store = useDocumentStore.getState();
      
      // Add some demo files to showcase the functionality
      const demoFiles = [
        new File([new Blob(['# Demo File 1\n\nThis is a sample markdown file for demonstration.'])], 'demo-guide.md', { type: 'text/markdown' }),
        new File([new Blob(['Sample text content for testing the document processor.'])], 'sample.txt', { type: 'text/plain' })
      ];
      
      store.addFiles(demoFiles);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'upload':
        return <UploadInterface />;
      case 'queue':
        return <QueueManagement />;
      case 'preview':
        return <ContentPreview />;
      default:
        return <UploadInterface />;
    }
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Navigation Sidebar */}
      <Navigation />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {renderCurrentView()}
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
      />
    </div>
  );
};

export default App;