import { encoding_for_model } from 'tiktoken';
import { DocumentStructure, Section } from './types';

export class TextAnalyzer {
  private tokenizer: any;

  constructor() {
    // Initialize tiktoken for Claude
    this.tokenizer = encoding_for_model('gpt-4'); // Close enough for token counting
  }

  /**
   * Count tokens in text
   */
  countTokens(text: string): number {
    const tokens = this.tokenizer.encode(text);
    return tokens.length;
  }

  /**
   * Detect document structure (headings, sections)
   */
  detectStructure(content: string): DocumentStructure {
    const sections: Section[] = [];
    
    // Regex patterns for common heading formats
    const patterns = [
      /^(Chapter|CHAPTER)\s+(\d+|[IVXLCDM]+)[\s:\-]+(.*?)$/gm,  // Chapter X: Title
      /^(Section|SECTION)\s+(\d+|[IVXLCDM]+)[\s:\-]+(.*?)$/gm,   // Section X: Title
      /^#{1,6}\s+(.+)$/gm,  // Markdown headings
      /^(.+)\n[=\-]{3,}$/gm,  // Underlined headings
      /^(\d+\.)\s+(.+)$/gm,  // 1. Numbered headings
    ];

    // Detect sections using patterns
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        sections.push({
          heading: match[0].trim(),
          level: this.detectHeadingLevel(match[0]),
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    });

    // Sort by position
    sections.sort((a, b) => a.startIndex - b.startIndex);

    // Calculate section boundaries
    sections.forEach((section, index) => {
      if (index < sections.length - 1) {
        section.endIndex = sections[index + 1].startIndex;
      } else {
        section.endIndex = content.length;
      }
    });

    return {
      totalChars: content.length,
      totalTokens: this.countTokens(content),
      sections,
    };
  }

  private detectHeadingLevel(heading: string): number {
    if (heading.startsWith('# ')) return 1;
    if (heading.startsWith('## ')) return 2;
    if (heading.startsWith('### ')) return 3;
    if (heading.match(/^(Chapter|CHAPTER)/)) return 1;
    if (heading.match(/^(Section|SECTION)/)) return 2;
    return 3;
  }

  /**
   * Detect instructional content patterns
   */
  detectInstructionalPatterns(text: string): boolean {
    const patterns = [
      /\b(how to|procedure|steps?|instructions?|guide|tutorial)\b/i,
      /^\s*\d+\.\s+/m,  // Numbered lists
      /^\s*[-*]\s+/m,   // Bulleted lists
      /\b(first|second|third|next|then|finally)\b/i,
    ];

    return patterns.some(pattern => pattern.test(text));
  }

  /**
   * Detect CER (Claim-Evidence-Reasoning) patterns
   */
  detectCERPatterns(text: string): boolean {
    const patterns = [
      /\b(claim|assert|argue|demonstrate|prove)\b/i,
      /\b(evidence|data|research|study|findings|results)\b/i,
      /\b(because|therefore|thus|hence|consequently)\b/i,
      /\b(shows that|indicates that|suggests that)\b/i,
      /\[\d+\]|\(\d{4}\)/,  // Citations [1] or (2024)
    ];

    return patterns.filter(pattern => pattern.test(text)).length >= 2;
  }

  /**
   * Detect example/scenario patterns
   */
  detectExamplePatterns(text: string): boolean {
    const patterns = [
      /\b(for example|for instance|case study|scenario)\b/i,
      /\b(imagine|consider|suppose)\b/i,
      /\b(customer|client|user) (said|asked|wanted)\b/i,
      /[""](.+?)[""].*said/i,  // Quoted dialogue
    ];

    return patterns.some(pattern => pattern.test(text));
  }
}

