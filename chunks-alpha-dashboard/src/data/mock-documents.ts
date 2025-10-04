import { DocumentSummary } from '../store/document-store';

export const mockEssayReviewDocument: DocumentSummary = {
  id: 'doc-001',
  filename: 'Essay-Review-Guidelines.pdf',
  title: 'Essay Review Guidelines',
  description: 'Comprehensive guidelines for reviewing and evaluating essays, including criteria, standards, and best practices for consistent assessment.',
  uploadDate: '2024-12-20',
  totalPages: 12,
  totalWords: 3200,
  documentType: 'Academic Guidelines',
  analysisStatus: 'completed',
  overallInsights: {
    mainPurpose: 'Provide standardized criteria and methodology for essay evaluation and feedback',
    keyTopics: ['Essay Structure', 'Content Quality', 'Grammar Assessment', 'Feedback Methodology', 'Grading Rubrics'],
    documentStructure: ['Title Page', 'Introduction', 'Review Criteria', 'Scoring Guidelines', 'Example Assessments', 'Best Practices'],
    targetAudience: 'Educators, Teaching Assistants, Writing Instructors',
    actionItems: ['Implement standardized rubric', 'Train reviewers on criteria', 'Establish feedback protocols', 'Create example assessments']
  },
  chunks: [
    {
      id: 'chunk-001',
      chunkNumber: 1,
      title: 'Document Header and Introduction',
      content: 'Essay Review Guidelines - Version 2.3\nWow Writing Workshop\nComprehensive Essay Evaluation Framework\n\nThis document provides standardized guidelines for reviewing student essays, ensuring consistent and fair evaluation across all reviewers.',
      startLine: 1,
      endLine: 8,
      pageNumber: 1,
      category: 'header',
      isAnalyzed: true,
      metadata: {
        wordCount: 28,
        characterCount: 167,
        estimatedReadingTime: 12,
        complexity: 'low'
      },
      aiFindings: {
        thingsWeKnow: [
          {
            id: 'finding-001',
            category: 'standard',
            finding: 'Document establishes version control (v2.3) indicating iterative improvement process',
            confidence: 95,
            evidence: ['Version 2.3 explicitly stated', 'Suggests previous versions existed']
          },
          {
            id: 'finding-002',
            category: 'process',
            finding: 'Organization (Wow Writing Workshop) has formal evaluation framework',
            confidence: 90,
            evidence: ['Comprehensive Essay Evaluation Framework title', 'Standardized guidelines mentioned']
          },
          {
            id: 'finding-003',
            category: 'requirement',
            finding: 'Consistency and fairness are primary evaluation goals',
            confidence: 85,
            evidence: ['consistent and fair evaluation', 'across all reviewers']
          }
        ],
        thingsWeNeedToKnow: [
          'What changed between version 2.2 and 2.3?',
          'How many reviewers typically use these guidelines?',
          'What training is provided to new reviewers?',
          'How often are guidelines updated?'
        ],
        semanticTags: ['guidelines', 'evaluation', 'standardization', 'consistency', 'framework'],
        ontologicalCategories: ['Educational Document', 'Assessment Tool', 'Quality Assurance'],
        keyEntities: ['Wow Writing Workshop', 'Essay Review Guidelines', 'Version 2.3'],
        actionableItems: ['Review version history', 'Identify reviewer training needs', 'Establish update schedule']
      }
    },
    {
      id: 'chunk-002',
      chunkNumber: 2,
      title: 'Core Assessment Criteria',
      content: 'PRIMARY EVALUATION CRITERIA\n\n1. CONTENT QUALITY (40% weight)\n- Thesis clarity and strength\n- Supporting evidence quality\n- Argument development\n- Topic knowledge demonstration\n- Original insights and analysis\n\n2. ORGANIZATION & STRUCTURE (25% weight)\n- Introduction effectiveness\n- Logical flow between paragraphs\n- Transition quality\n- Conclusion strength\n- Overall essay architecture',
      startLine: 15,
      endLine: 35,
      pageNumber: 2,
      category: 'criteria',
      isAnalyzed: true,
      metadata: {
        wordCount: 65,
        characterCount: 412,
        estimatedReadingTime: 28,
        complexity: 'medium'
      },
      aiFindings: {
        thingsWeKnow: [
          {
            id: 'finding-004',
            category: 'standard',
            finding: 'Weighted scoring system with Content Quality as highest priority (40%)',
            confidence: 100,
            evidence: ['40% weight explicitly stated', 'Primary criteria designation']
          },
          {
            id: 'finding-005',
            category: 'criteria',
            finding: 'Five-point content assessment framework covering thesis to analysis',
            confidence: 95,
            evidence: ['Five distinct bullet points under content', 'Comprehensive coverage from thesis to insights']
          },
          {
            id: 'finding-006',
            category: 'standard',
            finding: 'Organization weighted at 25% indicating structured writing importance',
            confidence: 100,
            evidence: ['25% weight clearly stated', 'Detailed structural elements listed']
          }
        ],
        thingsWeNeedToKnow: [
          'What are the remaining criteria that make up the other 35%?',
          'How is each sub-criterion scored individually?',
          'Are there minimum thresholds for passing grades?',
          'How do reviewers handle essays that excel in one area but fail in another?'
        ],
        semanticTags: ['criteria', 'weighting', 'content', 'organization', 'structure', 'thesis', 'evidence'],
        ontologicalCategories: ['Assessment Rubric', 'Scoring Framework', 'Quality Metrics'],
        keyEntities: ['Content Quality', 'Organization & Structure', 'Thesis', 'Supporting Evidence'],
        actionableItems: ['Define remaining 35% criteria', 'Create scoring scales for each criterion', 'Develop threshold guidelines']
      }
    },
    {
      id: 'chunk-003',
      chunkNumber: 3,
      title: 'Writing Mechanics and Style Guidelines',
      content: '3. WRITING MECHANICS (20% weight)\n- Grammar accuracy\n- Spelling and punctuation\n- Sentence variety and structure\n- Word choice and vocabulary\n- Technical writing conventions\n\n4. STYLE & VOICE (15% weight)\n- Appropriate tone for audience\n- Engaging writing style\n- Voice consistency\n- Clarity of expression\n- Professional presentation\n\nSCORING SCALE: Each criterion uses a 4-point scale\n4 = Exceptional (90-100%)\n3 = Proficient (80-89%)\n2 = Developing (70-79%)\n1 = Beginning (Below 70%)',
      startLine: 36,
      endLine: 55,
      pageNumber: 3,
      category: 'criteria',
      isAnalyzed: true,
      metadata: {
        wordCount: 89,
        characterCount: 578,
        estimatedReadingTime: 38,
        complexity: 'medium'
      },
      aiFindings: {
        thingsWeKnow: [
          {
            id: 'finding-007',
            category: 'standard',
            finding: 'Complete 100% weighting system: Content(40%) + Organization(25%) + Mechanics(20%) + Style(15%)',
            confidence: 100,
            evidence: ['All four categories sum to 100%', 'Explicit percentage weights provided']
          },
          {
            id: 'finding-008',
            category: 'standard',
            finding: 'Four-point scoring scale with grade percentage equivalents',
            confidence: 100,
            evidence: ['4-point scale explicitly defined', 'Percentage ranges for each level']
          },
          {
            id: 'finding-009',
            category: 'criteria',
            finding: 'Mechanics focuses on technical accuracy while Style emphasizes communication effectiveness',
            confidence: 90,
            evidence: ['Grammar/spelling vs tone/voice distinction', 'Technical vs communication focus']
          }
        ],
        thingsWeNeedToKnow: [
          'How do reviewers convert 4-point scores to final grades?',
          'What constitutes "exceptional" vs "proficient" in each category?',
          'Are there specific examples of each performance level?',
          'How are borderline scores (e.g., 2.5) handled?'
        ],
        semanticTags: ['mechanics', 'style', 'voice', 'scoring', 'scale', 'grammar', 'tone'],
        ontologicalCategories: ['Scoring System', 'Writing Assessment', 'Performance Levels'],
        keyEntities: ['Writing Mechanics', 'Style & Voice', '4-point scale', 'Grade Percentages'],
        actionableItems: ['Create performance level examples', 'Define borderline score protocols', 'Develop conversion formulas']
      }
    },
    {
      id: 'chunk-004',
      chunkNumber: 4,
      title: 'Feedback Guidelines and Best Practices',
      content: 'PROVIDING EFFECTIVE FEEDBACK\n\nConstructive Feedback Principles:\n• Focus on specific, actionable improvements\n• Balance strengths with areas for growth\n• Use concrete examples from the essay\n• Maintain encouraging but honest tone\n• Prioritize 2-3 key improvement areas\n\nFeedback Structure:\n1. Opening positive comment\n2. Specific strengths identification\n3. Priority improvement areas\n4. Concrete suggestions for revision\n5. Encouraging closing statement\n\nAVOID: Generic comments, overwhelming criticism, personal opinions unrelated to criteria',
      startLine: 65,
      endLine: 85,
      pageNumber: 4,
      category: 'instruction',
      isAnalyzed: true,
      metadata: {
        wordCount: 92,
        characterCount: 612,
        estimatedReadingTime: 39,
        complexity: 'medium'
      },
      aiFindings: {
        thingsWeKnow: [
          {
            id: 'finding-010',
            category: 'process',
            finding: 'Five-step structured feedback methodology with positive framing',
            confidence: 95,
            evidence: ['Five numbered steps provided', 'Opens and closes with positive elements']
          },
          {
            id: 'finding-011',
            category: 'guideline',
            finding: 'Feedback should be limited to 2-3 key improvement areas to avoid overwhelming students',
            confidence: 90,
            evidence: ['Prioritize 2-3 key improvement areas', 'Avoid overwhelming criticism']
          },
          {
            id: 'finding-012',
            category: 'standard',
            finding: 'Evidence-based feedback required using concrete examples from student work',
            confidence: 85,
            evidence: ['Use concrete examples from the essay', 'Specific, actionable improvements']
          }
        ],
        thingsWeNeedToKnow: [
          'What training do reviewers receive on feedback writing?',
          'Are there example feedback comments for different performance levels?',
          'How long should feedback comments typically be?',
          'Is there a review process for feedback quality?'
        ],
        semanticTags: ['feedback', 'constructive', 'actionable', 'specific', 'encouraging', 'structure'],
        ontologicalCategories: ['Feedback Methodology', 'Communication Guidelines', 'Best Practices'],
        keyEntities: ['Constructive Feedback', 'Feedback Structure', 'Improvement Areas'],
        actionableItems: ['Develop feedback templates', 'Create example comments library', 'Establish feedback quality review']
      }
    },
    {
      id: 'chunk-005',
      chunkNumber: 5,
      title: 'Common Issues and Red Flags',
      content: 'COMMON ESSAY PROBLEMS TO IDENTIFY\n\nStructural Issues:\n• Weak or missing thesis statement\n• Poor paragraph transitions\n• Inadequate introduction or conclusion\n• Illogical argument sequence\n\nContent Concerns:\n• Insufficient supporting evidence\n• Plagiarism indicators\n• Off-topic content\n• Factual inaccuracies\n• Superficial analysis\n\nMechanical Problems:\n• Consistent grammar errors\n• Poor sentence construction\n• Inappropriate register/tone\n• Formatting inconsistencies\n\nRED FLAGS requiring immediate attention:\n⚠️ Suspected plagiarism\n⚠️ Inappropriate content\n⚠️ Completely off-topic submission',
      startLine: 95,
      endLine: 120,
      pageNumber: 5,
      category: 'instruction',
      isAnalyzed: false,
      metadata: {
        wordCount: 108,
        characterCount: 723,
        estimatedReadingTime: 46,
        complexity: 'high'
      },
      aiFindings: {
        thingsWeKnow: [
          {
            id: 'finding-013',
            category: 'guideline',
            finding: 'Three-tier problem identification system: Structural, Content, and Mechanical',
            confidence: 100,
            evidence: ['Three distinct categories listed', 'Clear categorization of problem types']
          },
          {
            id: 'finding-014',
            category: 'process',
            finding: 'Red flag system for issues requiring immediate escalation or attention',
            confidence: 95,
            evidence: ['RED FLAGS section with warning symbols', 'requiring immediate attention']
          }
        ],
        thingsWeNeedToKnow: [
          'What is the escalation process for red flag issues?',
          'Who should be contacted when plagiarism is suspected?',
          'Are there specific tools recommended for plagiarism detection?',
          'What constitutes "inappropriate content" in this context?',
          'How should reviewers document red flag incidents?'
        ],
        semanticTags: ['problems', 'issues', 'red flags', 'plagiarism', 'escalation', 'structural', 'content'],
        ontologicalCategories: ['Problem Identification', 'Quality Control', 'Risk Management'],
        keyEntities: ['Structural Issues', 'Content Concerns', 'Red Flags', 'Plagiarism'],
        actionableItems: ['Define escalation procedures', 'Create plagiarism detection protocol', 'Establish incident documentation system']
      }
    }
  ]
};