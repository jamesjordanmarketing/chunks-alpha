import Anthropic from '@anthropic-ai/sdk';
import { AI_CONFIG } from '../ai-config';
import { ExtractionCandidate, DocumentStructure } from './types';
import { TextAnalyzer } from './text-analyzer';

export class AIChunker {
  private client: Anthropic;
  private analyzer: TextAnalyzer;

  constructor() {
    this.client = new Anthropic({
      apiKey: AI_CONFIG.apiKey,
    });
    this.analyzer = new TextAnalyzer();
  }

  /**
   * Extract chunks from document using AI
   */
  async extractChunks(params: {
    documentId: string;
    documentTitle: string;
    documentContent: string;
    primaryCategory: string;
  }): Promise<ExtractionCandidate[]> {
    const { documentTitle, documentContent, primaryCategory } = params;

    // First, detect document structure
    const structure = this.analyzer.detectStructure(documentContent);

    // Call AI to identify chunk candidates
    const prompt = this.buildExtractionPrompt(documentTitle, documentContent, primaryCategory, structure);

    const message = await this.client.messages.create({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: 0.3,  // Lower temperature for more consistent extraction
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    // Parse AI response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const candidates = this.parseExtractionResponse(responseText, documentContent);

    // Apply extraction limits
    const filtered = this.applyExtractionLimits(candidates);

    return filtered;
  }

  private buildExtractionPrompt(
    title: string,
    content: string,
    category: string,
    structure: DocumentStructure
  ): string {
    // Split content into lines for better boundary detection
    const lines = content.split('\n');
    
    return `You are a document analysis expert. Your task is to identify and extract distinct chunks from a document for LoRA training data creation.

DOCUMENT TITLE: ${title}
DOCUMENT CATEGORY: ${category}
DOCUMENT LENGTH: ${structure.totalChars} characters, ${structure.totalTokens} tokens, ${lines.length} lines
SECTIONS DETECTED: ${structure.sections.length}

CHUNK TYPES TO IDENTIFY:

1. **Chapter_Sequential**: Top-level structural sections (chapters, major sections)
   - Look for: "Chapter X", "Section X", major headings
   - Target: 12-15 most significant chapters (aim for comprehensive coverage)

2. **Instructional_Unit**: Step-by-step procedures or tasks
   - Look for: numbered steps, how-to content, procedures, checklists
   - Target: 5-8 most valuable instructional units

3. **CER** (Claim-Evidence-Reasoning): Arguments with supporting evidence
   - Look for: claims with citations, research findings, data-backed assertions
   - Target: 8-12 most important claims

4. **Example_Scenario**: Case studies, examples, stories, dialogues
   - Look for: "for example", case studies, customer stories, scenarios
   - Target: 5-8 most illustrative examples

IMPORTANT: The document has ${lines.length} lines total. Use LINE NUMBERS for precise boundaries.

DOCUMENT CONTENT:
---
${content}
---

TASK: Analyze this COMPLETE document and identify ALL candidate chunks. For each chunk, return:

1. chunk_type: The type (Chapter_Sequential, Instructional_Unit, CER, or Example_Scenario)
2. confidence: Your confidence score (0.0-1.0)
3. start_line: Line number where chunk begins (1-indexed)
4. end_line: Line number where chunk ends (inclusive)
5. section_heading: Heading/title of this chunk (if any)
6. reasoning: Brief explanation of why this qualifies as this chunk type

Return your analysis as a JSON array. Be thorough - scan the ENTIRE document and identify MORE candidates than the targets; we'll rank and select the best ones.

Example format:
[
  {
    "chunk_type": "Instructional_Unit",
    "confidence": 0.95,
    "start_line": 42,
    "end_line": 89,
    "section_heading": "Document Categorization Workflow",
    "reasoning": "Clear numbered steps with procedural instructions from line 42 to 89"
  },
  {
    "chunk_type": "Chapter_Sequential",
    "confidence": 0.90,
    "start_line": 120,
    "end_line": 245,
    "section_heading": "Stage 2: Category Selection",
    "reasoning": "Major section covering the category selection process"
  }
]

CRITICAL: Ensure chunks:
- Are substantial (at least 500 characters / ~10 lines)
- Don't overlap
- Cover different parts of the document
- Have clear start and end boundaries

Return ONLY valid JSON, no other text.`;
  }

  private parseExtractionResponse(response: string, fullContent: string): ExtractionCandidate[] {
    try {
      // Extract JSON from response (in case AI added extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No JSON array found in AI response');
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Split content into lines for line-based indexing
      const lines = fullContent.split('\n');
      
      // Map to ExtractionCandidate with actual character positions
      return parsed.map((item: any, index: number) => {
        // Convert line numbers (1-indexed) to character positions (0-indexed)
        const startLine = Math.max(0, (item.start_line || 1) - 1); // Convert to 0-indexed
        const endLine = Math.min(lines.length - 1, (item.end_line || startLine + 1) - 1); // Convert to 0-indexed
        
        // Calculate character positions
        let startIndex = 0;
        for (let i = 0; i < startLine; i++) {
          startIndex += lines[i].length + 1; // +1 for newline
        }
        
        let endIndex = startIndex;
        for (let i = startLine; i <= endLine; i++) {
          endIndex += lines[i].length + 1; // +1 for newline
        }
        
        // Validate chunk size (minimum 100 characters)
        const chunkSize = endIndex - startIndex;
        if (chunkSize < 100) {
          console.warn(`Chunk ${index + 1} too small (${chunkSize} chars), expanding to 500 chars minimum`);
          endIndex = Math.min(fullContent.length, startIndex + 500);
        }
        
        // Ensure we don't exceed document bounds
        startIndex = Math.max(0, Math.min(startIndex, fullContent.length - 1));
        endIndex = Math.max(startIndex + 100, Math.min(endIndex, fullContent.length));

        return {
          type: item.chunk_type,
          confidence: item.confidence || 0.5,
          startIndex,
          endIndex,
          sectionHeading: item.section_heading,
          reasoning: item.reasoning || 'No reasoning provided',
        };
      }).filter(candidate => {
        // Filter out invalid candidates
        const isValid = candidate.endIndex > candidate.startIndex && 
                       (candidate.endIndex - candidate.startIndex) >= 100;
        if (!isValid) {
          console.warn(`Filtering out invalid chunk: start=${candidate.startIndex}, end=${candidate.endIndex}`);
        }
        return isValid;
      });
    } catch (error) {
      console.error('Failed to parse extraction response:', error);
      console.error('Response was:', response.substring(0, 500));
      return [];
    }
  }

  private applyExtractionLimits(candidates: ExtractionCandidate[]): ExtractionCandidate[] {
    const limits = {
      'Chapter_Sequential': 15,
      'Instructional_Unit': 5,
      'CER': 10,
      'Example_Scenario': 5,
    };

    const filtered: ExtractionCandidate[] = [];

    Object.entries(limits).forEach(([type, limit]) => {
      const ofType = candidates
        .filter(c => c.type === type)
        .sort((a, b) => b.confidence - a.confidence)  // Sort by confidence descending
        .slice(0, limit);
      
      filtered.push(...ofType);
    });

    // Sort by position in document
    return filtered.sort((a, b) => a.startIndex - b.startIndex);
  }
}

