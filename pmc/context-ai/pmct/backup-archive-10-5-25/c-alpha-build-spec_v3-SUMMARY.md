# Chunk Alpha Build Spec v3.1 - Quick Start Guide

**Main Specification:** `c-alpha-build-spec_v3.1.md`

**Version 3.1 Updates:**
- ✨ Added comprehensive Dashboard Wireframe Design Reference section
- ✨ Updated Build Prompt #4 with exact UI/UX patterns from existing dashboard
- ✨ Included detailed component structure, color coding, and visual hierarchy guidelines
- ✨ Explicit three-section card layout specification for all chunks

## What You Have

A complete, actionable build specification with:
- **1 Human Setup Section** with SQL you need to run
- **5 Sequential Build Prompts** you can cut/paste into Claude 4.5 Sonnet
- **Full code examples** embedded in each prompt
- **Clear completion criteria** for each phase

## Execution Path

### Phase 1: YOU Setup (30 minutes)

1. **Run SQL in Supabase** (Section: Prerequisites & Human Setup → Step 1)
   - Copy entire SQL block (~500 lines)
   - Paste into Supabase SQL Editor
   - Execute
   - Verify 5 tables created

2. **Configure API Keys** (Section: Prerequisites & Human Setup → Step 2)
   - Add Claude API key to `.env.local`
   - Create `src/lib/ai-config.ts`

3. **Install Dependencies** (Section: Prerequisites & Human Setup → Step 3)
   ```bash
   npm install @anthropic-ai/sdk tiktoken
   ```

### Phase 2: AI Build (5 Prompts in 200k Context Windows)

**Prompt #1: Database Schema & Infrastructure** (~2 hours)
- Creates TypeScript types for all entities
- Creates database services (CRUD operations)
- Adds "Chunks" button to dashboard
- **Deliverable:** Foundation ready for chunk extraction

**Prompt #2: Chunk Extraction Engine** (~4 hours)
- AI-powered chunk identification
- Extracts 4 types: Chapter, Instructional, CER, Example
- Enforces limits (15/5/10/5)
- Background job processing
- **Deliverable:** Chunks extracted and stored

**Prompt #3: AI Dimension Generation** (~4 hours)
- 5 prompt templates for different dimension types
- Claude Sonnet 4.5 integration
- Batch processing (3 chunks at a time)
- Cost tracking
- **Deliverable:** 60+ dimensions per chunk generated

**Prompt #4: Spreadsheet Interface** (~6 hours)
- Chunk dashboard with confidence indicators
- Full spreadsheet view (all dimensions)
- Column sorting & filtering
- Preset views (Quality, Cost, Content, Risk)
- **Deliverable:** All data visible and analyzable

**Prompt #5: Run Management & Polish** (~4 hours)
- Run comparison (side-by-side)
- Regeneration capability
- UI polish & error handling
- **Deliverable:** Production-ready module

## How to Use This Spec

### For Each Build Prompt:

1. **Open Claude 4.5 Sonnet** (200k context window in Cursor)
2. **Copy entire prompt section** from the spec
3. **Paste into Claude**
4. **Review generated code** before applying
5. **Test completion criteria** before moving to next prompt

### Key Features of This Spec:

✅ **Directive Language** - Tells AI exactly what to do and why  
✅ **Self-Contained Prompts** - Each prompt can run independently  
✅ **Code Included** - Full implementations embedded in prompts  
✅ **Modular Design** - Each prompt completes a discrete feature set  
✅ **Clear Success Criteria** - Know when each phase is done  

## Architecture Highlights

### Database Design
- **5 core tables:** chunks, chunk_dimensions, chunk_runs, prompt_templates, chunk_extraction_jobs
- **Normalized structure** for all chunk metadata
- **Unlimited run history** for prompt testing
- **Cost tracking** built-in

### Processing Flow
1. User clicks "Chunks" on completed document
2. Background job extracts chunks using AI
3. For each chunk, execute 5 prompt templates
4. Store all dimensions with confidence scores
5. Display in spreadsheet for evaluation

### AI Integration
- **Model:** Claude Sonnet 4.5
- **Response Format:** Structured JSON with schema validation
- **Batch Size:** 3 chunks parallel
- **Cost:** ~$0.35-$0.50 per document
- **Prompts:** 5 templates (content, task, CER, scenario, risk)

### UI Design
- **Dashboard:** Card view of all chunks with confidence indicators
- **Spreadsheet:** Full 60+ column view with sorting
- **Preset Views:** 4 optimized views for different analysis
- **Run Comparison:** Side-by-side diff of multiple runs

## Data Dictionary Integration

All 60+ dimensions from your CSV files are included:

**Previously Generated (8 dimensions):**
- Doc_ID, Doc_Title, Doc_Version, Source_Type, Source_URL, Author, Doc_Date, Primary_Category

**Mechanically Generated (17 dimensions):**
- Chunk_ID, Section_Heading, Page_Start/End, Char_Start/End, Token_Count, etc.

**AI Generated (35 dimensions):**
- Content: chunk_summary_1s, key_terms, audience, intent, tone_voice_tags, etc.
- Task: task_name, steps_json, expected_output, etc.
- CER: claim, evidence_snippets, reasoning_sketch, citations, etc.
- Scenario: scenario_type, problem_context, solution_action, etc.
- Risk: ip_sensitivity, pii_flag, compliance_flags, etc.

## Success Metrics

By the end of execution, you should be able to:

1. ✅ Click "Chunks" button on any categorized document
2. ✅ See extraction progress in real-time
3. ✅ View all chunks in dashboard with confidence scores
4. ✅ Open spreadsheet showing all 60+ dimensions
5. ✅ Sort/filter dimensions for analysis
6. ✅ Compare multiple generation runs
7. ✅ Regenerate specific chunks to test prompt variations
8. ✅ Track costs per document/chunk/dimension

## Estimated Timeline

- **Human Setup:** 30 minutes
- **Prompt #1 (Infrastructure):** 2 hours
- **Prompt #2 (Extraction):** 4 hours
- **Prompt #3 (AI Generation):** 4 hours
- **Prompt #4 (Spreadsheet):** 6 hours
- **Prompt #5 (Polish):** 4 hours

**Total Development Time:** ~20 hours  
**Total Calendar Time:** 2-3 days

## Support & Iteration

### Testing Your Prompts
After completing the build, you can:
1. Edit prompt templates in markdown files
2. Push to database with utility
3. Regenerate chunks to test new prompts
4. Compare results across runs

### Future Enhancements
This spec focuses on the MVP testing environment. Future iterations could add:
- Manual dimension editing
- Bulk regeneration controls
- Advanced filtering
- Export to training data format
- Prompt A/B testing framework

## Troubleshooting

**If extraction fails:**
- Check Anthropic API key in `.env.local`
- Verify document has content (not just metadata)
- Check Supabase connection
- Review chunk_extraction_jobs table for error messages

**If dimension generation fails:**
- Check prompt_templates table has 5 active templates
- Verify Claude API quota/limits
- Check chunk_dimensions table for partial data
- Review chunk_runs table for error details

**If spreadsheet doesn't load:**
- Check browser console for errors
- Verify chunk_dimensions data exists for run
- Test with smaller documents first
- Check network tab for API failures

## Next Steps

1. **Read Prerequisites section** in main spec
2. **Run SQL setup** in Supabase
3. **Configure API keys**
4. **Execute Prompt #1** in Claude 4.5 Sonnet
5. **Test and verify** each phase before proceeding

---

**Questions or Issues?**
Refer back to the main specification for detailed explanations, code examples, and architectural decisions.

**Ready to Build?**
Start with the Prerequisites section and follow the prompts sequentially!

