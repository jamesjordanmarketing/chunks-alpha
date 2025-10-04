import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useProcessStore } from '../store/process-store';
import { 
  Clock, 
  CheckCircle, 
  Edit3, 
  Save, 
  X, 
  ArrowRight,
  Star,
  AlertTriangle
} from 'lucide-react';

export function ProcessOverview() {
  const { currentProcess, updateStep, validateStep } = useProcessStore();
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  if (!currentProcess) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No process selected</p>
      </div>
    );
  }

  const handleEditStep = (stepId: string) => {
    const step = currentProcess.steps.find(s => s.id === stepId);
    if (step) {
      setEditValues({
        title: step.title,
        description: step.description,
        requiredInputs: step.requiredInputs.join(', '),
        expectedOutputs: step.expectedOutputs.join(', ')
      });
      setEditingStep(stepId);
    }
  };

  const handleSaveStep = (stepId: string) => {
    updateStep(stepId, {
      title: editValues.title,
      description: editValues.description,
      requiredInputs: editValues.requiredInputs.split(', ').filter(Boolean),
      expectedOutputs: editValues.expectedOutputs.split(', ').filter(Boolean)
    });
    setEditingStep(null);
  };

  const handleValidateStep = (stepId: string) => {
    validateStep(stepId);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Process Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                {currentProcess.name}
                <Badge variant="outline">{currentProcess.type}</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">{currentProcess.description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(currentProcess.estimatedDuration / 60)}h {currentProcess.estimatedDuration % 60}m</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step-by-Step Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Process Steps</h2>
          <Badge variant="secondary">
            {currentProcess.steps.filter(s => s.isValidated).length} / {currentProcess.steps.length} Validated
          </Badge>
        </div>

        {currentProcess.steps.map((step, index) => (
          <Card key={step.id} className={`transition-all ${step.isValidated ? 'ring-1 ring-green-200' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.isValidated 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.isValidated ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="flex-1">
                    {editingStep === step.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editValues.title}
                          onChange={(e) => setEditValues({...editValues, title: e.target.value})}
                          placeholder="Step title"
                        />
                        <Textarea
                          value={editValues.description}
                          onChange={(e) => setEditValues({...editValues, description: e.target.value})}
                          placeholder="Step description"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{step.title}</h3>
                          {step.isProprietary && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Proprietary
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {step.estimatedDuration}m
                  </div>
                  {editingStep === step.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleSaveStep(step.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingStep(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEditStep(step.id)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {!step.isValidated && (
                        <Button size="sm" variant="ghost" onClick={() => handleValidateStep(step.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {editingStep === step.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Required Inputs</label>
                    <Input
                      value={editValues.requiredInputs}
                      onChange={(e) => setEditValues({...editValues, requiredInputs: e.target.value})}
                      placeholder="Input 1, Input 2, Input 3..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Expected Outputs</label>
                    <Input
                      value={editValues.expectedOutputs}
                      onChange={(e) => setEditValues({...editValues, expectedOutputs: e.target.value})}
                      placeholder="Output 1, Output 2, Output 3..."
                    />
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Required Inputs</h4>
                    <div className="space-y-1">
                      {step.requiredInputs.map((input, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span>{input}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Expected Outputs</h4>
                    <div className="space-y-1">
                      {step.expectedOutputs.map((output, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span>{output}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step.decisionPoints.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Decision Points</span>
                  </div>
                  {step.decisionPoints.map((dp) => (
                    <div key={dp.id} className="text-sm text-amber-700">
                      <strong>If:</strong> {dp.condition}<br />
                      <strong>Then:</strong> {dp.truePath}<br />
                      <strong>Else:</strong> {dp.falsePath}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Common Mistakes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Common Mistakes to Avoid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentProcess.commonMistakes.map((mistake, index) => (
              <div key={index} className="flex items-start gap-2">
                <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{mistake}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validate Process Button */}
      <div className="flex justify-center pt-4">
        <Button size="lg" className="px-8">
          <CheckCircle className="h-5 w-5 mr-2" />
          Validate Complete Process
        </Button>
      </div>
    </div>
  );
}