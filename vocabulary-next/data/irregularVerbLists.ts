import rawLists from './rawIrregularVerbListsData'
// Import the sentence data
import sentenceData from './irregularVerbSentencesData'

// Define the structure for each list item, including sentences
export interface VerbListItem {
  verbString: string // e.g., "be – was/were – been"
  sentences: string[] // Array of 3 example sentences
}

export interface StageList {
  id: number
  items: VerbListItem[] // Use the new structure
}

interface RawLists {
  stage1: string[]
  stage2: string[]
  stage3: string[]
  stage4: string[]
  stage5: string[]
}

// Cast the imported raw data
const listsRaw = rawLists as RawLists
const sentences = sentenceData as { [key: string]: string[] }

// Helper function to extract the base verb from the string
function getBaseVerb(verbString: string): string {
  return verbString.split('–')[0].trim()
}

// Function to create the structured list for a stage
function createStageList(stageId: number, verbStrings: string[]): StageList {
  const items: VerbListItem[] = verbStrings.map(verbString => {
    const baseVerb = getBaseVerb(verbString)
    const exampleSentences = sentences[baseVerb] || [
      'Sentence data not found.',
      'Sentence data not found.',
      'Sentence data not found.'
    ] // Fallback if sentences are missing for a verb
    return {
      verbString: verbString,
      sentences: exampleSentences
    }
  })
  return { id: stageId, items: items }
}

// Create the final structured data
const irregularVerbLists: StageList[] = [
  createStageList(1, listsRaw.stage1),
  createStageList(2, listsRaw.stage2),
  createStageList(3, listsRaw.stage3),
  createStageList(4, listsRaw.stage4),
  createStageList(5, listsRaw.stage5),
]

export interface IrregularVerb {
  stage: number
  base: string
  past: string
  participle: string
  examples: string[]
}

// Build a flat array of verbs with stage and parsed verb forms
export const irregularVerbs: IrregularVerb[] = [
  ...listsRaw.stage1.map((verbString) => {
    const [base, past, participle] = verbString.split('–').map((s) => s.trim()) as [string, string, string]
    return { stage: 1, base, past, participle, examples: sentences[base] || [] }
  }),
  ...listsRaw.stage2.map((verbString) => {
    const [base, past, participle] = verbString.split('–').map((s) => s.trim()) as [string, string, string]
    return { stage: 2, base, past, participle, examples: sentences[base] || [] }
  }),
  ...listsRaw.stage3.map((verbString) => {
    const [base, past, participle] = verbString.split('–').map((s) => s.trim()) as [string, string, string]
    return { stage: 3, base, past, participle, examples: sentences[base] || [] }
  }),
  ...listsRaw.stage4.map((verbString) => {
    const [base, past, participle] = verbString.split('–').map((s) => s.trim()) as [string, string, string]
    return { stage: 4, base, past, participle, examples: sentences[base] || [] }
  }),
  ...listsRaw.stage5.map((verbString) => {
    const [base, past, participle] = verbString.split('–').map((s) => s.trim()) as [string, string, string]
    return { stage: 5, base, past, participle, examples: sentences[base] || [] }
  }),
]

export default irregularVerbLists 