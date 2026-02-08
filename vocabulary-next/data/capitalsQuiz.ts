import { Sentence } from './types';

export interface CapitalizationRule {
    ruleTitle: string;
    ruleTitleChinese: string;
    ruleExplanation?: string;
    ruleExplanationChinese?: string;
}

/** The 10 capitalization rules for the hint dialog. */
export const CAPITALIZATION_RULES: CapitalizationRule[] = [
    {
        ruleTitle: "1. The word \"I\" (for yourself)",
        ruleTitleChinese: "1. 单词 \"I\"（指代自己）",
    },
    {
        ruleTitle: "2. First letter of a sentence",
        ruleTitleChinese: "2. 句子的第一个字母",
    },
    {
        ruleTitle: "3. Name of a person (first and last names)",
        ruleTitleChinese: "3. 人的姓名（名和姓）",
    },
    {
        ruleTitle: "4. Name of a country or city",
        ruleTitleChinese: "4. 国家或城市的名称",
    },
    {
        ruleTitle: "5. Languages",
        ruleTitleChinese: "5. 语言",
    },
    {
        ruleTitle: "6. Months of the year",
        ruleTitleChinese: "6. 月份",
    },
    {
        ruleTitle: "7. Days of the week",
        ruleTitleChinese: "7. 星期",
    },
    {
        ruleTitle: "8. Names of places (e.g., Bellevue College, Target)",
        ruleTitleChinese: "8. 地点名称（例如：Bellevue College, Target）",
    },
    {
        ruleTitle: "9. Nationalities",
        ruleTitleChinese: "9. 国籍",
    },
    {
        ruleTitle: "10. Holiday",
        ruleTitleChinese: "10. 节日",
    },
];

export const capitalsQuizData: Sentence[] = [
    {
        "id": 1,
        "textIncorrect": "maria and lina live in japan now.",
        "textCorrect": "Maria and Lina live in Japan now.",
        "capitalWordIndexes": [
            0,
            2,
            5
        ]
    },
    {
        "id": 2,
        "textIncorrect": "we will visit london with our class tomorrow.",
        "textCorrect": "We will visit London with our class tomorrow.",
        "capitalWordIndexes": [
            0,
            3
        ]
    },
    {
        "id": 4,
        "textIncorrect": "they study english and math at bellevue college.",
        "textCorrect": "They study English and Math at Bellevue College.",
        "capitalWordIndexes": [
            0,
            2,
            4,
            6,
            7
        ]
    },
    {
        "id": 5,
        "textIncorrect": "i drink coffee from starbucks every friday morning.",
        "textCorrect": "I drink coffee from Starbucks every Friday morning.",
        "capitalWordIndexes": [
            0,
            4,
            6
        ]
    },
    {
        "id": 6,
        "textIncorrect": "our teacher mrs. lee is from korea.",
        "textCorrect": "Our teacher Mrs. Lee is from Korea.",
        "capitalWordIndexes": [
            0,
            2,
            3,
            6
        ]
    },
    {
        "id": 7,
        "textIncorrect": "he likes chinese food at the mall in seattle.",
        "textCorrect": "He likes Chinese food at the mall in Seattle.",
        "capitalWordIndexes": [
            0,
            2,
            8
        ]
    },
    {
        "id": 8,
        "textIncorrect": "we went to costco in bellevue last sunday.",
        "textCorrect": "We went to Costco in Bellevue last Sunday.",
        "capitalWordIndexes": [
            0,
            3,
            5,
            7
        ]
    },
    {
        "id": 10,
        "textIncorrect": "they speak spanish at home in mexico city.",
        "textCorrect": "They speak Spanish at home in Mexico City.",
        "capitalWordIndexes": [
            0,
            2,
            6,
            7
        ]
    },
    {
        "id": 11,
        "textIncorrect": "i have english class at bellevue college on monday.",
        "textCorrect": "I have English class at Bellevue College on Monday.",
        "capitalWordIndexes": [
            0,
            2,
            5,
            6,
            8
        ]
    },
    {
        "id": 12,
        "textIncorrect": "my friend anna works at microsoft in redmond.",
        "textCorrect": "My friend Anna works at Microsoft in Redmond.",
        "capitalWordIndexes": [
            0,
            2,
            5,
            7
        ]
    },
    {
        "id": 13,
        "textIncorrect": "we saw whales in alaska on our family trip.",
        "textCorrect": "We saw whales in Alaska on our family trip.",
        "capitalWordIndexes": [
            0,
            4
        ]
    },
    {
        "id": 15,
        "textIncorrect": "my sister wants to study in canada next year.",
        "textCorrect": "My sister wants to study in Canada next year.",
        "capitalWordIndexes": [
            0,
            6
        ]
    },
    {
        "id": 16,
        "textIncorrect": "they went to disneyland in california last summer.",
        "textCorrect": "They went to Disneyland in California last summer.",
        "capitalWordIndexes": [
            0,
            3,
            5
        ]
    },
    {
        "id": 17,
        "textIncorrect": "we eat sushi at a japanese restaurant in bellevue.",
        "textCorrect": "We eat sushi at a Japanese restaurant in Bellevue.",
        "capitalWordIndexes": [
            0,
            5,
            8
        ]
    },
    {
        "id": 18,
        "textIncorrect": "i was born in october in the united states.",
        "textCorrect": "I was born in October in the United States.",
        "capitalWordIndexes": [
            0,
            4,
            7,
            8
        ]
    },
    {
        "id": 19,
        "textIncorrect": "my cousin lives in paris and studies french.",
        "textCorrect": "My cousin lives in Paris and studies French.",
        "capitalWordIndexes": [
            0,
            4,
            7
        ]
    },
    {
        "id": 20,
        "textIncorrect": "they like american music and chinese movies.",
        "textCorrect": "They like American music and Chinese movies.",
        "capitalWordIndexes": [
            0,
            2,
            5
        ]
    },
    {
        "id": 22,
        "textIncorrect": "he is from brazil and speaks portuguese and english.",
        "textCorrect": "He is from Brazil and speaks Portuguese and English.",
        "capitalWordIndexes": [
            0,
            3,
            6,
            8
        ]
    },
    {
        "id": 23,
        "textIncorrect": "my mom bought fruit at walmart on tuesday morning.",
        "textCorrect": "My mom bought fruit at Walmart on Tuesday morning.",
        "capitalWordIndexes": [
            0,
            5,
            7
        ]
    },
    {
        "id": 24,
        "textIncorrect": "we will travel to italy with our parents someday.",
        "textCorrect": "We will travel to Italy with our parents someday.",
        "capitalWordIndexes": [
            0,
            4
        ]
    },
    {
        "id": 25,
        "textIncorrect": "she studies korean and japanese at night school.",
        "textCorrect": "She studies Korean and Japanese at night school.",
        "capitalWordIndexes": [
            0,
            2,
            4
        ]
    },
    {
        "id": 27,
        "textIncorrect": "my dad drives to amazon in seattle every weekday.",
        "textCorrect": "My dad drives to Amazon in Seattle every weekday.",
        "capitalWordIndexes": [
            0,
            4,
            6
        ]
    },
    {
        "id": 28,
        "textIncorrect": "we go skiing in december with our school friends.",
        "textCorrect": "We go skiing in December with our school friends.",
        "capitalWordIndexes": [
            0,
            4
        ]
    },
    {
        "id": 29,
        "textIncorrect": "he works at costco in seattle on weekends.",
        "textCorrect": "He works at Costco in Seattle on weekends.",
        "capitalWordIndexes": [
            0,
            3,
            5
        ]
    },
    {
        "id": 32,
        "textIncorrect": "we visited los angeles and went to the beach.",
        "textCorrect": "We visited Los Angeles and went to the beach.",
        "capitalWordIndexes": [
            0,
            2,
            3
        ]
    },
    {
        "id": 33,
        "textIncorrect": "she takes the bus to bellevue college every morning.",
        "textCorrect": "She takes the bus to Bellevue College every morning.",
        "capitalWordIndexes": [
            0,
            5,
            6
        ]
    },
    {
        "id": 37,
        "textIncorrect": "he lives in beijing and works at a hotel.",
        "textCorrect": "He lives in Beijing and works at a hotel.",
        "capitalWordIndexes": [
            0,
            3
        ]
    },
    {
        "id": 38,
        "textIncorrect": "my family moved from china to the united states.",
        "textCorrect": "My family moved from China to the United States.",
        "capitalWordIndexes": [
            0,
            4,
            7,
            8
        ]
    },
    {
        "id": 39,
        "textIncorrect": "they eat mexican food at a small cafe in town.",
        "textCorrect": "They eat Mexican food at a small cafe in town.",
        "capitalWordIndexes": [
            0,
            2
        ]
    },
    {
        "id": 40,
        "textIncorrect": "we went to target and bought snacks for christmas.",
        "textCorrect": "We went to Target and bought snacks for Christmas.",
        "capitalWordIndexes": [
            0,
            3,
            8
        ]
    },
    {
        "id": 41,
        "textIncorrect": "she visited london and paris during her summer vacation.",
        "textCorrect": "She visited London and Paris during her summer vacation.",
        "capitalWordIndexes": [
            0,
            2,
            4
        ]
    },
    {
        "id": 42,
        "textIncorrect": "my friend emily lives in japan with her husband.",
        "textCorrect": "My friend Emily lives in Japan with her husband.",
        "capitalWordIndexes": [
            0,
            2,
            5
        ]
    },
    {
        "id": 43,
        "textIncorrect": "they go to church in seattle every sunday morning.",
        "textCorrect": "They go to church in Seattle every Sunday morning.",
        "capitalWordIndexes": [
            0,
            5,
            7
        ]
    },
    {
        "id": 44,
        "textIncorrect": "we saw dolphins in hawaii on our spring break.",
        "textCorrect": "We saw dolphins in Hawaii on our spring break.",
        "capitalWordIndexes": [
            0,
            4
        ]
    },
    {
        "id": 45,
        "textIncorrect": "he likes french bread from the bakery near walmart.",
        "textCorrect": "He likes French bread from the bakery near Walmart.",
        "capitalWordIndexes": [
            0,
            2,
            8
        ]
    },
    {
        "id": 46,
        "textIncorrect": "my sister will start school at bellevue college in august.",
        "textCorrect": "My sister will start school at Bellevue College in August.",
        "capitalWordIndexes": [
            0,
            6,
            7,
            9
        ]
    },
    {
        "id": 47,
        "textIncorrect": "they travel to vietnam to visit family every year.",
        "textCorrect": "They travel to Vietnam to visit family every year.",
        "capitalWordIndexes": [
            0,
            3
        ]
    },
    {
        "id": 48,
        "textIncorrect": "we had dinner at panda express in the mall.",
        "textCorrect": "We had dinner at Panda Express in the mall.",
        "capitalWordIndexes": [
            0,
            4,
            5
        ]
    },
    {
        "id": 49,
        "textIncorrect": "she studies chinese on duolingo every night before bed.",
        "textCorrect": "She studies Chinese on Duolingo every night before bed.",
        "capitalWordIndexes": [
            0,
            2,
            4
        ]
    },
    {
        "id": 50,
        "textIncorrect": "my parents flew from seattle to new york last month.",
        "textCorrect": "My parents flew from Seattle to New York last month.",
        "capitalWordIndexes": [
            0,
            4,
            6,
            7
        ]
    },
    {
        "id": 52,
        "textIncorrect": "we bought tickets for a concert in seattle in july.",
        "textCorrect": "We bought tickets for a concert in Seattle in July.",
        "capitalWordIndexes": [
            0,
            7,
            9
        ]
    },
    {
        "id": 53,
        "textIncorrect": "he will visit his uncle in canada next spring.",
        "textCorrect": "He will visit his uncle in Canada next spring.",
        "capitalWordIndexes": [
            0,
            6
        ]
    },
    {
        "id": 54,
        "textIncorrect": "my friend david works at starbucks near bellevue park.",
        "textCorrect": "My friend David works at Starbucks near Bellevue Park.",
        "capitalWordIndexes": [
            0,
            2,
            5,
            7,
            8
        ]
    },
    {
        "id": 55,
        "textIncorrect": "they watched a soccer game from brazil on television.",
        "textCorrect": "They watched a soccer game from Brazil on television.",
        "capitalWordIndexes": [
            0,
            6
        ]
    },
    {
        "id": 56,
        "textIncorrect": "we celebrate thanksgiving with our family in november.",
        "textCorrect": "We celebrate Thanksgiving with our family in November.",
        "capitalWordIndexes": [
            0,
            2,
            7
        ]
    },
    {
        "id": 57,
        "textIncorrect": "she moved from germany to seattle two years ago.",
        "textCorrect": "She moved from Germany to Seattle two years ago.",
        "capitalWordIndexes": [
            0,
            3,
            5
        ]
    },
    {
        "id": 59,
        "textIncorrect": "they bought new shoes at nike in the outlet mall.",
        "textCorrect": "They bought new shoes at Nike in the outlet mall.",
        "capitalWordIndexes": [
            0,
            5
        ]
    },
    {
        "id": 60,
        "textIncorrect": "we took a trip to disney world in florida.",
        "textCorrect": "We took a trip to Disney World in Florida.",
        "capitalWordIndexes": [
            0,
            5,
            6,
            8
        ]
    },
    {
        "id": 61,
        "textIncorrect": "he likes italian pizza at a restaurant near bellevue college.",
        "textCorrect": "He likes Italian pizza at a restaurant near Bellevue College.",
        "capitalWordIndexes": [
            0,
            2,
            8,
            9
        ]
    },
    {
        "id": 63,
        "textIncorrect": "they rode the elevator to the top of the space needle.",
        "textCorrect": "They rode the elevator to the top of the Space Needle.",
        "capitalWordIndexes": [
            0,
            9,
            10
        ]
    },
    {
        "id": 64,
        "textIncorrect": "we met our teacher krista at a cafe in bellevue.",
        "textCorrect": "We met our teacher Krista at a cafe in Bellevue.",
        "capitalWordIndexes": [
            0,
            4,
            9
        ]
    },
    {
        "id": 65,
        "textIncorrect": "she got a new job at microsoft in redmond.",
        "textCorrect": "She got a new job at Microsoft in Redmond.",
        "capitalWordIndexes": [
            0,
            6,
            8
        ]
    },
    {
        "id": 66,
        "textIncorrect": "my brother learned spanish in high school in california.",
        "textCorrect": "My brother learned Spanish in high school in California.",
        "capitalWordIndexes": [
            0,
            3,
            8
        ]
    },
    {
        "id": 67,
        "textIncorrect": "they walked around downtown seattle on a rainy tuesday.",
        "textCorrect": "They walked around downtown Seattle on a rainy Tuesday.",
        "capitalWordIndexes": [
            0,
            4,
            8
        ]
    },
    {
        "id": 68,
        "textIncorrect": "we will visit hong kong with our classmates next year.",
        "textCorrect": "We will visit Hong Kong with our classmates next year.",
        "capitalWordIndexes": [
            0,
            3,
            4
        ]
    },
    {
        "id": 70,
        "textIncorrect": "they eat breakfast at mcdonald's before work on monday.",
        "textCorrect": "They eat breakfast at Mcdonald's before work on Monday.",
        "capitalWordIndexes": [
            0,
            4,
            8
        ]
    }
];
