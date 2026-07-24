import questions from "./questions.json"

export type NailTechnicianQuestion = {
  question: { en: string; zh: string }
  answer: { en: string; zh: string }
}

export const nailTechnicianQuestions = questions as NailTechnicianQuestion[]

export default nailTechnicianQuestions
