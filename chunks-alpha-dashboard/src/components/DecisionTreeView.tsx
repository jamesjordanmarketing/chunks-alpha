import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useProcessStore } from '../store/process-store';
import { 
  GitBranch, 
  Plus, 
  Edit3, 
  Trash2,
  ArrowRight,
  ArrowDown,
  Diamond,
  Circle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TreeNode {
  id: string;
  stepId: string;
  condition: string;
  type: 'boolean' | 'multiple' | 'threshold';
  truePath: string;
  falsePath: string;
  children?: TreeNode[];
  level: number;
}

export function DecisionTreeView() {
  const { currentProcess } = useProcessStore();
  const [selectedStep, setSelectedStep] = useState<string>('');
  const [newDecision, setNewDecision] = useState({
    condition: '',
    type: 'boolean' as const,
    truePath: '',
    falsePath: ''
  });

  if (!currentProcess) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No process selected</p>
      </div>
    );
  }

  const buildDecisionTree = (): TreeNode[] => {
    const nodes: TreeNode[] = [];
    
    currentProcess.steps.forEach((step, stepIndex) => {
      step.decisionPoints.forEach((dp, dpIndex) => {
        nodes.push({
          id: `${step.id}-${dp.id}`,
          stepId: step.id,
          condition: dp.condition,
          type: dp.type,
          truePath: dp.truePath,
          falsePath: dp.falsePath,
          level: stepIndex
        });
      });
    });
    
    return nodes;
  };

  const decisionNodes = buildDecisionTree();

  const renderDecisionNode = (node: TreeNode, index: number) => {
    const step = currentProcess.steps.find(s => s.id === node.stepId);
    
    return (
      <div key={node.id} className="relative">
        {/* Connection Line */}
        {index > 0 && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <ArrowDown className="h-6 w-6 text-gray-400" />
          </div>
        )}
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline">Step {step?.number}</Badge>
                <span className="font-medium">{step?.title}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Decision Point */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-4 relative">
                <Diamond className="absolute -top-2 -left-2 h-4 w-4 bg-amber-500 text-white rounded-full p-0.5" />
                <div className="text-center">
                  <div className="font-medium mb-2">{node.condition}</div>
                  <Badge variant="secondary" className="text-xs">
                    {node.type} decision
                  </Badge>
                </div>
              </div>
            </div>

            {/* Decision Paths */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* True Path */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-700">True Path</span>
                </div>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <p className="text-sm">{node.truePath}</p>
                  </CardContent>
                </Card>
              </div>

              {/* False Path */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-700">False Path</span>
                </div>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <p className="text-sm">{node.falsePath}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Decision Type Details */}
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium mb-2">Decision Type: {node.type}</div>
              <div className="text-xs text-muted-foreground">
                {node.type === 'boolean' && 'Yes/No decision with two possible outcomes'}
                {node.type === 'multiple' && 'Multiple choice decision with several paths'}
                {node.type === 'threshold' && 'Numeric threshold-based decision'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Decision Tree View
          </CardTitle>
          <p className="text-muted-foreground">
            Visualize and manage conditional logic and branching paths in your process
          </p>
        </CardHeader>
      </Card>

      {/* Add New Decision Point */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Decision Point</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Step</label>
              <Select value={selectedStep} onValueChange={setSelectedStep}>
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
              <label className="text-sm font-medium mb-2 block">Decision Type</label>
              <Select 
                value={newDecision.type} 
                onValueChange={(value: any) => setNewDecision({...newDecision, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                  <SelectItem value="multiple">Multiple Choice</SelectItem>
                  <SelectItem value="threshold">Threshold Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Condition</label>
            <Input
              value={newDecision.condition}
              onChange={(e) => setNewDecision({...newDecision, condition: e.target.value})}
              placeholder="e.g., Is the budget greater than $10,000?"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">True Path Action</label>
              <Input
                value={newDecision.truePath}
                onChange={(e) => setNewDecision({...newDecision, truePath: e.target.value})}
                placeholder="Action if condition is true"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">False Path Action</label>
              <Input
                value={newDecision.falsePath}
                onChange={(e) => setNewDecision({...newDecision, falsePath: e.target.value})}
                placeholder="Action if condition is false"
              />
            </div>
          </div>
          
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Decision Point
          </Button>
        </CardContent>
      </Card>

      {/* Decision Tree Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Decision Tree Flow</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Diamond className="h-4 w-4 text-amber-500" />
              <span>Decision Point</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>True Path</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>False Path</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {decisionNodes.length === 0 ? (
            <div className="text-center py-12">
              <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Decision Points</h3>
              <p className="text-muted-foreground mb-4">
                This process doesn't have any decision points yet. Add conditional logic to create branching paths.
              </p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add First Decision Point
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Start Node */}
              <div className="flex justify-center">
                <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-medium">
                  Start
                </div>
              </div>

              {/* Decision Nodes */}
              {decisionNodes.map((node, index) => renderDecisionNode(node, index))}

              {/* End Node */}
              <div className="flex justify-center">
                <div className="bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-medium">
                  End
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decision Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-medium">{decisionNodes.length}</div>
            <div className="text-sm text-muted-foreground">Total Decisions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-medium">
              {decisionNodes.filter(n => n.type === 'boolean').length}
            </div>
            <div className="text-sm text-muted-foreground">Boolean</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-medium">
              {decisionNodes.filter(n => n.type === 'threshold').length}
            </div>
            <div className="text-sm text-muted-foreground">Threshold</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-medium">
              {decisionNodes.filter(n => n.type === 'multiple').length}
            </div>
            <div className="text-sm text-muted-foreground">Multiple Choice</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}