import { Process } from '../store/process-store';

export const mockProcess: Process = {
  id: 'proc-001',
  name: 'Custom Software Development Process',
  type: 'Development Process',
  estimatedDuration: 480, // 8 hours
  description: 'Our proprietary software development methodology that combines agile principles with specialized quality assurance protocols.',
  steps: [
    {
      id: 'step-001',
      number: 1,
      title: 'Client Requirements Analysis',
      description: 'Deep-dive analysis using our proprietary stakeholder mapping and needs assessment framework',
      requiredInputs: ['Client brief', 'Stakeholder list', 'Budget constraints', 'Timeline requirements'],
      expectedOutputs: ['Requirements document', 'Stakeholder map', 'Technical feasibility report'],
      decisionPoints: [
        {
          id: 'dp-001',
          condition: 'Is budget sufficient for full feature set?',
          truePath: 'Proceed to full development scope',
          falsePath: 'Create MVP feature prioritization',
          type: 'boolean'
        }
      ],
      isValidated: true,
      isProprietary: true,
      estimatedDuration: 120
    },
    {
      id: 'step-002',
      number: 2,
      title: 'Architecture Design & Planning',
      description: 'Create scalable architecture using our multi-tier design methodology with performance optimization',
      requiredInputs: ['Requirements document', 'Technology constraints', 'Scalability requirements'],
      expectedOutputs: ['System architecture diagram', 'Technology stack selection', 'Performance benchmarks'],
      decisionPoints: [
        {
          id: 'dp-002',
          condition: 'Expected user load > 10,000 concurrent users?',
          truePath: 'Implement distributed architecture',
          falsePath: 'Use standard monolithic approach',
          type: 'threshold'
        }
      ],
      isValidated: true,
      isProprietary: true,
      estimatedDuration: 90
    },
    {
      id: 'step-003',
      number: 3,
      title: 'Rapid Prototyping Phase',
      description: 'Build functional prototype using our accelerated development framework and component library',
      requiredInputs: ['Architecture design', 'UI mockups', 'Core feature list'],
      expectedOutputs: ['Working prototype', 'User feedback', 'Technical validation'],
      decisionPoints: [
        {
          id: 'dp-003',
          condition: 'Does prototype meet performance requirements?',
          truePath: 'Proceed to full development',
          falsePath: 'Refactor architecture and retry',
          type: 'boolean'
        }
      ],
      isValidated: false,
      isProprietary: true,
      estimatedDuration: 150
    },
    {
      id: 'step-004',
      number: 4,
      title: 'Quality Assurance Integration',
      description: 'Implement our continuous testing methodology with automated regression and performance monitoring',
      requiredInputs: ['Prototype code', 'Test scenarios', 'Performance baselines'],
      expectedOutputs: ['Test suite', 'QA report', 'Performance metrics'],
      decisionPoints: [
        {
          id: 'dp-004',
          condition: 'Code coverage > 90%?',
          truePath: 'Approve for production',
          falsePath: 'Increase test coverage',
          type: 'threshold'
        }
      ],
      isValidated: false,
      isProprietary: true,
      estimatedDuration: 120
    }
  ],
  proprietaryElements: [
    {
      id: 'pe-001',
      stepId: 'step-001',
      element: 'Stakeholder Mapping Framework',
      uniqueValue: 'Proprietary algorithm that identifies hidden stakeholders and maps influence networks',
      competitiveAdvantage: 'Reduces project scope creep by 40% and improves stakeholder satisfaction by 60%',
      tradeSecretLevel: 'high'
    },
    {
      id: 'pe-002',
      stepId: 'step-002',
      element: 'Multi-tier Performance Optimization',
      uniqueValue: 'Patented approach to predictive scaling based on user behavior patterns',
      competitiveAdvantage: 'Achieves 3x better performance than industry standard with 25% lower infrastructure costs',
      tradeSecretLevel: 'high'
    },
    {
      id: 'pe-003',
      stepId: 'step-003',
      element: 'Accelerated Component Library',
      uniqueValue: 'Pre-built, industry-specific components that adapt to business logic automatically',
      competitiveAdvantage: 'Reduces development time by 50% while maintaining customization flexibility',
      tradeSecretLevel: 'medium'
    },
    {
      id: 'pe-004',
      stepId: 'step-004',
      element: 'Continuous Testing Methodology',
      uniqueValue: 'AI-driven test case generation based on user behavior prediction',
      competitiveAdvantage: 'Catches 95% of bugs before deployment vs industry average of 70%',
      tradeSecretLevel: 'high'
    }
  ],
  successMetrics: [
    {
      id: 'sm-001',
      name: 'Development Velocity',
      description: 'Story points delivered per sprint',
      threshold: 25,
      unit: 'points/sprint',
      type: 'efficiency',
      currentValue: 28
    },
    {
      id: 'sm-002',
      name: 'Code Quality Score',
      description: 'Combination of test coverage, complexity, and maintainability metrics',
      threshold: 85,
      unit: 'score (0-100)',
      type: 'quality',
      currentValue: 92
    },
    {
      id: 'sm-003',
      name: 'Time to Market',
      description: 'From requirements to production deployment',
      threshold: 120,
      unit: 'days',
      type: 'time',
      currentValue: 95
    },
    {
      id: 'sm-004',
      name: 'Client Satisfaction',
      description: 'Post-delivery client satisfaction rating',
      threshold: 8.5,
      unit: 'rating (1-10)',
      type: 'quality',
      currentValue: 9.2
    },
    {
      id: 'sm-005',
      name: 'Cost Efficiency',
      description: 'Actual vs estimated development cost variance',
      threshold: 10,
      unit: '% over budget',
      type: 'cost',
      currentValue: 5
    }
  ],
  variations: [
    {
      id: 'var-001',
      name: 'Enterprise Scale',
      description: 'For large enterprise clients with complex compliance requirements',
      scenario: 'When dealing with Fortune 500 companies or organizations with strict regulatory requirements',
      modifiedSteps: ['step-001', 'step-002'],
      additionalSteps: [
        {
          id: 'step-005',
          number: 5,
          title: 'Compliance & Security Audit',
          description: 'Comprehensive security review and compliance validation for enterprise standards',
          requiredInputs: ['Security requirements', 'Compliance frameworks', 'Risk assessment'],
          expectedOutputs: ['Security report', 'Compliance checklist', 'Risk mitigation plan'],
          decisionPoints: [],
          isValidated: false,
          isProprietary: true,
          estimatedDuration: 60
        }
      ]
    },
    {
      id: 'var-002',
      name: 'MVP Fast Track',
      description: 'Accelerated process for startups and proof-of-concept projects',
      scenario: 'When client needs rapid market validation with minimal viable product',
      modifiedSteps: ['step-003'],
      additionalSteps: []
    }
  ],
  commonMistakes: [
    'Skipping stakeholder mapping in rush to start development',
    'Underestimating scalability requirements during architecture phase',
    'Not involving QA team early enough in the development cycle',
    'Failing to establish clear success metrics before project start',
    'Not documenting proprietary methodologies for knowledge transfer'
  ],
  dependencies: {
    'step-002': ['step-001'],
    'step-003': ['step-001', 'step-002'],
    'step-004': ['step-003']
  }
};