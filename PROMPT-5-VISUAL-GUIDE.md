# PROMPT #5: VISUAL GUIDE
## Run Management & Polish Features

---

## 🎯 Overview

This guide provides visual descriptions and usage instructions for all features added in Build Prompt #5: Run Management & Polish.

---

## 1️⃣ Run Comparison Interface

### Location
Access via: `[Future: Compare Runs button on dashboard]`

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ Comparison Statistics                                                │
├─────────────────────────────────────────────────────────────────────┤
│  [20]          [15]         [8]          [5]          [2]           │
│  Total         Changed      Improved     Degraded     Neutral       │
│  Fields        (purple)     (green)      (red)        (yellow)      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ [All Fields] [Changes Only]              [Export Comparison ↓]      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Field Name              │ Run 1        │ Run 2        │ Run 3        │
├─────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Confidence Accuracy     │ 7            │ 8 ↗          │ 9 ↗          │
│                         │              │ [GREEN BG]   │ [GREEN BG]   │
├─────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Generation Cost         │ $0.0023      │ $0.0019 ↗    │ $0.0018 ↗    │
│                         │              │ [GREEN BG]   │ [GREEN BG]   │
├─────────────────────────┼──────────────┼──────────────┼──────────────┤
│ Chunk Summary           │ Overview...  │ Better...    │ Best...      │
│                         │              │ [YELLOW BG]  │ [YELLOW BG]  │
└─────────────────────────┴──────────────┴──────────────┴──────────────┘

Legend:
[GREEN] = Improved   [RED] = Degraded   [YELLOW] = Changed   [WHITE] = Same
```

### Color Logic

#### Green (Improved) 🟢
- **Confidence scores:** 7 → 8 → 9
- **Cost:** $0.0023 → $0.0019 (lower is better)
- **Duration:** 1500ms → 1200ms (faster is better)
- **Content:** null → "value" (empty to populated)

#### Red (Degraded) 🔴
- **Confidence scores:** 9 → 7 → 5
- **Cost:** $0.0018 → $0.0025 (higher is worse)
- **Duration:** 1200ms → 1800ms (slower is worse)
- **Content:** "value" → null (populated to empty)

#### Yellow (Neutral) 🟡
- **Content fields:** "Text A" → "Text B" (changed but quality unclear)
- **Tags:** ["tag1", "tag2"] → ["tag3", "tag4"]

### Usage Instructions

1. **Select Runs:**
   - Choose 2-5 runs to compare
   - Runs displayed left to right (oldest to newest)

2. **View Statistics:**
   - Top card shows aggregate metrics
   - Quick overview of change magnitude

3. **Filter Views:**
   - **All Fields:** See every dimension
   - **Changes Only:** Hide unchanged rows for focus

4. **Interpret Colors:**
   - Follow legend at bottom
   - Icons indicate direction (↗ up, ↘ down, − neutral)

5. **Export:**
   - Click "Export Comparison"
   - CSV downloads with all visible data
   - Filename: `run-comparison-[timestamp].csv`

---

## 2️⃣ Regeneration Interface

### Individual Chunk Regeneration

```
┌─────────────────────────────────────────────────────────────────┐
│ 📄 Chunk: Introduction                    [↻] ID: DOC_001#C001  │
│    [Chapter Sequential]                    ✓ Analyzed           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ # Chunk Metadata                                            │ │
│ │ Chars: 2,543  Tokens: 612  Page: 1  Type: Chapter          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ✓ Things We Know (12)                                       │ │
│ │ [Chunk Summary] 80% confidence                              │ │
│ │ "This chapter introduces the core concepts..."              │ │
│ │ [Audience] 90% confidence                                   │ │
│ │ "Technical professionals with basic knowledge"              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⚠ Things We Need to Know (5)     [Detail View ↗]           │ │
│ │ → Key Terms: Low confidence (60%)                           │ │
│ │ → Domain Tags: Low confidence (50%)                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Click [↻] button → Opens Modal ↓**

### Regeneration Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Regenerate Dimensions                                   [×] │
├─────────────────────────────────────────────────────────────┤
│ Regenerate dimensions for selected chunk                    │
│                                                              │
│ Select Templates (optional)                                 │
│ Leave unchecked to use all applicable templates             │
│                                                              │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ☐ Content Analysis          [content_analysis]        │   │
│ │ ☐ Task Extraction           [task_extraction]         │   │
│ │ ☐ CER Analysis              [cer_analysis]            │   │
│ │ ☐ Scenario Extraction       [scenario_extraction]     │   │
│ │ ☐ Risk Assessment           [risk_assessment]         │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ℹ️ Note: This will create a new run and preserve all  │   │
│ │ historical data. Previous dimension values will not   │   │
│ │ be deleted.                                            │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                              │
│                            [Cancel] [↻ Regenerate]           │
└─────────────────────────────────────────────────────────────┘
```

**During Regeneration:**

```
┌─────────────────────────────────────────────────────────────┐
│ Regenerate Dimensions                                   [×] │
├─────────────────────────────────────────────────────────────┤
│ [⊙ Regenerating...]                                         │
│                                                              │
│ [Button disabled, spinner animating]                        │
└─────────────────────────────────────────────────────────────┘

Toast Notification (bottom right):
┌────────────────────────────────┐
│ ℹ️ Starting regeneration...    │
└────────────────────────────────┘
```

**On Completion:**

```
Toast Notification (bottom right):
┌─────────────────────────────────────────────┐
│ ✓ Regeneration complete!                    │
│   Created run: a3f2c1b9...                  │
└─────────────────────────────────────────────┘

[Page auto-reloads, modal closes, latest data displayed]
```

### Bulk Regeneration

```
┌─────────────────────────────────────────────────────────────┐
│ Auto-Generated Chunks          [15 / 15 Analyzed]           │
│                                [↻ Regenerate All]           │
└─────────────────────────────────────────────────────────────┘
```

**Click "Regenerate All" → Opens Modal:**

```
┌─────────────────────────────────────────────────────────────┐
│ Regenerate Dimensions                                   [×] │
├─────────────────────────────────────────────────────────────┤
│ Regenerate dimensions for all 15 chunks in this document   │
│                                                              │
│ [Same template selection as single chunk]                   │
│ [Same info box]                                             │
│                                                              │
│                            [Cancel] [↻ Regenerate]           │
└─────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ Loading States

### Dashboard Loading (Skeleton)

```
┌─────────────────────────────────────────────────────────────┐
│              [████████░░░░░░░░░░░░░░]                       │  ← Title skeleton
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ [██████░░░░░░░]                                             │  ← Header skeleton
│ [████░░░░░]                                                 │
└─────────────────────────────────────────────────────────────┘

[████████████████████████████████████████████████████████]      ← Chunk card 1
[████████████████████████████████████████████████████████]      ← Chunk card 2
[████████████████████████████████████████████████████████]      ← Chunk card 3

┌─────────────────────────────────────────────────────────────┐
│ [██████░░░░]                                                │
│ [████] [████] [████] [████]                                 │  ← Stats skeletons
└─────────────────────────────────────────────────────────────┘
```

### Button Loading States

**Export Button:**
```
Before:  [↓ Export]
During:  [⊙ Exporting...] (spinning, disabled)
After:   [↓ Export]
```

**Regenerate Button:**
```
Before:  [↻ Regenerate]
During:  [⊙ Regenerating...] (spinning, disabled)
After:   [↻ Regenerate]
```

### Progress Indicators

**Chunk Header (during generation):**
```
┌─────────────────────────────────────────────────────────────┐
│ Analysis Progress: 67%                                       │
│ [████████████████████░░░░░░░░░░]                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 4️⃣ Error Handling

### Error Boundary Fallback

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ Something went wrong                                      │
├─────────────────────────────────────────────────────────────┤
│ An unexpected error occurred                                │
│ Error: Failed to fetch chunk dimensions                     │
│                                                              │
│ [Development only: Stack trace shown here]                  │
│                                                              │
│                                     [Try Again]              │
└─────────────────────────────────────────────────────────────┘
```

**Color Scheme:**
- Background: `bg-red-50`
- Border: `border-red-200`
- Title: `text-red-800`
- Message: `text-red-600`

### Toast Notifications

**Error Toast:**
```
┌────────────────────────────────────────┐
│ ✗ Regeneration failed:                 │
│   Network error - please try again     │
└────────────────────────────────────────┘
```

**Success Toast:**
```
┌────────────────────────────────────────┐
│ ✓ Data exported successfully!          │
└────────────────────────────────────────┘
```

**Info Toast:**
```
┌────────────────────────────────────────┐
│ ℹ️ Starting regeneration...            │
└────────────────────────────────────────┘
```

---

## 5️⃣ Spreadsheet Enhancements

### Export Button

**Before Click:**
```
[Filter: search text] [↓ Export]
```

**During Export:**
```
[Filter: search text] [⊙ Exporting...]

Toast: ℹ️ Preparing export...
```

**After Export:**
```
[Filter: search text] [↓ Export]

Toast: ✓ Data exported successfully!
File: chunk-DOC_001#C001-dimensions.csv downloaded
```

### Export Error

```
Toast: ✗ Export failed: Insufficient data
```

---

## 6️⃣ Color Reference Guide

### Background Colors

| Purpose | Class | Visual | Usage |
|---------|-------|--------|-------|
| High Confidence | `bg-green-50` | 🟢 Light Green | "Things We Know" section |
| Low Confidence | `bg-orange-50` | 🟠 Light Orange | "Things We Need to Know" |
| Neutral Info | `bg-white/30` | ⚪ Light Gray | Chunk metadata |
| Improved | `bg-green-100` | 🟢 Green | Run comparison improvements |
| Degraded | `bg-red-100` | 🔴 Red | Run comparison degradations |
| Neutral Change | `bg-yellow-100` | 🟡 Yellow | Run comparison neutral |
| Error | `bg-red-50` | 🔴 Light Red | Error boundaries |
| Info | `bg-blue-50` | 🔵 Light Blue | Info boxes |

### Border Colors

| Purpose | Class | Visual |
|---------|-------|--------|
| High Confidence | `border-green-200` | 🟢 |
| Low Confidence | `border-orange-200` | 🟠 |
| Error | `border-red-200` | 🔴 |
| Info | `border-blue-200` | 🔵 |

### Text Colors

| Purpose | Class | Visual |
|---------|-------|--------|
| High Confidence | `text-green-800` | 🟢 Dark Green |
| Low Confidence | `text-orange-800` | 🟠 Dark Orange |
| Error | `text-red-600` | 🔴 Red |
| Muted | `text-muted-foreground` | ⚫ Gray |

---

## 7️⃣ Icon Reference

| Icon | Component | Usage | Visual |
|------|-----------|-------|--------|
| CheckCircle | `<CheckCircle />` | High confidence, analyzed | ✓ |
| AlertCircle | `<AlertCircle />` | Low confidence, warnings | ⚠ |
| RefreshCw | `<RefreshCw />` | Regenerate button | ↻ |
| Loader2 | `<Loader2 className="animate-spin" />` | Loading spinner | ⊙ |
| Download | `<Download />` | Export button | ↓ |
| ExternalLink | `<ExternalLink />` | Detail view link | ↗ |
| ArrowRight | `<ArrowRight />` | List items | → |
| Hash | `<Hash />` | Metadata section | # |
| TrendingUp | `<TrendingUp />` | Improvements | ↗ |
| TrendingDown | `<TrendingDown />` | Degradations | ↘ |
| Minus | `<Minus />` | Neutral changes | − |

---

## 8️⃣ User Workflows

### Workflow 1: Compare Two Runs

```
Start: Chunk Dashboard
  ↓
[Click "Regenerate" on chunk]
  ↓
Modal opens
  ↓
[Select templates] (optional)
  ↓
[Click "Regenerate"]
  ↓
Toast: "Starting regeneration..."
  ↓
Wait for completion
  ↓
Toast: "Regeneration complete!"
  ↓
Page reloads with new data
  ↓
[Navigate to Run Comparison]
  ↓
Select Run 1 and Run 2
  ↓
View side-by-side comparison
  ↓
[Click "Changes Only"] (optional)
  ↓
Review highlighted differences
  ↓
[Click "Export Comparison"]
  ↓
CSV downloads
  ↓
End
```

### Workflow 2: Regenerate All Chunks

```
Start: Chunk Dashboard
  ↓
[Click "Regenerate All"]
  ↓
Modal opens
  ↓
[Select specific templates] (optional)
  ↓
[Click "Regenerate"]
  ↓
Toast: "Starting regeneration..."
  ↓
Progress indicator shows
  ↓
Wait for all chunks to complete
  ↓
Toast: "Regeneration complete! Created run: [id]..."
  ↓
Page auto-reloads
  ↓
All chunks updated with latest run
  ↓
End
```

### Workflow 3: Export Spreadsheet Data

```
Start: Chunk Dashboard
  ↓
[Click "Detail View" on chunk]
  ↓
Spreadsheet opens
  ↓
[Select preset view] (optional)
  Quality / Cost / Content / Risk
  ↓
[Filter rows] (optional)
  Type in search box
  ↓
[Click "Export"]
  ↓
Button shows loading: "Exporting..."
  ↓
Toast: "Preparing export..."
  ↓
CSV downloads
  ↓
Toast: "Data exported successfully!"
  ↓
End
```

---

## 9️⃣ Responsive Design

### Desktop (1440px+)
```
┌──────────────────────────────────────────────────────────────────┐
│ [Stat1]  [Stat2]  [Stat3]  [Stat4]    ← 4-column layout         │
└──────────────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1439px)
```
┌────────────────────────────────────┐
│ [Stat1]  [Stat2]                   │  ← 2-column layout
│ [Stat3]  [Stat4]                   │
└────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────────┐
│ [Stat1]          │  ← 1-column stack
│ [Stat2]          │
│ [Stat3]          │
│ [Stat4]          │
└──────────────────┘
```

---

## 🔟 Keyboard Shortcuts (Future Enhancement)

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + E` | Export current view |
| `Cmd/Ctrl + R` | Regenerate selected chunk |
| `Cmd/Ctrl + K` | Open command palette |
| `Esc` | Close modal |
| `Tab` | Navigate form fields |
| `Enter` | Submit modal |

---

## 📱 Mobile Considerations

### Touch Targets
- All buttons minimum 44px × 44px
- Increased spacing between clickable elements
- Larger modal tap areas

### Scroll Behavior
- Horizontal scroll for wide tables
- Sticky headers on scroll
- Pull-to-refresh for data reload (future)

### Performance
- Lazy load chunk cards
- Virtual scrolling for 100+ items
- Image/icon optimization

---

## 🎨 Design System Summary

### Spacing Scale
- `gap-2`: 0.5rem (8px)
- `gap-3`: 0.75rem (12px)
- `gap-4`: 1rem (16px)
- `py-6`: 1.5rem (24px)
- `px-4`: 1rem (16px)

### Typography Scale
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)

### Border Radius
- `rounded`: 0.25rem (4px)
- `rounded-md`: 0.375rem (6px)
- `rounded-lg`: 0.5rem (8px)

---

## 📝 Accessibility Notes

### Screen Readers
- All icons have `aria-label` or `title` attributes
- Buttons have descriptive text
- Loading states announced
- Error messages read aloud

### Keyboard Navigation
- Tab order logical and sequential
- Focus indicators visible
- Esc closes modals
- Enter submits forms

### Color Contrast
- All text meets WCAG AA standards
- Icons supplement color coding
- Patterns used in addition to color

---

**End of Visual Guide**

*For implementation details, see PROMPT-5-COMPLETION-SUMMARY.md*  
*For testing procedures, see test-workflow.md*

