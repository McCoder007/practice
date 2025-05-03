import rawStage1 from './rawIrregularVerbStage1'
import rawStage2 from './rawIrregularVerbStage2'
import rawStage3 from './rawIrregularVerbStage3'
import rawStage4 from './rawIrregularVerbStage4'
import rawStage5 from './rawIrregularVerbStage5'

// Define the shape expected by the Quiz component
export interface QuestionData {
  lineA: string
  lineB: string
  options: string[]
  correct: string
}

export interface Stage {
  id: number
  questions: QuestionData[]
}

// Map each raw stage array into Quiz QuestionData format
const stages: Stage[] = [
  { id: 1, questions: (rawStage1 as any[]).map(item => ({ lineA: item.sentence, lineB: '', options: item.options, correct: item.correct })) },
  { id: 2, questions: (rawStage2 as any[]).map(item => ({ lineA: item.sentence, lineB: '', options: item.options, correct: item.correct })) },
  { id: 3, questions: (rawStage3 as any[]).map(item => ({ lineA: item.sentence, lineB: '', options: item.options, correct: item.correct })) },
  { id: 4, questions: (rawStage4 as any[]).map(item => ({ lineA: item.sentence, lineB: '', options: item.options, correct: item.correct })) },
  { id: 5, questions: (rawStage5 as any[]).map(item => ({ lineA: item.sentence, lineB: '', options: item.options, correct: item.correct })) },
]

export default stages 