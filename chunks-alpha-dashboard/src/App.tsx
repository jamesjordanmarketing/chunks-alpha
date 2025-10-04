import { useEffect } from 'react';
import { useDocumentStore } from './store/document-store';
import { mockEssayReviewDocument } from './data/mock-documents';
import { ProcessNavigation } from './components/ProcessNavigation';
import { DocumentChunksOverview } from './components/DocumentChunksOverview';
import { VisualFlowEditor } from './components/VisualFlowEditor';
import { DecisionTreeView } from './components/DecisionTreeView';
import { ProprietaryValueFocus } from './components/ProprietaryValueFocus';
import { SuccessMetricsDashboard } from './components/SuccessMetricsDashboard';
import { ProcessVariations } from './components/ProcessVariations';

export default function App() {
  const { currentDocument, currentPage, setCurrentDocument } = useDocumentStore();

  useEffect(() => {
    // Load mock document data on app start
    setCurrentDocument(mockEssayReviewDocument);
  }, [setCurrentDocument]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return <DocumentChunksOverview />;
      case 2:
        return <VisualFlowEditor />;
      case 3:
        return <DecisionTreeView />;
      case 4:
        return <ProprietaryValueFocus />;
      case 5:
        return <SuccessMetricsDashboard />;
      case 6:
        return <ProcessVariations />;
      default:
        return <DocumentChunksOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentPage !== 1 && <ProcessNavigation />}
      <main className="pb-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
}