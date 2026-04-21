import type { DayData, Word } from "./vocabulary"

/**
 * Nail technician vocabulary for the Nail Technician reel.
 * Japanese fields are empty; the reel UI falls back to Chinese when the app language is Japanese.
 */
const nailTechnicianWords: Word[] = [
  { word: "nail", translation: "指甲", japanese: "", partOfSpeech: "Noun", example: "My nail is broken.", exampleTranslation: "我的指甲断了。", japaneseSentence: "" },
  { word: "fingernail", translation: "手指甲", japanese: "", partOfSpeech: "Noun", example: "She paints her fingernails pink.", exampleTranslation: "她把手指甲涂成粉色。", japaneseSentence: "" },
  { word: "toenail", translation: "脚趾甲", japanese: "", partOfSpeech: "Noun", example: "His toenail is too long.", exampleTranslation: "他的脚趾甲太长了。", japaneseSentence: "" },
  { word: "salon", translation: "美甲店", japanese: "", partOfSpeech: "Noun", example: "I go to the salon on Saturday.", exampleTranslation: "我星期六去美甲店。", japaneseSentence: "" },
  { word: "technician", translation: "美甲师", japanese: "", partOfSpeech: "Noun", example: "The technician is very kind.", exampleTranslation: "这位美甲师非常亲切。", japaneseSentence: "" },
  { word: "manicure", translation: "美甲", japanese: "", partOfSpeech: "Noun", example: "I want a manicure today.", exampleTranslation: "我今天想做美甲。", japaneseSentence: "" },
  { word: "pedicure", translation: "修脚美甲", japanese: "", partOfSpeech: "Noun", example: "My mother gets a pedicure.", exampleTranslation: "我妈妈做修脚美甲。", japaneseSentence: "" },
  {
    word: "polish",
    // Single word, nail-polish sense (US): /ˈpɑːlɪʃ/ — not "Polish" /ˈpoʊlɪʃ/
    ttsSsml: '<speak><phoneme alphabet="ipa" ph="ˈpɑːlɪʃ">polish</phoneme></speak>',
    translation: "指甲油",
    japanese: "",
    partOfSpeech: "Noun",
    example: "This polish is red.",
    exampleTranslation: "这个指甲油是红色的。",
    japaneseSentence: "",
  },
  { word: "gel", translation: "甲油胶", japanese: "", partOfSpeech: "Noun", example: "I like gel on my nails.", exampleTranslation: "我喜欢用甲油胶做指甲。", japaneseSentence: "" },
  { word: "acrylic", translation: "水晶甲", japanese: "", partOfSpeech: "Noun", example: "She wants acrylic nails.", exampleTranslation: "她想做水晶甲。", japaneseSentence: "" },
  { word: "powder", translation: "粉", japanese: "", partOfSpeech: "Noun", example: "The powder is pink.", exampleTranslation: "这个粉是粉色的。", japaneseSentence: "" },
  { word: "tip", translation: "甲片", japanese: "", partOfSpeech: "Noun", example: "The tip is too long.", exampleTranslation: "这个甲片太长了。", japaneseSentence: "" },
  { word: "file", translation: "指甲锉", japanese: "", partOfSpeech: "Noun", example: "Please use the file gently.", exampleTranslation: "请轻一点用指甲锉。", japaneseSentence: "" },
  { word: "buffer", translation: "抛光块", japanese: "", partOfSpeech: "Noun", example: "The buffer makes the nail smooth.", exampleTranslation: "抛光块让指甲变光滑。", japaneseSentence: "" },
  { word: "cuticle", translation: "角质层", japanese: "", partOfSpeech: "Noun", example: "Her cuticles are dry.", exampleTranslation: "她的角质层很干。", japaneseSentence: "" },
  { word: "oil", translation: "护理油", japanese: "", partOfSpeech: "Noun", example: "I put oil on my nails.", exampleTranslation: "我把护理油涂在指甲上。", japaneseSentence: "" },
  { word: "clipper", translation: "指甲剪", japanese: "", partOfSpeech: "Noun", example: "The clipper is on the table.", exampleTranslation: "指甲剪在桌子上。", japaneseSentence: "" },
  { word: "scissors", translation: "剪刀", japanese: "", partOfSpeech: "Noun", example: "She uses scissors carefully.", exampleTranslation: "她小心地使用剪刀。", japaneseSentence: "" },
  { word: "brush", translation: "刷子", japanese: "", partOfSpeech: "Noun", example: "The brush is clean.", exampleTranslation: "这把刷子很干净。", japaneseSentence: "" },
  { word: "lamp", translation: "灯", japanese: "", partOfSpeech: "Noun", example: "Put your hand under the lamp.", exampleTranslation: "把你的手放在灯下面。", japaneseSentence: "" },
  { word: "base coat", translation: "底胶", japanese: "", partOfSpeech: "Noun", example: "First, I use base coat.", exampleTranslation: "首先，我用底胶。", japaneseSentence: "" },
  { word: "top coat", translation: "封层", japanese: "", partOfSpeech: "Noun", example: "The top coat is shiny.", exampleTranslation: "这个封层很亮。", japaneseSentence: "" },
  { word: "glue", translation: "胶水", japanese: "", partOfSpeech: "Noun", example: "The glue is strong.", exampleTranslation: "这个胶水很牢。", japaneseSentence: "" },
  { word: "remover", translation: "卸甲水", japanese: "", partOfSpeech: "Noun", example: "I need nail remover.", exampleTranslation: "我需要卸甲水。", japaneseSentence: "" },
  { word: "acetone", translation: "丙酮", japanese: "", partOfSpeech: "Noun", example: "Acetone removes the polish.", exampleTranslation: "丙酮可以卸掉指甲油。", japaneseSentence: "" },
  { word: "towel", translation: "毛巾", japanese: "", partOfSpeech: "Noun", example: "Please use a clean towel.", exampleTranslation: "请用一条干净的毛巾。", japaneseSentence: "" },
  { word: "cotton pad", translation: "化妆棉", japanese: "", partOfSpeech: "Noun", example: "I use a cotton pad here.", exampleTranslation: "我在这里用化妆棉。", japaneseSentence: "" },
  { word: "foil", translation: "锡纸", japanese: "", partOfSpeech: "Noun", example: "Wrap the nail in foil.", exampleTranslation: "用锡纸包住指甲。", japaneseSentence: "" },
  { word: "color", translation: "颜色", japanese: "", partOfSpeech: "Noun", example: "Blue is my favorite color.", exampleTranslation: "蓝色是我最喜欢的颜色。", japaneseSentence: "" },
  { word: "shape", translation: "形状", japanese: "", partOfSpeech: "Noun", example: "I like this nail shape.", exampleTranslation: "我喜欢这个指甲形状。", japaneseSentence: "" },
  { word: "square", translation: "方形", japanese: "", partOfSpeech: "Adjective / Noun", example: "She wants square nails.", exampleTranslation: "她想要方形指甲。", japaneseSentence: "" },
  { word: "round", translation: "圆形", japanese: "", partOfSpeech: "Adjective / Noun", example: "Round nails look soft.", exampleTranslation: "圆形指甲看起来很柔和。", japaneseSentence: "" },
  { word: "oval", translation: "椭圆形", japanese: "", partOfSpeech: "Adjective / Noun", example: "Oval nails are pretty.", exampleTranslation: "椭圆形指甲很好看。", japaneseSentence: "" },
  { word: "almond", translation: "杏仁形", japanese: "", partOfSpeech: "Adjective / Noun", example: "Almond nails are popular.", exampleTranslation: "杏仁形指甲很受欢迎。", japaneseSentence: "" },
  { word: "coffin", translation: "棺材形", japanese: "", partOfSpeech: "Adjective / Noun", example: "Coffin nails are long.", exampleTranslation: "棺材形指甲很长。", japaneseSentence: "" },
  { word: "art", translation: "美甲设计", japanese: "", partOfSpeech: "Noun", example: "She loves nail art.", exampleTranslation: "她喜欢美甲设计。", japaneseSentence: "" },
  { word: "rhinestone", translation: "水钻", japanese: "", partOfSpeech: "Noun", example: "The rhinestone is very pretty.", exampleTranslation: "这个水钻非常好看。", japaneseSentence: "" },
  { word: "glitter", translation: "亮片", japanese: "", partOfSpeech: "Noun", example: "I want glitter on one nail.", exampleTranslation: "我想在一个指甲上放亮片。", japaneseSentence: "" },
  { word: "clean", translation: "清洁", japanese: "", partOfSpeech: "Verb / Adjective", example: "Please clean the table.", exampleTranslation: "请把桌子清洁一下。", japaneseSentence: "" },
  { word: "soak", translation: "浸泡", japanese: "", partOfSpeech: "Verb", example: "Soak your fingers in warm water.", exampleTranslation: "把你的手指泡在温水里。", japaneseSentence: "" },
  { word: "trim", translation: "修剪", japanese: "", partOfSpeech: "Verb", example: "I trim my nails every week.", exampleTranslation: "我每周修剪指甲。", japaneseSentence: "" },
  { word: "remove", translation: "去除", japanese: "", partOfSpeech: "Verb", example: "Please remove the old polish.", exampleTranslation: "请去除旧的指甲油。", japaneseSentence: "" },
  { word: "apply", translation: "涂抹", japanese: "", partOfSpeech: "Verb", example: "Apply the gel slowly.", exampleTranslation: "慢慢涂抹甲油胶。", japaneseSentence: "" },
  { word: "dry", translation: "变干", japanese: "", partOfSpeech: "Verb / Adjective", example: "My nails are dry now.", exampleTranslation: "我的指甲现在干了。", japaneseSentence: "" },
  { word: "paint", translation: "涂", japanese: "", partOfSpeech: "Verb", example: "She paints her nails at home.", exampleTranslation: "她在家涂指甲。", japaneseSentence: "" },
  { word: "repair", translation: "修补", japanese: "", partOfSpeech: "Verb", example: "Can you repair this nail?", exampleTranslation: "你能修补这个指甲吗？", japaneseSentence: "" },
  { word: "broken", translation: "断的", japanese: "", partOfSpeech: "Adjective", example: "This nail is broken.", exampleTranslation: "这个指甲断了。", japaneseSentence: "" },
  { word: "appointment", translation: "预约", japanese: "", partOfSpeech: "Noun", example: "I have an appointment today.", exampleTranslation: "我今天有预约。", japaneseSentence: "" },
  { word: "customer", translation: "顾客", japanese: "", partOfSpeech: "Noun", example: "The customer likes the color.", exampleTranslation: "顾客喜欢这个颜色。", japaneseSentence: "" },
  { word: "choose", translation: "选择", japanese: "", partOfSpeech: "Verb", example: "Please choose a color.", exampleTranslation: "请选择一个颜色。", japaneseSentence: "" },
]

const nailTechnicianReel: DayData[] = [
  {
    day: 1,
    words: nailTechnicianWords,
  },
]

export default nailTechnicianReel
