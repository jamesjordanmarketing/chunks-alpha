import { WorkflowCompleteClient } from '../client/WorkflowCompleteClient'
import { tagDimensions } from '../../data/mock-data'
import { documentService } from '../../lib/database'

interface Props {
  documentId: string
  workflowId?: string
}

/**
 * Fetch document from database
 */
async function getDocument(documentId: string) {
  try {
    const document = await documentService.getById(documentId)
    return document
  } catch (error) {
    console.error('Error fetching document:', error)
    throw new Error('Document not found')
  }
}

/**
 * Fetch workflow data from API
 * If workflowId is provided, fetches from normalized tables
 */
async function getWorkflowData(workflowId?: string) {
  if (!workflowId) {
    return null
  }

  try {
    // Note: In server component, we use the service layer directly since we're on the server
    const { workflowService } = await import('../../lib/database')
    
    const workflowData = await workflowService.getWorkflowWithRelations(workflowId)
    
    return workflowData
  } catch (error) {
    console.error('Error fetching workflow data:', error)
    return null
  }
}

export async function WorkflowCompleteServer({ documentId, workflowId }: Props) {
  const document = await getDocument(documentId)
  const workflowData = await getWorkflowData(workflowId)

  // Build workflow summary
  const workflowSummary = {
    workflowId: workflowId || `workflow_${documentId}_${Date.now()}`,
    submittedAt: workflowData?.session?.completed_at || new Date().toISOString(),
    processingEstimate: '5-10 minutes',
    status: workflowData?.session?.is_draft === false ? 'completed' : 'draft'
  }

  return (
    <WorkflowCompleteClient 
      document={document} 
      tagDimensions={tagDimensions}
      workflowSummary={workflowSummary}
      workflowData={workflowData}
    />
  )
}