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
    return `You are a document analysis expert. Your task is to identify and extract distinct chunks from a document for LoRA training data creation.

DOCUMENT TITLE: ${title}
DOCUMENT CATEGORY: ${category}
DOCUMENT LENGTH: ${structure.totalChars} characters, ${structure.totalTokens} tokens
SECTIONS DETECTED: ${structure.sections.length}

CHUNK TYPES TO IDENTIFY:

1. **Chapter_Sequential**: Top-level structural sections (chapters, major sections)
   - Look for: "Chapter X", "Section X", major headings
   - Maximum to extract: 15 most significant chapters

2. **Instructional_Unit**: Step-by-step procedures or tasks
   - Look for: numbered steps, how-to content, procedures, checklists
   - Maximum to extract: 5 most valuable instructional units

3. **CER** (Claim-Evidence-Reasoning): Arguments with supporting evidence
   - Look for: claims with citations, research findings, data-backed assertions
   - Maximum to extract: 10 most important claims

4. **Example_Scenario**: Case studies, examples, stories, dialogues
   - Look for: "for example", case studies, customer stories, scenarios
   - Maximum to extract: 5 most illustrative examples

DOCUMENT CONTENT:
---
${content.substring(0, 50000)}  // Limit to first 50k chars to stay within context
${content.length > 50000 ? '\n... (document truncated)' : ''}
---

TASK: Analyze this document and identify ALL candidate chunks. For each chunk, return:

1. chunk_type: The type (Chapter_Sequential, Instructional_Unit, CER, or Example_Scenario)
2. confidence: Your confidence score (0.0-1.0)
3. start_text: First 50 characters where chunk begins
4. end_text: Last 50 characters where chunk ends
5. section_heading: Heading/title of this chunk (if any)
6. reasoning: Brief explanation of why this qualifies as this chunk type

Return your analysis as a JSON array. Be thorough - identify MORE candidates than the limits; we'll rank and select the best ones.

Example format:
[
  {
    "chunk_type": "Instructional_Unit",
    "confidence": 0.95,
    "start_text": "Step 1: Open the categorization module...",
    "end_text": "...and click Submit to complete the process.",
    "section_heading": "Document Categorization Workflow",
    "reasoning": "Clear numbered steps with procedural instructions"
  }
]

Return ONLY valid JSON, no other text.`;
  }

  private parseExtractionResponse(response: string, fullContent: string): ExtractionCandidate[] {
    try {
      // Extract JSON from response (in case AI added extra text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Map to ExtractionCandidate with actual character positions
      return parsed.map((item: any) => {
        const startIndex = fullContent.indexOf(item.start_text);
        const endIndex = fullContent.lastIndexOf(item.end_text) + item.end_text.length;

        return {
          type: item.chunk_type,
          confidence: item.confidence,
          startIndex: startIndex >= 0 ? startIndex : 0,
          endIndex: endIndex > startIndex ? endIndex : startIndex + 1000,
          sectionHeading: item.section_heading,
          reasoning: item.reasoning,
        };
      });
    } catch (error) {
      console.error('Failed to parse extraction response:', error);
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

