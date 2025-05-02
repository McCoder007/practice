import rawVerbTensesData from './rawVerbTensesData'

export interface QuestionData {
  lineA: string
  lineB: string
  options: string[]
  correct: string
}

const verbTensesData: QuestionData[] = rawVerbTensesData as QuestionData[]

export default verbTensesData 