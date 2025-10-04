import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { useProcessStore } from '../store/process-store';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  BarChart3
} from 'lucide-react';

export function SuccessMetricsDashboard() {
  const { currentProcess, updateSuccessMetric } = useProcessStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMetric, setNewMetric] = useState({
    name: '',
    description: '',
    threshold: 0,
    unit: '',
    type: 'efficiency' as const
  });

  if (!currentProcess) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No process selected</p>
      </div>
    );
  }

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'time': return <Clock className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      case 'quality': return <CheckCircle className="h-4 w-4" />;
      case 'efficiency': return <TrendingUp className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'time': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'cost': return 'border-green-200 bg-green-50 text-green-800';
      case 'quality': return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'efficiency': return 'border-orange-200 bg-orange-50 text-orange-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getPerformanceStatus = (current: number, threshold: number, type: string) => {
    const ratio = current / threshold;
    
    // For cost metrics, lower is better
    if (type === 'cost') {
      if (ratio <= 0.8) return { status: 'excellent', color: 'text-green-600' };
      if (ratio <= 1.0) return { status: 'good', color: 'text-blue-600' };
      if (ratio <= 1.2) return { status: 'warning', color: 'text-orange-600' };
      return { status: 'poor', color: 'text-red-600' };
    }
    
    // For other metrics, higher is better
    if (ratio >= 1.2) return { status: 'excellent', color: 'text-green-600' };
    if (ratio >= 1.0) return { status: 'good', color: 'text-blue-600' };
    if (ratio >= 0.8) return { status: 'warning', color: 'text-orange-600' };
    return { status: 'poor', color: 'text-red-600' };
  };

  const calculateOverallScore = () => {
    const metrics = currentProcess.successMetrics.filter(m => m.currentValue !== undefined);
    if (metrics.length === 0) return 0;
    
    const scores = metrics.map(metric => {
      const ratio = metric.currentValue! / metric.threshold;
      return metric.type === 'cost' ? Math.min(100, (1 / ratio) * 100) : Math.min(100, ratio * 100);
    });
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Success Metrics Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Define and track KPIs and outcome measurements for process success
          </p>
        </CardHeader>
      </Card>

      {/* Overall Performance Score */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium mb-2">Overall Process Performance</h3>
              <p className="text-muted-foreground">
                Aggregate score based on all defined metrics
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{calculateOverallScore()}%</div>
              <div className="text-sm text-muted-foreground">Performance Score</div>
            </div>
          </div>
          <Progress value={calculateOverallScore()} className="mt-4" />
        </CardContent>
      </Card>

      {/* Metrics Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {['time', 'cost', 'quality', 'efficiency'].map((type) => {
          const metrics = currentProcess.successMetrics.filter(m => m.type === type);
          const avgPerformance = metrics.length > 0 
            ? metrics.reduce((sum, m) => {
                if (!m.currentValue) return sum;
                const ratio = m.currentValue / m.threshold;
                return sum + (type === 'cost' ? (1 / ratio) * 100 : ratio * 100);
              }, 0) / metrics.length
            : 0;
          
          return (
            <Card key={type} className={getMetricColor(type)}>
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  {getMetricIcon(type)}
                </div>
                <div className="text-2xl font-medium">{metrics.length}</div>
                <div className="text-sm capitalize">{type} Metrics</div>
                <div className="text-xs mt-1">
                  Avg: {Math.round(avgPerformance)}%
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Metrics Detail */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Success Metrics</CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Metric
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
                    <label className="text-sm font-medium mb-2 block">Metric Name</label>
                    <Input
                      value={newMetric.name}
                      onChange={(e) => setNewMetric({...newMetric, name: e.target.value})}
                      placeholder="e.g., Customer Satisfaction"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select value={newMetric.type} onValueChange={(value: any) => setNewMetric({...newMetric, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time">Time</SelectItem>
                        <SelectItem value="cost">Cost</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                        <SelectItem value="efficiency">Efficiency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Input
                    value={newMetric.description}
                    onChange={(e) => setNewMetric({...newMetric, description: e.target.value})}
                    placeholder="What does this metric measure?"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Success Threshold</label>
                    <Input
                      type="number"
                      value={newMetric.threshold}
                      onChange={(e) => setNewMetric({...newMetric, threshold: Number(e.target.value)})}
                      placeholder="Target value"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Unit</label>
                    <Input
                      value={newMetric.unit}
                      onChange={(e) => setNewMetric({...newMetric, unit: e.target.value})}
                      placeholder="e.g., %, hours, dollars"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1">
                    Add Metric
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metrics List */}
          <div className="grid gap-4">
            {currentProcess.successMetrics.map((metric) => {
              const hasCurrentValue = metric.currentValue !== undefined;
              const performance = hasCurrentValue 
                ? getPerformanceStatus(metric.currentValue!, metric.threshold, metric.type)
                : null;
              
              return (
                <Card key={metric.id} className={`${getMetricColor(metric.type)} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/50">
                          {getMetricIcon(metric.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{metric.name}</h4>
                          <p className="text-sm opacity-80">{metric.description}</p>
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
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs font-medium opacity-80 mb-1">Target</div>
                        <div className="text-lg font-medium">
                          {metric.threshold} {metric.unit}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium opacity-80 mb-1">Current</div>
                        <div className={`text-lg font-medium ${performance?.color || 'text-gray-500'}`}>
                          {hasCurrentValue ? `${metric.currentValue} ${metric.unit}` : 'Not set'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium opacity-80 mb-1">Performance</div>
                        <div className="flex items-center gap-2">
                          {performance && (
                            <>
                              <Badge className={`text-xs ${performance.color} bg-white/50`}>
                                {performance.status.toUpperCase()}
                              </Badge>
                              {performance.status === 'excellent' && <CheckCircle className="h-4 w-4 text-green-600" />}
                              {performance.status === 'warning' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {hasCurrentValue && (
                      <div className="mt-3">
                        <Progress 
                          value={Math.min(100, (metric.currentValue! / metric.threshold) * 100)} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Success Criteria Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Success Criteria Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Process Success Definition</h4>
              <p className="text-sm text-muted-foreground mb-3">
                This process is considered successful when all defined metrics meet or exceed their thresholds:
              </p>
              <div className="space-y-2">
                {currentProcess.successMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center gap-2 text-sm">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span>
                      <strong>{metric.name}</strong> {metric.type === 'cost' ? '≤' : '≥'} {metric.threshold} {metric.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-2">Current Status</h5>
              <p className="text-sm text-blue-700">
                {currentProcess.successMetrics.filter(m => m.currentValue !== undefined).length} of {currentProcess.successMetrics.length} metrics have current values set.
                Overall performance score: <strong>{calculateOverallScore()}%</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}