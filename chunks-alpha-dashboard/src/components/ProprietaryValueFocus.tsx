import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useProcessStore } from '../store/process-store';
import { 
  Star, 
  Shield, 
  Trophy, 
  Zap,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Target
} from 'lucide-react';

export function ProprietaryValueFocus() {
  const { currentProcess, addProprietaryElement } = useProcessStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newElement, setNewElement] = useState({
    stepId: '',
    element: '',
    uniqueValue: '',
    competitiveAdvantage: '',
    tradeSecretLevel: 'medium' as const
  });

  if (!currentProcess) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No process selected</p>
      </div>
    );
  }

  const getTradeSecretIcon = (level: string) => {
    switch (level) {
      case 'high': return <Shield className="h-4 w-4 text-red-500" />;
      case 'medium': return <Lock className="h-4 w-4 text-orange-500" />;
      case 'low': return <Unlock className="h-4 w-4 text-green-500" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const getTradeSecretColor = (level: string) => {
    switch (level) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-orange-200 bg-orange-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const handleAddElement = () => {
    if (newElement.stepId && newElement.element && newElement.uniqueValue) {
      addProprietaryElement({
        id: `pe-${Date.now()}`,
        ...newElement
      });
      setNewElement({
        stepId: '',
        element: '',
        uniqueValue: '',
        competitiveAdvantage: '',
        tradeSecretLevel: 'medium'
      });
      setShowAddForm(false);
    }
  };

  const proprietarySteps = currentProcess.steps.filter(step => step.isProprietary);
  const competitiveAdvantages = currentProcess.proprietaryElements.map(pe => pe.competitiveAdvantage);
  const tradeSecrets = currentProcess.proprietaryElements.filter(pe => pe.tradeSecretLevel === 'high');

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Proprietary Value Focus
          </CardTitle>
          <p className="text-muted-foreground">
            Identify and highlight unique elements that provide competitive advantages
          </p>
        </CardHeader>
      </Card>

      {/* Value Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-medium">{proprietarySteps.length}</div>
            <div className="text-sm text-yellow-800">Proprietary Steps</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-medium">{currentProcess.proprietaryElements.length}</div>
            <div className="text-sm text-blue-800">Unique Elements</div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-medium">{competitiveAdvantages.length}</div>
            <div className="text-sm text-purple-800">Advantages</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-medium">{tradeSecrets.length}</div>
            <div className="text-sm text-red-800">Trade Secrets</div>
          </CardContent>
        </Card>
      </div>

      {/* Process Overview with Proprietary Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Process Overview - Proprietary Elements</CardTitle>
          <p className="text-muted-foreground">
            Steps marked as proprietary with their unique value propositions
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentProcess.steps.map((step) => (
              <div 
                key={step.id} 
                className={`p-4 rounded-lg border ${
                  step.isProprietary 
                    ? 'border-yellow-200 bg-yellow-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.isProprietary 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{step.title}</h3>
                        {step.isProprietary && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Proprietary
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {step.isProprietary && (
                    <div className="text-yellow-600">
                      <Zap className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proprietary Elements Detail */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Proprietary Elements Detail</CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Element
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Form */}
          {showAddForm && (
            <Card className="border-dashed border-2">
              <CardContent className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Step</label>
                    <Select value={newElement.stepId} onValueChange={(value) => setNewElement({...newElement, stepId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a step" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentProcess.steps.map((step) => (
                          <SelectItem key={step.id} value={step.id}>
                            {step.number}. {step.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Trade Secret Level</label>
                    <Select value={newElement.tradeSecretLevel} onValueChange={(value: any) => setNewElement({...newElement, tradeSecretLevel: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - General Best Practice</SelectItem>
                        <SelectItem value="medium">Medium - Company Specific</SelectItem>
                        <SelectItem value="high">High - Trade Secret</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Proprietary Element</label>
                  <Input
                    value={newElement.element}
                    onChange={(e) => setNewElement({...newElement, element: e.target.value})}
                    placeholder="e.g., Custom Algorithm, Proprietary Framework"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Unique Value</label>
                  <Textarea
                    value={newElement.uniqueValue}
                    onChange={(e) => setNewElement({...newElement, uniqueValue: e.target.value})}
                    placeholder="What makes this element unique and valuable?"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Competitive Advantage</label>
                  <Textarea
                    value={newElement.competitiveAdvantage}
                    onChange={(e) => setNewElement({...newElement, competitiveAdvantage: e.target.value})}
                    placeholder="How does this provide competitive advantage? Include metrics if available."
                    rows={2}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddElement} className="flex-1">
                    Add Element
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Elements List */}
          {currentProcess.proprietaryElements.map((element) => {
            const step = currentProcess.steps.find(s => s.id === element.stepId);
            return (
              <Card key={element.id} className={`${getTradeSecretColor(element.tradeSecretLevel)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getTradeSecretIcon(element.tradeSecretLevel)}
                        <Badge variant="outline">
                          Step {step?.number}: {step?.title}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        {element.element}
                      </h4>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-1">Unique Value</h5>
                      <p className="text-sm">{element.uniqueValue}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-1">Competitive Advantage</h5>
                      <p className="text-sm">{element.competitiveAdvantage}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge className={`text-xs ${
                        element.tradeSecretLevel === 'high' ? 'bg-red-100 text-red-800' :
                        element.tradeSecretLevel === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {element.tradeSecretLevel.toUpperCase()} Trade Secret Level
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Competitive Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-500" />
            Competitive Advantage Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Key Differentiators</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {currentProcess.proprietaryElements.map((element, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="font-medium text-sm text-blue-800 mb-1">{element.element}</div>
                    <div className="text-xs text-blue-600">{element.competitiveAdvantage}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Industry Impact</h4>
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-800">
                  This process contains <strong>{currentProcess.proprietaryElements.length}</strong> proprietary elements
                  that provide significant competitive advantages in the industry. The combination of these elements
                  creates a unique value proposition that is difficult for competitors to replicate.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}