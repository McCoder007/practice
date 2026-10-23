import type { ReelCard, ReelSection } from "@/data/word-reel/types"
import nailExamWordData from "../nailExamWordReel.ts"

/**
 * Words that change what an exam question asks. ESL learners often know the
 * nail fact but miss one of these words. Examples are exam-style questions,
 * or facts checked against Milady (prohibited from cutting living tissue,
 * avoid skin contact with primers, onyx).
 */
export const QUESTION_WORDS_TITLE = { en: "How Exam Questions Ask", zh: "考题怎么问" }

export const QUESTION_WORDS_DESCRIPTION = {
  en: "EXCEPT, NOT, FIRST, BEST, and other words used in many exam questions",
  zh: "EXCEPT、NOT、FIRST、BEST 等改变题意的词，以及很多题都会用到的词",
}

/**
 * Cards from the old Nail Exam Word Reel that the topic word reels already
 * teach. They are left out of "Words in many questions" so nothing repeats.
 */
const TAUGHT_IN_TOPIC_REELS = new Set([
  "implement / metal implement",
  "equipment",
  "disinfect → disinfectant → disinfection",
  "solution",
  "discoloration",
  "inflame → inflammation",
  "refer → referred to as",
  "consult → consultation",
  "enhance → enhancement",
])

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

/** General exam English from the old Nail Exam Word Reel (used across all topics). */
const COMMON_EXAM_WORDS: ReelCard[] = nailExamWordData
  .flatMap((day) => day.words)
  .filter((word) => !TAUGHT_IN_TOPIC_REELS.has(word.word))
  .map((word) => ({
    id: `qw-common-${slug(word.word)}`,
    word: word.word,
    tts: word.ttsSsml ?? word.ttsWord,
    translation: word.translation,
    partOfSpeech: word.partOfSpeech,
    example: word.example,
    exampleTranslation: word.exampleTranslation,
  }))

export const QUESTION_WORDS_HREF = "/nail-exam-practice/question-words"

export const QUESTION_WORD_SECTIONS: ReelSection[] = [
  {
    id: "trap-words",
    title: { en: "Trap words: they flip the question", zh: "陷阱词：把问题反过来" },
    cards: [
      {
        id: "qw-except",
        word: "EXCEPT",
        tts: "except",
        sayIt: "ek-SEPT",
        translation: "除了……以外",
        partOfSpeech: "Exam word",
        example: "All of these are implements EXCEPT:",
        exampleTranslation: "以下都是工具，除了：",
        note: { en: "Three answers are true. Find the one that does NOT fit.", zh: "三个答案是对的，找出那个不符合的。" },
      },
      {
        id: "qw-not",
        word: "NOT",
        tts: "not",
        translation: "不是",
        partOfSpeech: "Exam word",
        example: "Which of these is NOT a sign of infection?",
        exampleTranslation: "以下哪一项不是感染的迹象？",
        note: { en: "Look for the wrong one, not the right one.", zh: "要找错的那一个，不是对的。" },
      },
      {
        id: "qw-never",
        word: "NEVER",
        tts: "never",
        translation: "绝不；从不",
        partOfSpeech: "Exam word",
        example: "NEVER use a single-use file on another client.",
        exampleTranslation: "绝不要把一次性锉条用在另一位顾客身上。",
        note: { en: "NEVER means not one time. Answers with NEVER or ALWAYS are strong. Read them carefully.", zh: "NEVER = 一次都不行。带 NEVER 或 ALWAYS 的答案很绝对，要仔细读。" },
      },
      {
        id: "qw-always",
        word: "ALWAYS",
        tts: "always",
        translation: "总是；每次都",
        partOfSpeech: "Exam word",
        example: "ALWAYS wash your hands before a service.",
        exampleTranslation: "每次服务前都要洗手。",
        note: { en: "ALWAYS means every time, no exceptions.", zh: "ALWAYS = 每一次都要，没有例外。" },
      },
    ],
  },
  {
    id: "pick-the-top-one",
    title: { en: "Pick the top one", zh: "选最好的那一个" },
    cards: [
      {
        id: "qw-first",
        word: "FIRST",
        tts: "first",
        translation: "第一；首先",
        partOfSpeech: "Exam word",
        example: "What is the FIRST step of a manicure?",
        exampleTranslation: "修手的第一步是什么？",
        note: { en: "All four may be real steps. Pick the one you do before the others.", zh: "四个可能都是真的步骤，选最先做的那一个。" },
      },
      {
        id: "qw-best",
        word: "BEST",
        tts: "best",
        translation: "最好的",
        partOfSpeech: "Exam word",
        example: "What is the BEST way to clean a nail brush?",
        exampleTranslation: "清洁甲刷最好的方法是什么？",
        note: { en: "More than one answer may work. Pick the best one.", zh: "可能不止一个答案可行，选最好的。" },
      },
      {
        id: "qw-most",
        word: "MOST",
        tts: "most",
        translation: "最；大多数",
        partOfSpeech: "Exam word",
        example: "What is the MOST common cause of lifting?",
        exampleTranslation: "翘起最常见的原因是什么？",
        note: { en: "Pick the one that happens most often.", zh: "选最常发生的那一个。" },
      },
      {
        id: "qw-most-likely",
        word: "MOST likely",
        tts: "most likely",
        translation: "最有可能",
        partOfSpeech: "Exam phrase",
        example: "What will MOST likely happen if you skip the primer?",
        exampleTranslation: "如果不用结合剂，最有可能发生什么？",
        note: { en: "Think: what usually happens? Not what could happen one time.", zh: "想一想：通常会发生什么？不是偶尔可能发生的。" },
      },
      {
        id: "qw-primary",
        word: "PRIMARY / main",
        tts: "primary, main",
        sayIt: "PRY-mair-ee",
        translation: "主要的",
        partOfSpeech: "Exam word",
        example: "What is the PRIMARY purpose of a disinfectant?",
        exampleTranslation: "消毒剂的主要用途是什么？",
        note: { en: "Pick the biggest reason, not a small extra one.", zh: "选最主要的原因，不是次要的。" },
      },
    ],
  },
  {
    id: "formal-words",
    title: { en: "Formal words in questions", zh: "题目里的正式用语" },
    cards: [
      {
        id: "qw-which-of-the-following",
        word: "which of the following",
        translation: "下列哪一项",
        partOfSpeech: "Exam phrase",
        example: "Which of the following is a single-use item?",
        exampleTranslation: "下列哪一项是一次性用品？",
        note: { en: "\"The following\" = the four answers below.", zh: "\"the following\" = 下面的四个答案。" },
      },
      {
        id: "qw-proper",
        word: "proper / appropriate",
        tts: "proper, appropriate",
        translation: "正确的；适当的",
        partOfSpeech: "Adjective",
        example: "What is the proper way to store clean implements?",
        exampleTranslation: "存放干净工具的正确方法是什么？",
        note: { en: "Proper and appropriate both mean the right way.", zh: "proper 和 appropriate 都是“正确、合适的做法”。" },
      },
      {
        id: "qw-prohibit",
        word: "prohibit → prohibited",
        tts: "prohibit, prohibited",
        sayIt: "proh-HIB-it",
        translation: "禁止；被禁止的",
        partOfSpeech: "Verb",
        example: "Nail technicians are prohibited from cutting living tissue.",
        exampleTranslation: "美甲师被禁止剪任何活组织。",
        note: { en: "Prohibited = not allowed. Like a NO sign.", zh: "prohibited = 不允许，像“禁止”标志。" },
      },
      {
        id: "qw-avoid",
        word: "avoid",
        translation: "避免",
        partOfSpeech: "Verb",
        example: "Avoid contact with the skin when using nail primers.",
        exampleTranslation: "使用结合剂时，避免接触皮肤。",
        note: { en: "Avoid = stay away from it. Don't let it happen.", zh: "avoid = 远离它，不要让它发生。" },
      },
      {
        id: "qw-in-order-to",
        word: "in order to",
        translation: "为了",
        partOfSpeech: "Exam phrase",
        example: "Wash your hands in order to remove germs.",
        exampleTranslation: "为了去除细菌，要洗手。",
        note: { en: "In order to = to. It tells the reason.", zh: "in order to = 为了，说明原因。" },
      },
      {
        id: "qw-is-used-to",
        word: "is used to",
        translation: "用来；用于",
        partOfSpeech: "Exam phrase",
        example: "A nail file is used to shape the nail.",
        exampleTranslation: "指甲锉是用来修指甲形状的。",
        note: { en: "\"X is used to + verb\" = this is X's job.", zh: "\"X is used to + 动词\" = X 的用途。不是“习惯”的意思。" },
      },
      {
        id: "qw-referred-to-as",
        word: "is referred to as",
        tts: "is referred to as",
        translation: "被称为",
        partOfSpeech: "Exam phrase",
        example: "The natural nail is referred to as the onyx.",
        exampleTranslation: "天然指甲被称为 onyx（甲）。",
        note: { en: "Is referred to as = is called. A name comes next.", zh: "is referred to as = 叫作，后面跟着一个名字。" },
      },
      {
        id: "qw-purpose",
        word: "purpose",
        sayIt: "PUR-pus",
        translation: "目的；用途",
        partOfSpeech: "Noun",
        example: "What is the purpose of a nail primer?",
        exampleTranslation: "结合剂的用途是什么？",
        note: { en: "Purpose = why we use it.", zh: "purpose = 为什么要用它。" },
      },
    ],
  },
  {
    id: "common-words",
    title: { en: "Words in many questions", zh: "很多题都会用到的词" },
    cards: COMMON_EXAM_WORDS,
  },
]
