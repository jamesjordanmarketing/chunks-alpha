import { Button } from './ui/button';
import { Card } from './ui/card';
import { useDocumentStore } from '../store/document-store';
import { 
  FileText, 
  GitBranch, 
  Target, 
  TrendingUp, 
  Shuffle,
  CheckCircle
} from 'lucide-react';

const pages = [
  { 
    number: 1, 
    title: 'Sections to Analyze', 
    icon: FileText,
    description: 'Document chunks with AI analysis'
  },
  { 
    number: 2, 
    title: 'Visual Flow Editor', 
    icon: GitBranch,
    description: 'Interactive process diagram editing'
  },
  { 
    number: 3, 
    title: 'Decision Tree View', 
    icon: Target,
    description: 'Conditional logic and branching paths'
  },
  { 
    number: 4, 
    title: 'Proprietary Value', 
    icon: CheckCircle,
    description: 'Unique elements and differentiators'
  },
  { 
    number: 5, 
    title: 'Success Metrics', 
    icon: TrendingUp,
    description: 'KPIs and outcome definitions'
  },
  { 
    number: 6, 
    title: 'Process Variations', 
    icon: Shuffle,
    description: 'Multiple scenario management'
  }
];

export function ProcessNavigation() {
  const { currentPage, setCurrentPage, currentDocument } = useDocumentStore();

  return (
    <div className="w-full border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-medium">
              Document Chunks Dashboard - {currentDocument?.filename || 'No Document Selected'}
            </h1>
            <p className="text-muted-foreground">
              AI-powered analysis of document sections and knowledge extraction
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {pages.map((page) => {
            const Icon = page.icon;
            const isActive = currentPage === page.number;
            
            return (
              <Card 
                key={page.number}
                className={`min-w-[200px] p-3 cursor-pointer transition-all hover:shadow-md ${
                  isActive ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setCurrentPage(page.number)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {page.number}
                      </span>
                      <h3 className="font-medium text-sm truncate">{page.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {page.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}