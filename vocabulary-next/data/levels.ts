import level1Data from './rawLevel1Data'
import level2Data from './rawLevel2Data'
import { QuestionData } from '@/components/Quiz'

export interface Level {
  id: number
  questions: QuestionData[]
}

const levels: Level[] = [
  {
    id: 1,
    questions: level1Data as QuestionData[]
  },
  {
    id: 2,
    questions: level2Data as QuestionData[]
  }
]

export default levels
