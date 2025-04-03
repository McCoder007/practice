// Vocabulary Data: Day-by-day vocabulary practice
// Words with example sentences and Chinese translations

const vocabularyData = {
    // Day 1: Words about pace, attitudes, and behaviors
    day1: [
        {
            word: "people",
            sentence: "There are many people in the shopping mall today.",
            translation: "今天购物中心里有很多人。",
            type: "noun"
        },
        {
            word: "person",
            sentence: "She is a very friendly person.",
            translation: "她是一个非常友好的人。",
            type: "noun"
        },
        {
            word: "impatient",
            sentence: "He gets impatient when he has to wait in line.",
            translation: "当他必须排队等候时，他会变得不耐烦。",
            type: "adjective"
        },
        {
            word: "patient",
            sentence: "My grandmother is very patient with children.",
            translation: "我的祖母对孩子们非常有耐心。",
            type: "adjective"
        },
        {
            word: "quickly",
            sentence: "Please finish your homework quickly.",
            translation: "请快点完成你的家庭作业。",
            type: "adverb"
        },
        {
            word: "event",
            sentence: "We're organizing a special event for the holiday.",
            translation: "我们正在为假期组织一个特别活动。",
            type: "noun"
        },
        {
            word: "attend",
            sentence: "Will you attend the meeting tomorrow?",
            translation: "你明天会参加会议吗？",
            type: "verb"
        },
        {
            word: "recklessly",
            sentence: "He drives recklessly on the highway.",
            translation: "他在高速公路上开车鲁莽。",
            type: "adverb"
        },
        {
            word: "honk",
            sentence: "Please don't honk your horn in residential areas.",
            translation: "请不要在住宅区按喇叭。",
            type: "verb"
        },
        {
            word: "horn",
            sentence: "The driver honked his horn at the pedestrian.",
            translation: "司机对行人按喇叭。",
            type: "noun"
        },
        {
            word: "hurry",
            sentence: "We need to hurry or we'll miss the train.",
            translation: "我们需要快点，否则我们会错过火车。",
            type: "verb"
        },
        {
            word: "interrupt",
            sentence: "It's rude to interrupt when someone is talking.",
            translation: "当某人说话时打断他是不礼貌的。",
            type: "verb"
        },
        {
            word: "sport",
            sentence: "Soccer is the most popular sport in many countries.",
            translation: "足球是许多国家最受欢迎的运动。",
            type: "noun"
        },
        {
            word: "balance",
            sentence: "It's important to maintain a balance between work and life.",
            translation: "保持工作和生活之间的平衡很重要。",
            type: "noun"
        },
        {
            word: "balancing",
            sentence: "She is good at balancing her career and family responsibilities.",
            translation: "她善于平衡事业和家庭责任。",
            type: "verb"
        },
        {
            word: "polite",
            sentence: "Remember to be polite when meeting new people.",
            translation: "记得在遇到新朋友时要有礼貌。",
            type: "adjective"
        },
        {
            word: "dressed informal",
            sentence: "The party is casual, so you can come dressed informal.",
            translation: "聚会是休闲的，所以你可以穿着休闲。",
            type: "phrase"
        },
        {
            word: "dressed formal",
            sentence: "For the wedding, everyone should be dressed formal.",
            translation: "参加婚礼时，每个人都应该穿正式的服装。",
            type: "phrase"
        },
        {
            word: "automatically",
            sentence: "The lights turn on automatically when someone enters the room.",
            translation: "当有人进入房间时，灯会自动打开。",
            type: "adverb"
        }
    ],
    
    // Day 2: Words about personality traits and character
    day2: [
        {
            word: "admire",
            sentence: "I really admire a guy in my karate class because he's so skilled.",
            translation: "我非常欣赏我空手道班上的一个人，因为他很有技巧。",
            type: "verb"
        },
        {
            word: "talented",
            sentence: "My English teacher is incredibly talented and creative.",
            translation: "我的英语老师非常有才华和创造力。",
            type: "adjective"
        },
        {
            word: "creative",
            sentence: "She's incredibly talented and creative in her teaching methods.",
            translation: "她在教学方法上非常有才华和创造力。",
            type: "adjective"
        },
        {
            word: "great sense of humor",
            sentence: "My teacher has a great sense of humor and makes classes fun.",
            translation: "我的老师很有幽默感，让课堂变得有趣。",
            type: "phrase"
        },
        {
            word: "disorganized",
            sentence: "She's pretty disorganized though; she forgets something almost every class.",
            translation: "不过她很混乱；她几乎每节课都会忘记一些东西。",
            type: "adjective"
        },
        {
            word: "competitive",
            sentence: "He's extremely competitive, but when he wins, he's not arrogant.",
            translation: "他非常有竞争力，但当他赢了，他并不傲慢。",
            type: "adjective"
        },
        {
            word: "arrogant",
            sentence: "He's not arrogant like some of the other guys in the class.",
            translation: "他不像班上其他一些人那样傲慢。",
            type: "adjective"
        },
        {
            word: "outgoing",
            sentence: "He's not very outgoing, so some people think he's unfriendly.",
            translation: "他不是很外向，所以有些人认为他不友好。",
            type: "adjective"
        },
        {
            word: "unfriendly",
            sentence: "Some people think he's unfriendly, but I think he's just shy.",
            translation: "有些人认为他不友好，但我认为他只是害羞。",
            type: "adjective"
        },
        {
            word: "shy",
            sentence: "He's not unfriendly, he's basically just shy around new people.",
            translation: "他并不是不友好，他基本上只是在新朋友面前害羞。",
            type: "adjective"
        },
        {
            word: "easygoing",
            sentence: "My dad's a pretty cool guy. He's fairly easygoing and laid-back.",
            translation: "我爸爸是个很酷的人。他相当随和，很放松。",
            type: "adjective"
        },
        {
            word: "laid-back",
            sentence: "I like working with him because he's so laid-back and never stresses out.",
            translation: "我喜欢和他一起工作，因为他很放松，从不紧张。",
            type: "adjective"
        },
        {
            word: "practical",
            sentence: "He's very practical and down-to-earth, so he always gives good advice.",
            translation: "他非常务实和脚踏实地，所以他总是给出很好的建议。",
            type: "adjective"
        },
        {
            word: "down-to-earth",
            sentence: "I appreciate how down-to-earth he is when discussing complicated issues.",
            translation: "我很欣赏他在讨论复杂问题时的脚踏实地。",
            type: "adjective"
        },
        {
            word: "honest",
            sentence: "He's completely honest with me, so I can trust what he says.",
            translation: "他对我完全诚实，所以我可以相信他说的话。",
            type: "adjective"
        }
    ]
    
    // Additional days can be added here as needed
}; 