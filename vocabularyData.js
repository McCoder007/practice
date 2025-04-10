// Vocabulary Data: Day-by-day vocabulary practice
// Words with example sentences and Chinese translations

const vocabularyData = {
    // Day 1: Words about pace, attitudes, and behaviors
    day1: [
        {
            word: "attend",
            word_translation: "参加",
            sentence: "Will you attend the meeting tomorrow?",
            translation: "你明天会参加会议吗？",
            type: "verb"
        },
        {
            word: "automatically",
            word_translation: "自动地",
            sentence: "The lights turn on automatically when someone enters the room.",
            translation: "当有人进入房间时，灯会自动打开。",
            type: "adverb"
        },
        {
            word: "balance",
            word_translation: "平衡",
            sentence: "It's important to maintain a balance between work and life.",
            translation: "保持工作和生活之间的平衡很重要。",
            type: "noun"
        },
        {
            word: "balancing",
            word_translation: "保持平衡",
            sentence: "She is good at balancing her career and family responsibilities.",
            translation: "她善于平衡事业和家庭责任。",
            type: "verb"
        },
        {
            word: "dressed formal",
            word_translation: "穿着正式",
            sentence: "For the wedding, everyone should be dressed formal.",
            translation: "参加婚礼时，每个人都应该穿正式的服装。",
            type: "phrase"
        },
        {
            word: "dressed informal",
            word_translation: "穿着随便",
            sentence: "The party is casual, so you can come dressed informal.",
            translation: "聚会是休闲的，所以你可以穿着休闲。",
            type: "phrase"
        },
        {
            word: "event",
            word_translation: "活动",
            sentence: "We're organizing a special event for the holiday.",
            translation: "我们正在为假期组织一个特别活动。",
            type: "noun"
        },
        {
            word: "honk",
            word_translation: "按喇叭",
            sentence: "Please don't honk your horn in residential areas.",
            translation: "请不要在住宅区按喇叭。",
            type: "verb"
        },
        {
            word: "horn",
            word_translation: "喇叭",
            sentence: "The driver honked his horn at the pedestrian.",
            translation: "司机对行人按喇叭。",
            type: "noun"
        },
        {
            word: "hurry",
            word_translation: "赶紧",
            sentence: "We need to hurry or we'll miss the train.",
            translation: "我们需要快点，否则我们会错过火车。",
            type: "verb"
        },
        {
            word: "impatient",
            word_translation: "不耐烦的",
            sentence: "He gets impatient when he has to wait in line.",
            translation: "当他必须排队等候时，他会变得不耐烦。",
            type: "adjective"
        },
        {
            word: "interrupt",
            word_translation: "打断",
            sentence: "It's rude to interrupt when someone is talking.",
            translation: "当某人说话时打断他是不礼貌的。",
            type: "verb"
        },
        {
            word: "patient",
            word_translation: "有耐心的",
            sentence: "My teacher is very patient with students who learn slowly.",
            translation: "我的老师对学习慢的学生很有耐心。",
            type: "adjective"
        },
        {
            word: "people",
            word_translation: "人们",
            sentence: "There are many people in the shopping mall today.",
            translation: "今天购物中心里有很多人。",
            type: "noun"
        },
        {
            word: "person",
            word_translation: "人",
            sentence: "There's a person waiting outside for you.",
            translation: "有一个人在外面等你。",
            type: "noun"
        },
        {
            word: "polite",
            word_translation: "有礼貌的",
            sentence: "Remember to be polite when meeting new people.",
            translation: "记得在遇到新朋友时要有礼貌。",
            type: "adjective"
        },
        {
            word: "quickly",
            word_translation: "快速地",
            sentence: "She walks quickly to catch the bus.",
            translation: "她快速地走路去赶公交车。",
            type: "adverb"
        },
        {
            word: "recklessly",
            word_translation: "鲁莽地",
            sentence: "He drives recklessly on the highway.",
            translation: "他在高速公路上开车鲁莽。",
            type: "adverb"
        },
        {
            word: "sport",
            word_translation: "运动",
            sentence: "Soccer is the most popular sport in many countries.",
            translation: "足球是许多国家最受欢迎的运动。",
            type: "noun"
        }
    ],
    
    // Day 2: Words about personality traits and character
    day2: [
        {
            word: "admire",
            word_translation: "欣赏",
            sentence: "I really admire a guy in my karate class because he's so skilled.",
            translation: "我非常欣赏我空手道班上的一个人，因为他很有技巧。",
            type: "verb"
        },
        {
            word: "arrogant",
            word_translation: "傲慢的",
            sentence: "He's not arrogant like some of the other guys in the class.",
            translation: "他不像班上其他一些人那样傲慢。",
            type: "adjective"
        },
        {
            word: "competitive",
            word_translation: "有竞争心的",
            sentence: "He's extremely competitive, but when he wins, he's not arrogant.",
            translation: "他非常有竞争力，但当他赢了，他并不傲慢。",
            type: "adjective"
        },
        {
            word: "creative",
            word_translation: "有创意的",
            sentence: "She's incredibly talented and creative in her teaching methods.",
            translation: "她在教学方法上非常有才华和创造力。",
            type: "adjective"
        },
        {
            word: "disorganized",
            word_translation: "缺乏条理的",
            sentence: "She's pretty disorganized though; she forgets something almost every class.",
            translation: "不过她很混乱；她几乎每节课都会忘记一些东西。",
            type: "adjective"
        },
        {
            word: "down-to-earth",
            word_translation: "脚踏实地的",
            sentence: "I appreciate how down-to-earth he is when discussing complicated issues.",
            translation: "我很欣赏他在讨论复杂问题时的脚踏实地。",
            type: "adjective"
        },
        {
            word: "easygoing",
            word_translation: "随和的",
            sentence: "My dad's a pretty cool guy. He's fairly easygoing and laid-back.",
            translation: "我爸爸是个很酷的人。他相当随和，很放松。",
            type: "adjective"
        },
        {
            word: "great sense of humor",
            word_translation: "很有幽默感",
            sentence: "My teacher has a great sense of humor and makes classes fun.",
            translation: "我的老师很有幽默感，让课堂变得有趣。",
            type: "phrase"
        },
        {
            word: "honest",
            word_translation: "诚实的",
            sentence: "He's completely honest with me, so I can trust what he says.",
            translation: "他对我完全诚实，所以我可以相信他说的话。",
            type: "adjective"
        },
        {
            word: "laid-back",
            word_translation: "悠闲的",
            sentence: "I like working with him because he's so laid-back and never stresses out.",
            translation: "我喜欢和他一起工作，因为他很放松，从不紧张。",
            type: "adjective"
        },
        {
            word: "outgoing",
            word_translation: "外向的",
            sentence: "He's not very outgoing, so some people think he's unfriendly.",
            translation: "他不是很外向，所以有些人认为他不友好。",
            type: "adjective"
        },
        {
            word: "practical",
            word_translation: "实际的",
            sentence: "He's very practical and down-to-earth, so he always gives good advice.",
            translation: "他非常务实和脚踏实地，所以他总是给出很好的建议。",
            type: "adjective"
        },
        {
            word: "shy",
            word_translation: "害羞的",
            sentence: "He's not unfriendly, he's basically just shy around new people.",
            translation: "他并不是不友好，他基本上只是在新朋友面前害羞。",
            type: "adjective"
        },
        {
            word: "talented",
            word_translation: "有才华的",
            sentence: "My English teacher is incredibly talented and creative.",
            translation: "我的英语老师非常有才华和创造力。",
            type: "adjective"
        },
        {
            word: "unfriendly",
            word_translation: "不友善的",
            sentence: "Some people think he's unfriendly, but I think he's just shy.",
            translation: "有些人认为他不友好，但我认为他只是害羞。",
            type: "adjective"
        }
    ],
    
    // Day 3: Words about relationships and character traits
    day3: [
        {
            word: "charity",
            word_translation: "慈善",
            sentence: "She gives a lot of time and money to charity because she's so generous.",
            translation: "她因为很慷慨，所以投入很多时间和金钱做慈善。",
            type: "noun"
        },
        {
            word: "coworkers",
            word_translation: "同事",
            sentence: "My coworkers are very helpful and always ready to explain things to me.",
            translation: "我的同事们都很乐于助人，总是愿意给我解释事情。",
            type: "noun"
        },
        {
            word: "earth",
            word_translation: "地球",
            sentence: "We need to be more considerate about how we treat the Earth.",
            translation: "我们需要更体贴地对待地球。",
            type: "noun"
        },
        {
            word: "exit",
            word_translation: "出口",
            sentence: "She took the next exit off the highway to get to the gas station",
            translation: "她为了去加油站，在下一个出口驶出了高速公路",
            type: "noun"
        },
        {
            word: "explain",
            word_translation: "解释",
            sentence: "Could you explain why you're upset with your neighbors?",
            translation: "你能解释一下为什么你对邻居不高兴吗？",
            type: "verb"
        },
        {
            word: "fairly",
            word_translation: "公平地",
            sentence: "The teacher treats all students fairly and gives everyone equal attention.",
            translation: "老师公平地对待所有学生，给予每个人同等的关注。",
            type: "adverb"
        },
        {
            word: "false",
            word_translation: "错误的",
            sentence: "It's false that selfish people are happier than generous ones.",
            translation: "自私的人比慷慨的人更快乐，这种说法是错误的。",
            type: "adjective"
        },
        {
            word: "generous",
            word_translation: "慷慨的",
            sentence: "My friend Luisa is very generous and always helps others.",
            translation: "我的朋友路易莎很慷慨，总是帮助他人。",
            type: "adjective"
        },
        {
            word: "helpful",
            word_translation: "有帮助的",
            sentence: "It's important to be helpful to new people in your community.",
            translation: "对社区里的新人提供帮助很重要。",
            type: "adjective"
        },
        {
            word: "ideas",
            word_translation: "想法",
            sentence: "She always has creative ideas about how to solve problems.",
            translation: "她总是有创造性的想法来解决问题。",
            type: "noun"
        },
        {
            word: "inconsiderate",
            word_translation: "不体贴的",
            sentence: "It's inconsiderate to play loud music late at night.",
            translation: "深夜播放大声音乐是不体贴的。",
            type: "adjective"
        },
        {
            word: "neighbors",
            word_translation: "邻居",
            sentence: "Our neighbors are reliable people who always help when needed.",
            translation: "我们的邻居都是可靠的人，在需要时总会帮忙。",
            type: "noun"
        },
        {
            word: "opposite",
            word_translation: "相反的",
            sentence: "Being generous is the opposite of being selfish.",
            translation: "慷慨是自私的反义词。",
            type: "adjective"
        },
        {
            word: "puzzle",
            word_translation: "谜题",
            sentence: "It's a puzzle why some people can be so inconsiderate of others.",
            translation: "为什么有些人如此不顾及他人，这真是个谜。",
            type: "noun"
        },
        {
            word: "reliable",
            word_translation: "可靠的",
            sentence: "You can always count on reliable friends to help you.",
            translation: "你总是可以指望可靠的朋友来帮助你。",
            type: "adjective"
        },
        {
            word: "selfish",
            word_translation: "自私的",
            sentence: "She's not selfish at all; she's always thinking of others.",
            translation: "她一点也不自私，总是考虑他人。",
            type: "adjective"
        },
        {
            word: "true",
            word_translation: "真实的",
            sentence: "It's true that helpful people often make the best friends.",
            translation: "乐于助人的人往往是最好的朋友，这是真的。",
            type: "adjective"
        },
        {
            word: "undo",
            word_translation: "撤销",
            sentence: "Sometimes you can't undo the hurt caused by inconsiderate words.",
            translation: "有时候你无法撤销不体贴的话所造成的伤害。",
            type: "verb"
        },
        {
            word: "upset",
            word_translation: "心烦的",
            sentence: "Don't get upset when people make honest mistakes.",
            translation: "当人们犯了诚实的错误时，不要心烦。",
            type: "adjective"
        }
    ],
    
    // Day 4: Words about actions and states
    day4: [
        {
            word: "always",
            word_translation: "总是",
            sentence: "She always wakes up early.",
            translation: "她总是早起。",
            type: "adverb"
        },
        {
            word: "at least",
            word_translation: "至少",
            sentence: "Eat at least one apple a day.",
            translation: "每天至少吃一个苹果。",
            type: "phrase"
        },
        {
            word: "basketball",
            word_translation: "篮球",
            sentence: "I like to play basketball.",
            translation: "我喜欢打篮球。",
            type: "noun"
        },
        {
            word: "biased",
            word_translation: "有偏见的",
            sentence: "The teacher was biased and liked one student more.",
            translation: "老师有偏见，更喜欢一个学生。",
            type: "adjective"
        },
        {
            word: "borrow",
            word_translation: "借",
            sentence: "I want to borrow your book.",
            translation: "我想借你的书。",
            type: "verb"
        },
        {
            word: "control",
            word_translation: "控制",
            sentence: "He can't control his dog.",
            translation: "他控制不了他的狗。",
            type: "verb/noun"
        },
        {
            word: "disturbing",
            word_translation: "令人不安的",
            sentence: "That movie was disturbing.",
            translation: "那部电影令人不安。",
            type: "adjective"
        },
        {
            word: "expert",
            word_translation: "专家",
            sentence: "She is an expert at fixing computers.",
            translation: "她是修电脑的专家。",
            type: "noun"
        },
        {
            word: "expression",
            word_translation: "表情 / 表达",
            sentence: "Her expression looked happy.",
            translation: "她的表情看起来很开心。",
            type: "noun"
        },
        {
            word: "generous",
            word_translation: "慷慨的",
            sentence: "He is generous and gives food to others.",
            translation: "他很慷慨，会把食物分给别人。",
            type: "adjective"
        },
        {
            word: "headphones",
            word_translation: "耳机",
            sentence: "He is listening with his headphones.",
            translation: "他戴着耳机在听。",
            type: "noun"
        },
        {
            word: "jokes",
            word_translation: "笑话",
            sentence: "He likes to tell jokes.",
            translation: "他喜欢讲笑话。",
            type: "noun"
        },
        {
            word: "loud",
            word_translation: "响的 / 大声的",
            sentence: "The music is too loud.",
            translation: "音乐太响了。",
            type: "adjective"
        },
        {
            word: "minute",
            word_translation: "分钟",
            sentence: "Wait for one minute, please.",
            translation: "请等一分钟。",
            type: "noun"
        },
        {
            word: "pleasant",
            word_translation: "愉快的",
            sentence: "We had a pleasant lunch together.",
            translation: "我们一起吃了一顿愉快的午餐。",
            type: "adjective"
        },
        {
            word: "practical with money",
            word_translation: "会理财的",
            sentence: "She is practical with money and saves a lot.",
            translation: "她很会理财，存了很多钱。",
            type: "phrase"
        },
        {
            word: "pull",
            word_translation: "拉",
            sentence: "Pull the drawer to get your book.",
            translation: "拉开抽屉拿你的书。",
            type: "verb"
        },
        {
            word: "push",
            word_translation: "推",
            sentence: "Please push the door to open it.",
            translation: "请推门把它打开。",
            type: "verb"
        },
        {
            word: "tell",
            word_translation: "告诉",
            sentence: "I will tell you a story.",
            translation: "我会告诉你一个故事。",
            type: "verb"
        },
        {
            word: "toss and turn",
            word_translation: "辗转反侧",
            sentence: "I toss and turn at night when I can't sleep.",
            translation: "我晚上睡不着时会辗转反侧。",
            type: "phrase"
        }
    ],
    
    // Day 5: Words about activities and nature
    day5: [
        {
            word: "brave",
            word_translation: "勇敢的",
            sentence: "She is brave and helps others.",
            translation: "她很勇敢，会帮助别人。",
            type: "adjective"
        },
        {
            word: "cliff diving",
            word_translation: "跳崖",
            sentence: "Cliff diving looks scary but fun.",
            translation: "跳崖看起来很吓人但很好玩。",
            type: "noun"
        },
        {
            word: "duck",
            word_translation: "鸭子",
            sentence: "The duck is swimming in the pond.",
            translation: "鸭子在池塘里游泳。",
            type: "noun"
        },
        {
            word: "incredible",
            word_translation: "难以置信的 / 太棒了",
            sentence: "That show was incredible!",
            translation: "那个表演太棒了！",
            type: "adjective"
        },
        {
            word: "ladder",
            word_translation: "梯子",
            sentence: "He climbs the ladder.",
            translation: "他爬梯子。",
            type: "noun"
        },
        {
            word: "lungs",
            word_translation: "肺",
            sentence: "My lungs help me breathe.",
            translation: "我的肺帮我呼吸。",
            type: "noun"
        },
        {
            word: "mud",
            word_translation: "泥巴",
            sentence: "My shoes are dirty from the mud.",
            translation: "我的鞋子被泥巴弄脏了。",
            type: "noun"
        },
        {
            word: "photography",
            word_translation: "摄影",
            sentence: "He loves photography.",
            translation: "他喜欢摄影。",
            type: "noun"
        },
        {
            word: "roller coaster",
            word_translation: "过山车",
            sentence: "The roller coaster goes very fast.",
            translation: "过山车开得很快。",
            type: "noun"
        },
        {
            word: "skiing",
            word_translation: "滑雪",
            sentence: "I go skiing in winter.",
            translation: "我冬天去滑雪。",
            type: "noun"
        },
        {
            word: "throw",
            word_translation: "扔",
            sentence: "Please throw the ball to me.",
            translation: "请把球扔给我。",
            type: "verb"
        },
        {
            word: "tree roots",
            word_translation: "树根",
            sentence: "The tree roots are under the ground.",
            translation: "树根在地下。",
            type: "noun"
        },
        {
            word: "windsurfing",
            word_translation: "风帆冲浪",
            sentence: "Windsurfing is fun at the beach.",
            translation: "在海边风帆冲浪很好玩。",
            type: "noun"
        }
    ]
}; 