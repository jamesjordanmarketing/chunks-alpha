import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useProcessStore } from '../store/process-store';
import { 
  Move, 
  Plus, 
  Trash2, 
  ArrowDown, 
  ArrowRight,
  Diamond,
  Circle,
  Square
} from 'lucide-react';

export function VisualFlowEditor() {
  const { currentProcess, reorderSteps } = useProcessStore();
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [dragOverStep, setDragOverStep] = useState<string | null>(null);

  if (!currentProcess) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No process selected</p>
      </div>
    );
  }

  const handleDragStart = (stepId: string) => {
    setDraggedStep(stepId);
  };

  const handleDragOver = (e: React.DragEvent, stepId: string) => {
    e.preventDefault();
    setDragOverStep(stepId);
  };

  const handleDrop = (e: React.DragEvent, targetStepId: string) => {
    e.preventDefault();
    if (!draggedStep) return;

    const steps = [...currentProcess.steps];
    const draggedIndex = steps.findIndex(s => s.id === draggedStep);
    const targetIndex = steps.findIndex(s => s.id === targetStepId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = steps.splice(draggedIndex, 1);
      steps.splice(targetIndex, 0, draggedItem);
      
      const reorderedIds = steps.map(s => s.id);
      reorderSteps(reorderedIds);
    }

    setDraggedStep(null);
    setDragOverStep(null);
  };

  const hasDecisionPoints = (stepId: string) => {
    const step = currentProcess.steps.find(s => s.id === stepId);
    return step && step.decisionPoints.length > 0;
  };

  const getDependencies = (stepId: string) => {
    return currentProcess.dependencies[stepId] || [];
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visual Process Flow Editor</CardTitle>
          <p className="text-muted-foreground">
            Drag and drop to reorder steps, visualize dependencies, and edit the process flow
          </p>
        </CardHeader>
      </Card>

      {/* Flow Diagram */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Process Flow Diagram</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
              <Button variant="outline" size="sm">
                <Move className="h-4 w-4 mr-1" />
                Auto-Layout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="min-h-[600px] p-6 bg-gray-50 rounded-lg relative overflow-auto">
            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-sm border space-y-2">
              <div className="text-sm font-medium mb-2">Legend</div>
              <div className="flex items-center gap-2 text-sm">
                <Square className="h-4 w-4 text-blue-500" />
                <span>Process Step</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Diamond className="h-4 w-4 text-amber-500" />
                <span>Decision Point</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Circle className="h-4 w-4 text-green-500" />
                <span>Start/End</span>
              </div>
            </div>

            {/* Start Node */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full font-medium">
                Start
              </div>
            </div>

            {/* Process Steps */}
            <div className="space-y-6">
              {currentProcess.steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Connection Arrow */}
                  {index > 0 && (
                    <div className="flex flex-col items-center mb-4">
                      <ArrowDown className="h-6 w-6 text-gray-400" />
                    </div>
                  )}

                  {/* Dependencies */}
                  {getDependencies(step.id).length > 0 && (
                    <div className="mb-4 text-center">
                      <div className="text-xs text-muted-foreground mb-2">Dependencies:</div>
                      <div className="flex gap-2 justify-center">
                        {getDependencies(step.id).map((depId) => {
                          const depStep = currentProcess.steps.find(s => s.id === depId);
                          return (
                            <Badge key={depId} variant="outline" className="text-xs">
                              {depStep?.number}. {depStep?.title.slice(0, 20)}...
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step Node */}
                  <div
                    draggable
                    onDragStart={() => handleDragStart(step.id)}
                    onDragOver={(e) => handleDragOver(e, step.id)}
                    onDrop={(e) => handleDrop(e, step.id)}
                    className={`relative bg-white border-2 rounded-lg p-4 min-w-[300px] max-w-[400px] cursor-move transition-all hover:shadow-md ${
                      dragOverStep === step.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    } ${
                      step.isValidated ? 'ring-2 ring-green-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded text-sm flex items-center justify-center">
                          {step.number}
                        </div>
                        <h3 className="font-medium text-sm">{step.title}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Move className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      {step.description.slice(0, 100)}...
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="secondary">{step.estimatedDuration}m</Badge>
                      {step.isProprietary && (
                        <Badge variant="outline">Proprietary</Badge>
                      )}
                      {step.isValidated && (
                        <Badge variant="default" className="bg-green-500">Validated</Badge>
                      )}
                    </div>

                    {/* Decision Point Indicator */}
                    {hasDecisionPoints(step.id) && (
                      <div className="absolute -right-2 -bottom-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <Diamond className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Decision Points */}
                  {hasDecisionPoints(step.id) && (
                    <div className="mt-4 space-y-2">
                      {step.decisionPoints.map((dp) => (
                        <div key={dp.id} className="flex items-center gap-4">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs">
                            <div className="font-medium">{dp.condition}</div>
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-3 w-3 text-green-600" />
                                <span className="text-green-700">Yes: {dp.truePath}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-3 w-3 text-red-600" />
                                <span className="text-red-700">No: {dp.falsePath}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* End Node */}
            <div className="flex justify-center mt-6">
              <div className="flex flex-col items-center">
                <ArrowDown className="h-6 w-6 text-gray-400 mb-2" />
                <div className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-full font-medium">
                  End
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Statistics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-medium">{currentProcess.steps.length}</div>
              <div className="text-sm text-muted-foreground">Total Steps</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-medium">
                {currentProcess.steps.reduce((sum, step) => sum + step.decisionPoints.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Decision Points</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-medium">
                {Object.keys(currentProcess.dependencies).length}
              </div>
              <div className="text-sm text-muted-foreground">Dependencies</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}