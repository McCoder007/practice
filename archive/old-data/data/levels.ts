import rawLevel1Data from './rawLevel1Data'
import rawLevel2Data from './rawLevel2Data'

export interface QuestionData {
  lineA: string
  lineB: string
  options: string[]
  correct: string
}

export interface Level {
  id: number
  questions: QuestionData[]
}

const levels: Level[] = [
  { id: 1, questions: rawLevel1Data as QuestionData[] },
  { id: 2, questions: rawLevel2Data as QuestionData[] },
]

export default levels 