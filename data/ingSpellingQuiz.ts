import { shuffleArray } from "@/lib/utils";

export interface QuizWord {
  baseForm: string;
  chineseTranslation: string;
  correctAnswer: string;
  rule: number;
  ruleTitle: string;
  ruleTitleChinese: string;
  ruleExplanation: string;
  ruleExplanationChinese: string;
}

export interface IngSpellingRule {
  ruleTitle: string;
  ruleTitleChinese: string;
  ruleExplanation: string;
  ruleExplanationChinese: string;
}

/** The 5 -ing spelling rules for the hint dialog. */
export const ING_SPELLING_RULES: IngSpellingRule[] = [
  {
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing",
  },
  {
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing",
  },
  {
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing",
  },
  {
    ruleTitle: "Rule 4: Verbs ending in -ie",
    ruleTitleChinese: "规则4：以-ie结尾的动词",
    ruleExplanation: "Change -ie to -y before adding -ing",
    ruleExplanationChinese: "将ie改为y，再加-ing",
  },
  {
    ruleTitle: "Rule 5: Verbs ending in -ee",
    ruleTitleChinese: "规则5：以-ee结尾的动词",
    ruleExplanation: "Keep the '-ee' intact and add '-ing'",
    ruleExplanationChinese: "保持-ee，直接加-ing",
  },
];

export const quizWords: QuizWord[] = [
  // RULE 1: Most verbs - just add -ing
  {
    baseForm: "walk",
    chineseTranslation: "走路",
    correctAnswer: "walking",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "talk",
    chineseTranslation: "说话",
    correctAnswer: "talking",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "play",
    chineseTranslation: "玩",
    correctAnswer: "playing",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "work",
    chineseTranslation: "工作",
    correctAnswer: "working",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "read",
    chineseTranslation: "读",
    correctAnswer: "reading",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "eat",
    chineseTranslation: "吃",
    correctAnswer: "eating",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "sleep",
    chineseTranslation: "睡觉",
    correctAnswer: "sleeping",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "drink",
    chineseTranslation: "喝",
    correctAnswer: "drinking",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "help",
    chineseTranslation: "帮助",
    correctAnswer: "helping",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "watch",
    chineseTranslation: "看",
    correctAnswer: "watching",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "listen",
    chineseTranslation: "听",
    correctAnswer: "listening",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "cook",
    chineseTranslation: "做饭",
    correctAnswer: "cooking",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "clean",
    chineseTranslation: "清洁",
    correctAnswer: "cleaning",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "wash",
    chineseTranslation: "洗",
    correctAnswer: "washing",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "teach",
    chineseTranslation: "教",
    correctAnswer: "teaching",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "learn",
    chineseTranslation: "学习",
    correctAnswer: "learning",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "build",
    chineseTranslation: "建造",
    correctAnswer: "building",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "paint",
    chineseTranslation: "画画",
    correctAnswer: "painting",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "sing",
    chineseTranslation: "唱歌",
    correctAnswer: "singing",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "stand",
    chineseTranslation: "站",
    correctAnswer: "standing",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "jump",
    chineseTranslation: "跳",
    correctAnswer: "jumping",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "turn",
    chineseTranslation: "转",
    correctAnswer: "turning",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "open",
    chineseTranslation: "打开",
    correctAnswer: "opening",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "wait",
    chineseTranslation: "等待",
    correctAnswer: "waiting",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "start",
    chineseTranslation: "开始",
    correctAnswer: "starting",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "finish",
    chineseTranslation: "完成",
    correctAnswer: "finishing",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "send",
    chineseTranslation: "发送",
    correctAnswer: "sending",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "sell",
    chineseTranslation: "卖",
    correctAnswer: "selling",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "bring",
    chineseTranslation: "带来",
    correctAnswer: "bringing",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "think",
    chineseTranslation: "思考",
    correctAnswer: "thinking",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "feel",
    chineseTranslation: "感觉",
    correctAnswer: "feeling",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "visit",
    chineseTranslation: "拜访",
    correctAnswer: "visiting",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "need",
    chineseTranslation: "需要",
    correctAnswer: "needing",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "ask",
    chineseTranslation: "问",
    correctAnswer: "asking",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "answer",
    chineseTranslation: "回答",
    correctAnswer: "answering",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "call",
    chineseTranslation: "打电话",
    correctAnswer: "calling",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "find",
    chineseTranslation: "找到",
    correctAnswer: "finding",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "show",
    chineseTranslation: "展示",
    correctAnswer: "showing",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "draw",
    chineseTranslation: "画",
    correctAnswer: "drawing",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },
  {
    baseForm: "follow",
    chineseTranslation: "跟随",
    correctAnswer: "following",
    rule: 1,
    ruleTitle: "Rule 1: For most verbs",
    ruleTitleChinese: "规则1：大多数动词",
    ruleExplanation: "Add -ing to the base form of the verb",
    ruleExplanationChinese: "直接加-ing"
  },

  // RULE 2: Verbs ending in e - drop e, add -ing
  {
    baseForm: "write",
    chineseTranslation: "写",
    correctAnswer: "writing",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "make",
    chineseTranslation: "做",
    correctAnswer: "making",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "take",
    chineseTranslation: "拿",
    correctAnswer: "taking",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "come",
    chineseTranslation: "来",
    correctAnswer: "coming",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "give",
    chineseTranslation: "给",
    correctAnswer: "giving",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "live",
    chineseTranslation: "住",
    correctAnswer: "living",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "love",
    chineseTranslation: "爱",
    correctAnswer: "loving",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "move",
    chineseTranslation: "移动",
    correctAnswer: "moving",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "use",
    chineseTranslation: "使用",
    correctAnswer: "using",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "have",
    chineseTranslation: "有",
    correctAnswer: "having",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "leave",
    chineseTranslation: "离开",
    correctAnswer: "leaving",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "close",
    chineseTranslation: "关闭",
    correctAnswer: "closing",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "change",
    chineseTranslation: "改变",
    correctAnswer: "changing",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "arrive",
    chineseTranslation: "到达",
    correctAnswer: "arriving",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "dance",
    chineseTranslation: "跳舞",
    correctAnswer: "dancing",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "drive",
    chineseTranslation: "开车",
    correctAnswer: "driving",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "ride",
    chineseTranslation: "骑",
    correctAnswer: "riding",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "smile",
    chineseTranslation: "微笑",
    correctAnswer: "smiling",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "hope",
    chineseTranslation: "希望",
    correctAnswer: "hoping",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },
  {
    baseForm: "save",
    chineseTranslation: "保存",
    correctAnswer: "saving",
    rule: 2,
    ruleTitle: "Rule 2: Verbs ending in e",
    ruleTitleChinese: "规则2：以e结尾的动词",
    ruleExplanation: "Drop the 'e' before adding -ing",
    ruleExplanationChinese: "去掉e，再加-ing"
  },

  // RULE 3: CVC - double consonant, add -ing
  {
    baseForm: "run",
    chineseTranslation: "跑",
    correctAnswer: "running",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },
  {
    baseForm: "sit",
    chineseTranslation: "坐",
    correctAnswer: "sitting",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },
  {
    baseForm: "get",
    chineseTranslation: "得到",
    correctAnswer: "getting",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },
  {
    baseForm: "put",
    chineseTranslation: "放",
    correctAnswer: "putting",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },
  {
    baseForm: "stop",
    chineseTranslation: "停止",
    correctAnswer: "stopping",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },
  {
    baseForm: "shop",
    chineseTranslation: "购物",
    correctAnswer: "shopping",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },
  {
    baseForm: "swim",
    chineseTranslation: "游泳",
    correctAnswer: "swimming",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },
  {
    baseForm: "plan",
    chineseTranslation: "计划",
    correctAnswer: "planning",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },
  {
    baseForm: "begin",
    chineseTranslation: "开始",
    correctAnswer: "beginning",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },
  {
    baseForm: "cut",
    chineseTranslation: "切",
    correctAnswer: "cutting",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },
  {
    baseForm: "win",
    chineseTranslation: "赢",
    correctAnswer: "winning",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },
  {
    baseForm: "hit",
    chineseTranslation: "打",
    correctAnswer: "hitting",
    rule: 3,
    ruleTitle: "Rule 3: Consonant-vowel-consonant",
    ruleTitleChinese: "规则3：辅音-元音-辅音",
    ruleExplanation: "Double the final consonant and add -ing",
    ruleExplanationChinese: "双写最后的辅音字母，然后加-ing"
  },

  // RULE 4: Verbs ending in -ie
  {
    baseForm: "die",
    chineseTranslation: "死",
    correctAnswer: "dying",
    rule: 4,
    ruleTitle: "Rule 4: Verbs ending in -ie",
    ruleTitleChinese: "规则4：以-ie结尾的动词",
    ruleExplanation: "Change -ie to -y before adding -ing",
    ruleExplanationChinese: "将ie改为y，再加-ing"
  },
  {
    baseForm: "lie",
    chineseTranslation: "躺",
    correctAnswer: "lying",
    rule: 4,
    ruleTitle: "Rule 4: Verbs ending in -ie",
    ruleTitleChinese: "规则4：以-ie结尾的动词",
    ruleExplanation: "Change -ie to -y before adding -ing",
    ruleExplanationChinese: "将ie改为y，再加-ing"
  },
  {
    baseForm: "tie",
    chineseTranslation: "系",
    correctAnswer: "tying",
    rule: 4,
    ruleTitle: "Rule 4: Verbs ending in -ie",
    ruleTitleChinese: "规则4：以-ie结尾的动词",
    ruleExplanation: "Change -ie to -y before adding -ing",
    ruleExplanationChinese: "将ie改为y，再加-ing"
  },
  {
    baseForm: "untie",
    chineseTranslation: "解开",
    correctAnswer: "untying",
    rule: 4,
    ruleTitle: "Rule 4: Verbs ending in -ie",
    ruleTitleChinese: "规则4：以-ie结尾的动词",
    ruleExplanation: "Change -ie to -y before adding -ing",
    ruleExplanationChinese: "将ie改为y，再加-ing"
  },

  // RULE 5: Verbs ending in -ee
  {
    baseForm: "agree",
    chineseTranslation: "同意",
    correctAnswer: "agreeing",
    rule: 5,
    ruleTitle: "Rule 5: Verbs ending in -ee",
    ruleTitleChinese: "规则5：以-ee结尾的动词",
    ruleExplanation: "Keep the '-ee' intact and add '-ing'",
    ruleExplanationChinese: "保持-ee，直接加-ing"
  },
  {
    baseForm: "see",
    chineseTranslation: "看见",
    correctAnswer: "seeing",
    rule: 5,
    ruleTitle: "Rule 5: Verbs ending in -ee",
    ruleTitleChinese: "规则5：以-ee结尾的动词",
    ruleExplanation: "Keep the '-ee' intact and add '-ing'",
    ruleExplanationChinese: "保持-ee，直接加-ing"
  },
  {
    baseForm: "free",
    chineseTranslation: "释放",
    correctAnswer: "freeing",
    rule: 5,
    ruleTitle: "Rule 5: Verbs ending in -ee",
    ruleTitleChinese: "规则5：以-ee结尾的动词",
    ruleExplanation: "Keep the '-ee' intact and add '-ing'",
    ruleExplanationChinese: "保持-ee，直接加-ing"
  },
  {
    baseForm: "guarantee",
    chineseTranslation: "保证",
    correctAnswer: "guaranteeing",
    rule: 5,
    ruleTitle: "Rule 5: Verbs ending in -ee",
    ruleTitleChinese: "规则5：以-ee结尾的动词",
    ruleExplanation: "Keep the '-ee' intact and add '-ing'",
    ruleExplanationChinese: "保持-ee，直接加-ing"
  }
];

export function generateWrongAnswers(word: QuizWord): string[] {
  const { baseForm, correctAnswer, rule } = word;
  const wrongAnswers: string[] = [];

  switch (rule) {
    case 1:
      if (baseForm.length >= 3) {
        wrongAnswers.push(baseForm + baseForm[baseForm.length - 1] + "ing");
      }
      wrongAnswers.push(baseForm.slice(0, -1) + "ing");
      break;

    case 2:
      wrongAnswers.push(baseForm + "ing");
      if (baseForm.length >= 2) {
        wrongAnswers.push(
          baseForm.slice(0, -1) + baseForm[baseForm.length - 2] + "ing"
        );
      }
      break;

    case 3:
      wrongAnswers.push(baseForm + "ing");
      wrongAnswers.push(
        baseForm +
          baseForm[baseForm.length - 1] +
          baseForm[baseForm.length - 1] +
          "ing"
      );
      break;

    case 4:
      wrongAnswers.push(baseForm + "ing");
      wrongAnswers.push(baseForm.slice(0, -2) + "ing");
      break;

    case 5:
      wrongAnswers.push(baseForm.slice(0, -1) + "ing");
      wrongAnswers.push(baseForm.slice(0, -2) + "ing");
      break;
  }

  return wrongAnswers.slice(0, 2);
}

/** Returns shuffled options (correct + wrong) for a question. */
export function getOptionsForWord(word: QuizWord): string[] {
  return shuffleArray([word.correctAnswer, ...generateWrongAnswers(word)]);
}
