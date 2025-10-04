import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useProcessStore } from '../store/process-store';
import { 
  Shuffle, 
  Plus, 
  Copy,
  Edit3,
  Trash2,
  ArrowRight,
  Zap,
  Users,
  Building,
  Rocket,
  Clock,
  CheckCircle
} from 'lucide-react';

export function ProcessVariations() {
  const { currentProcess, addProcessVariation } = useProcessStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [newVariation, setNewVariation] = useState({
    name: '',
    description: '',
    scenario: '',
    modifiedSteps: [] as string[]
  });

  if (!currentProcess) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No process selected</p>
      </div>
    );
  }

  const getVariationIcon = (name: string) => {
    if (name.toLowerCase().includes('enterprise')) return <Building className="h-4 w-4" />;
    if (name.toLowerCase().includes('mvp') || name.toLowerCase().includes('fast')) return <Rocket className="h-4 w-4" />;
    if (name.toLowerCase().includes('team') || name.toLowerCase().includes('small')) return <Users className="h-4 w-4" />;
    return <Shuffle className="h-4 w-4" />;
  };

  const getStepTitle = (stepId: string) => {
    const step = currentProcess.steps.find(s => s.id === stepId);
    return step ? `${step.number}. ${step.title}` : 'Unknown Step';
  };

  const handleAddVariation = () => {
    if (newVariation.name && newVariation.description && newVariation.scenario) {
      addProcessVariation({
        id: `var-${Date.now()}`,
        ...newVariation,
        additionalSteps: []
      });
      setNewVariation({
        name: '',
        description: '',
        scenario: '',
        modifiedSteps: []
      });
      setShowAddForm(false);
    }
  };

  const baseProcessSteps = currentProcess.steps.length;
  const totalVariations = currentProcess.variations.length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-purple-500" />
            Process Variations
          </CardTitle>
          <p className="text-muted-foreground">
            Manage multiple scenarios and adaptations of your core process
          </p>
        </CardHeader>
      </Card>

      {/* Variations Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <Shuffle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-medium">{totalVariations + 1}</div>
            <div className="text-sm text-blue-800">Total Variations</div>
            <div className="text-xs text-blue-600 mt-1">Including base process</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-medium">{baseProcessSteps}</div>
            <div className="text-sm text-green-800">Base Steps</div>
            <div className="text-xs text-green-600 mt-1">Core process</div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-medium">
              {currentProcess.variations.reduce((sum, v) => sum + v.modifiedSteps.length, 0)}
            </div>
            <div className="text-sm text-purple-800">Modified Steps</div>
            <div className="text-xs text-purple-600 mt-1">Across all variations</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Variation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Process Variations</CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variation
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
                    <label className="text-sm font-medium mb-2 block">Variation Name</label>
                    <Input
                      value={newVariation.name}
                      onChange={(e) => setNewVariation({...newVariation, name: e.target.value})}
                      placeholder="e.g., Enterprise Scale, MVP Fast Track"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Scenario</label>
                    <Input
                      value={newVariation.scenario}
                      onChange={(e) => setNewVariation({...newVariation, scenario: e.target.value})}
                      placeholder="When to use this variation"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={newVariation.description}
                    onChange={(e) => setNewVariation({...newVariation, description: e.target.value})}
                    placeholder="Describe how this variation differs from the base process"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddVariation} className="flex-1">
                    Add Variation
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Variations Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={selectedVariation || 'base'} onValueChange={setSelectedVariation}>
            <div className="border-b">
              <TabsList className="w-full justify-start rounded-none bg-transparent p-4">
                <TabsTrigger 
                  value="base" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-100"
                >
                  <CheckCircle className="h-4 w-4" />
                  Base Process
                </TabsTrigger>
                {currentProcess.variations.map((variation) => (
                  <TabsTrigger 
                    key={variation.id} 
                    value={variation.id}
                    className="flex items-center gap-2 data-[state=active]:bg-blue-100"
                  >
                    {getVariationIcon(variation.name)}
                    {variation.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Base Process Tab */}
            <TabsContent value="base" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Base Process</h3>
                  <Badge variant="secondary">Default</Badge>
                </div>
                <p className="text-muted-foreground">
                  {currentProcess.description}
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Process Steps</h4>
                  {currentProcess.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded text-sm flex items-center justify-center">
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {step.estimatedDuration}m
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Variation Tabs */}
            {currentProcess.variations.map((variation) => (
              <TabsContent key={variation.id} value={variation.id} className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">{variation.name}</h3>
                        {getVariationIcon(variation.name)}
                      </div>
                      <p className="text-muted-foreground mb-2">{variation.description}</p>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="text-sm font-medium text-blue-800 mb-1">When to use:</div>
                        <div className="text-sm text-blue-700">{variation.scenario}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        Clone
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Modified Steps */}
                  {variation.modifiedSteps.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Edit3 className="h-4 w-4" />
                        Modified Steps
                      </h4>
                      <div className="space-y-2">
                        {variation.modifiedSteps.map((stepId) => (
                          <div key={stepId} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded">
                            <Badge variant="outline" className="text-orange-700">Modified</Badge>
                            <span className="text-sm">{getStepTitle(stepId)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Steps */}
                  {variation.additionalSteps.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Additional Steps
                      </h4>
                      <div className="space-y-3">
                        {variation.additionalSteps.map((step) => (
                          <div key={step.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded">
                            <div className="w-6 h-6 bg-green-500 text-white rounded text-sm flex items-center justify-center">
                              {step.number}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{step.title}</div>
                              <div className="text-xs text-muted-foreground">{step.description}</div>
                            </div>
                            <Badge variant="default" className="bg-green-500 text-xs">New</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comparison with Base Process */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Comparison with Base Process</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-2">Base Process</div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>{currentProcess.steps.length} steps</div>
                          <div>{currentProcess.estimatedDuration} minutes total</div>
                          <div>{currentProcess.steps.filter(s => s.isProprietary).length} proprietary steps</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">{variation.name}</div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>
                            {currentProcess.steps.length + variation.additionalSteps.length} steps
                            {variation.additionalSteps.length > 0 && (
                              <span className="text-green-600 ml-1">
                                (+{variation.additionalSteps.length})
                              </span>
                            )}
                          </div>
                          <div>
                            {currentProcess.estimatedDuration + variation.additionalSteps.reduce((sum, s) => sum + s.estimatedDuration, 0)} minutes total
                          </div>
                          <div>{variation.modifiedSteps.length} modified steps</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Variation Comparison Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Variation Comparison Matrix</CardTitle>
          <p className="text-muted-foreground">
            Compare key characteristics across all process variations
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Characteristic</th>
                  <th className="text-left p-3 font-medium">Base Process</th>
                  {currentProcess.variations.map((variation) => (
                    <th key={variation.id} className="text-left p-3 font-medium">
                      {variation.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">Total Steps</td>
                  <td className="p-3">{currentProcess.steps.length}</td>
                  {currentProcess.variations.map((variation) => (
                    <td key={variation.id} className="p-3">
                      {currentProcess.steps.length + variation.additionalSteps.length}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Duration (min)</td>
                  <td className="p-3">{currentProcess.estimatedDuration}</td>
                  {currentProcess.variations.map((variation) => (
                    <td key={variation.id} className="p-3">
                      {currentProcess.estimatedDuration + variation.additionalSteps.reduce((sum, s) => sum + s.estimatedDuration, 0)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Modified Steps</td>
                  <td className="p-3">-</td>
                  {currentProcess.variations.map((variation) => (
                    <td key={variation.id} className="p-3">
                      {variation.modifiedSteps.length}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-medium">Use Case</td>
                  <td className="p-3">Standard operations</td>
                  {currentProcess.variations.map((variation) => (
                    <td key={variation.id} className="p-3 text-sm">
                      {variation.scenario}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}