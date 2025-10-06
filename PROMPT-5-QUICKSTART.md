# PROMPT #5: QUICKSTART GUIDE
## Run Management & Polish - Developer Quick Reference

---

## 🚀 Quick Setup

No setup required! All features are automatically available after implementing Build Prompt #5.

---

## 📦 What's New in Build Prompt #5

### 1. Run Comparison
Compare dimension values across multiple runs with color-coded differences.

**File:** `src/components/chunks/RunComparison.tsx`

### 2. Regeneration API
Regenerate dimensions for specific chunks with template selection.

**Endpoint:** `POST /api/chunks/regenerate`

### 3. Regeneration UI
Modal interface for regenerating dimensions with progress feedback.

**File:** `src/app/chunks/[documentId]/page.tsx` (updated)

### 4. Loading States
Skeleton loaders and progress indicators throughout.

### 5. Error Boundaries
Graceful error handling with fallback UI.

**File:** `src/components/chunks/ErrorBoundary.tsx`

### 6. Toast Notifications
Real-time feedback for all user actions using Sonner.

---

## 🔧 Using the Regeneration API

### Basic Request

```typescript
const response = await fetch('/api/chunks/regenerate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId: 'uuid-here'
  })
});

const data = await response.json();
console.log('New run ID:', data.runId);
```

### With Specific Chunks

```typescript
await fetch('/api/chunks/regenerate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId: 'uuid-here',
    chunkIds: ['chunk-id-1', 'chunk-id-2']  // Only these chunks
  })
});
```

### With Template Selection

```typescript
await fetch('/api/chunks/regenerate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId: 'uuid-here',
    templateIds: ['template-id-1', 'template-id-2']  // Only these templates
  })
});
```

### With AI Parameter Overrides

```typescript
await fetch('/api/chunks/regenerate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentId: 'uuid-here',
    aiParams: {
      temperature: 0.7,  // Default is 0.5
      model: 'claude-3-sonnet-20240229'  // Override model
    }
  })
});
```

---

## 🎨 Using the RunComparison Component

### Basic Usage

```tsx
import { RunComparison } from '@/components/chunks/RunComparison';

function MyPage() {
  const [runs, setRuns] = useState<ChunkDimensions[]>([]);
  
  // Fetch 2-5 runs to compare
  useEffect(() => {
    // Load runs from API
  }, []);

  return (
    <RunComparison 
      runs={runs} 
      runNames={{
        'run-id-1': 'Initial Generation',
        'run-id-2': 'Improved Prompts',
        'run-id-3': 'Final Version'
      }}
    />
  );
}
```

### Props

```typescript
interface RunComparisonProps {
  runs: ChunkDimensions[];  // 2-5 runs to compare (required)
  runNames?: Record<string, string>;  // Optional: run_id -> display name mapping
}
```

---

## 🛡️ Using Error Boundaries

### Wrap Any Component

```tsx
import { ErrorBoundary } from '@/components/chunks/ErrorBoundary';

function MyPage() {
  return (
    <ErrorBoundary fallbackTitle="Chunk Dashboard Error">
      <ChunkDashboard />
    </ErrorBoundary>
  );
}
```

### Multiple Boundaries

```tsx
function MyPage() {
  return (
    <ErrorBoundary fallbackTitle="Page Error">
      <Header />
      
      <ErrorBoundary fallbackTitle="Spreadsheet Error">
        <ChunkSpreadsheet />
      </ErrorBoundary>
      
      <ErrorBoundary fallbackTitle="Comparison Error">
        <RunComparison />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}
```

---

## 🔔 Using Toast Notifications

### Import

```typescript
import { toast } from 'sonner';
```

### Usage Examples

```typescript
// Info toast
toast.info('Processing data...');

// Success toast
toast.success('Data saved successfully!');

// Error toast
toast.error('Failed to load data');

// With action button
toast.error('Upload failed', {
  action: {
    label: 'Retry',
    onClick: () => retryUpload()
  }
});

// With duration
toast.success('Copied to clipboard', {
  duration: 2000  // 2 seconds
});
```

### Toast Types

| Type | Method | Color | Usage |
|------|--------|-------|-------|
| Info | `toast.info()` | Blue | Informational messages |
| Success | `toast.success()` | Green | Successful operations |
| Error | `toast.error()` | Red | Errors and failures |
| Warning | `toast.warning()` | Yellow | Warnings |
| Loading | `toast.loading()` | Gray | Ongoing operations |

---

## 💀 Adding Loading States

### Skeleton Loaders

```tsx
import { Skeleton } from '@/components/ui/skeleton';

function MyComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return <ActualContent />;
}
```

### Button Loading States

```tsx
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function MyButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        'Click Me'
      )}
    </Button>
  );
}
```

### Progress Indicator

```tsx
import { Progress } from '@/components/ui/progress';

function MyComponent() {
  const [progress, setProgress] = useState(0);

  return (
    <div>
      <p>Analysis Progress: {progress}%</p>
      <Progress value={progress} className="w-full" />
    </div>
  );
}
```

---

## 🎯 Common Workflows

### Workflow 1: Regenerate Single Chunk

```typescript
async function regenerateChunk(chunkId: string, documentId: string) {
  try {
    toast.info('Starting regeneration...');
    
    const response = await fetch('/api/chunks/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId,
        chunkIds: [chunkId]
      })
    });

    if (!response.ok) {
      throw new Error('Regeneration failed');
    }

    const data = await response.json();
    toast.success(`Complete! Run ID: ${data.runId.substring(0, 8)}...`);
    
    // Refresh data
    window.location.reload();
    
  } catch (error) {
    toast.error('Regeneration failed', {
      action: {
        label: 'Retry',
        onClick: () => regenerateChunk(chunkId, documentId)
      }
    });
  }
}
```

### Workflow 2: Export with Loading State

```typescript
async function handleExport() {
  const [exporting, setExporting] = useState(false);
  
  try {
    setExporting(true);
    toast.info('Preparing export...');
    
    // Generate CSV content
    const csvContent = generateCSV(data);
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
    
  } catch (error) {
    toast.error(`Export failed: ${error.message}`);
  } finally {
    setExporting(false);
  }
}
```

### Workflow 3: Compare Runs

```typescript
async function loadRunsForComparison(chunkId: string) {
  try {
    // Fetch all dimensions for chunk
    const response = await fetch(`/api/chunks/dimensions?chunkId=${chunkId}`);
    const data = await response.json();
    
    // Take latest 3 runs
    const runs = data.dimensions.slice(0, 3);
    
    // Display comparison
    return <RunComparison runs={runs} />;
    
  } catch (error) {
    toast.error('Failed to load runs');
    return <ErrorFallback />;
  }
}
```

---

## 🐛 Debugging Tips

### 1. Check Console for Errors

```typescript
console.error('Regeneration error:', error);
console.log('Dimension data:', dimensions);
```

### 2. Verify API Response

```typescript
const response = await fetch('/api/chunks/regenerate', {...});
console.log('Status:', response.status);
console.log('Body:', await response.json());
```

### 3. Check Database State

```sql
-- View runs for document
SELECT * FROM chunk_runs 
WHERE document_id = 'your-doc-id' 
ORDER BY started_at DESC;

-- View dimensions for chunk
SELECT run_id, generation_confidence_accuracy, generation_cost_usd 
FROM chunk_dimensions 
WHERE chunk_id = 'your-chunk-id' 
ORDER BY generated_at DESC;

-- Count dimensions per run
SELECT run_id, COUNT(*) as dimension_count 
FROM chunk_dimensions 
GROUP BY run_id 
ORDER BY MAX(generated_at) DESC;
```

### 4. Test Error Handling

```typescript
// Simulate error
throw new Error('Test error');

// Verify error boundary catches it
// Verify toast notification shows
// Verify "Try Again" button works
```

---

## 📊 Performance Optimization

### 1. Lazy Load Components

```typescript
import dynamic from 'next/dynamic';

const RunComparison = dynamic(() => 
  import('@/components/chunks/RunComparison').then(mod => mod.RunComparison),
  { loading: () => <Skeleton className="h-96 w-full" /> }
);
```

### 2. Debounce Search Input

```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedFilter = useMemo(
  () => debounce((value: string) => setFilterText(value), 300),
  []
);
```

### 3. Virtual Scrolling for Large Tables

```typescript
// For 1000+ rows, use react-window
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={dimensions.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>
      {renderRow(dimensions[index])}
    </div>
  )}
</FixedSizeList>
```

---

## 🎓 Best Practices

### 1. Always Show Loading States

```typescript
✅ Good:
<Button disabled={loading}>
  {loading ? <Loader2 className="animate-spin" /> : 'Submit'}
</Button>

❌ Bad:
<Button onClick={handleSubmit}>Submit</Button>
// No indication of loading state
```

### 2. Always Handle Errors

```typescript
✅ Good:
try {
  await fetch('/api/regenerate', {...});
  toast.success('Complete!');
} catch (error) {
  toast.error(`Failed: ${error.message}`);
}

❌ Bad:
await fetch('/api/regenerate', {...});
// No error handling
```

### 3. Always Preserve History

```typescript
✅ Good:
// Create new run_id for each regeneration
const runId = await generator.generateDimensionsForDocument({...});

❌ Bad:
// Delete old dimensions before regenerating
await db.delete().where('chunk_id', chunkId);
```

### 4. Always Provide Feedback

```typescript
✅ Good:
toast.info('Starting...');
await operation();
toast.success('Complete!');

❌ Bad:
await operation();
// No user feedback
```

---

## 🔗 Quick Links

- **Completion Summary:** [PROMPT-5-COMPLETION-SUMMARY.md](./PROMPT-5-COMPLETION-SUMMARY.md)
- **Visual Guide:** [PROMPT-5-VISUAL-GUIDE.md](./PROMPT-5-VISUAL-GUIDE.md)
- **Test Workflow:** [test-workflow.md](./test-workflow.md)

---

## 📞 Getting Help

### Common Issues

**Issue:** Regeneration fails with 401 error  
**Solution:** Ensure user is authenticated. Check `userService.getCurrentUser()`.

**Issue:** Toast notifications not showing  
**Solution:** Verify `<Toaster />` is in `layout.tsx`.

**Issue:** Error boundary not catching errors  
**Solution:** Wrap component with `<ErrorBoundary>`. Check for async errors.

**Issue:** Loading skeletons flash briefly  
**Solution:** Add minimum display time or use suspense boundaries.

**Issue:** Export downloads empty CSV  
**Solution:** Verify data is populated before calling `handleExport()`.

---

## 🎯 Next Steps

1. ✅ Run through `test-workflow.md` (58 checkpoints)
2. ✅ Verify all toast notifications display correctly
3. ✅ Test error boundaries by throwing errors
4. ✅ Check database for preserved historical runs
5. ✅ Test export with large datasets (1000+ rows)
6. ✅ Verify responsive design on mobile/tablet
7. ✅ Run accessibility audit (WCAG AA)

---

## 📚 Code Examples Repository

All examples in this guide are available in:
- `src/components/chunks/` - Component implementations
- `src/app/api/chunks/` - API endpoints
- `test-workflow.md` - Testing procedures

---

**End of Quickstart Guide**

*Last Updated: October 6, 2025*  
*Build Prompt #5: Run Management & Polish*

