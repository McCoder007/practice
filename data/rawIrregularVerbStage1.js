// Irregular Verbs Data - Stage 1: Core Verbs

const irregularVerbStage1 = [
    // be | was/were | been
    {
        verb: "be",
        base: "be",
        past: "was/were",
        participle: "been",
        sentence: "Every morning I {{blank}} at the library before work.",
        options: ["am", "be", "was", "been"],
        correct: "am"
    },
    {
        verb: "be",
        base: "be",
        past: "was/were",
        participle: "been",
        sentence: "Yesterday I {{blank}} at the park for a walk.",
        options: ["was", "were", "be", "been"],
        correct: "was"
    },
    {
        verb: "be",
        base: "be",
        past: "was/were",
        participle: "been",
        sentence: "Tomorrow morning I {{blank}} at the meeting.",
        options: ["will be", "be", "was", "been"],
        correct: "will be"
    },
    {
        verb: "be",
        base: "be",
        past: "was/were",
        participle: "been",
        sentence: "I have {{blank}} very busy with school projects this week.",
        options: ["been", "be", "was", "being"],
        correct: "been"
    },
    {
        verb: "be",
        base: "be",
        past: "was/were",
        participle: "been",
        sentence: "I usually {{blank}} happy when I spend time with my friends.",
        options: ["am", "is", "are", "be"],
        correct: "am"
    },

    // have | had | had
    {
        verb: "have",
        base: "have",
        past: "had",
        participle: "had",
        sentence: "I usually {{blank}} breakfast at 7 a.m. every day.",
        options: ["have", "has", "had", "having"],
        correct: "have"
    },
    {
        verb: "have",
        base: "have",
        past: "had",
        participle: "had",
        sentence: "She usually {{blank}} breakfast at 7 AM every morning.",
        options: ["has", "have", "had", "having"],
        correct: "has"
    },
    {
        verb: "have",
        base: "have",
        past: "had",
        participle: "had",
        sentence: "I have {{blank}} a cold for three days now.",
        options: ["had", "have", "has", "having"],
        correct: "had"
    },

    // go | went | gone
    {
        verb: "go",
        base: "go",
        past: "went",
        participle: "gone",
        sentence: "I usually {{blank}} to the gym every morning before work.",
        options: ["go", "goes", "went", "gone"],
        correct: "go"
    },
    {
        verb: "go",
        base: "go",
        past: "went",
        participle: "gone",
        sentence: "Yesterday I {{blank}} to the zoo with my family.",
        options: ["went", "go", "gone", "going"],
        correct: "went"
    },
    {
        verb: "go",
        base: "go",
        past: "went",
        participle: "gone",
        sentence: "Tomorrow I {{blank}} shopping with my sister.",
        options: ["will go", "go", "went", "gone"],
        correct: "will go"
    },
    {
        verb: "go",
        base: "go",
        past: "went",
        participle: "gone",
        sentence: "We usually {{blank}} to the beach during summer vacation.",
        options: ["go", "goes", "went", "gone"],
        correct: "go"
    },
    {
        verb: "go",
        base: "go",
        past: "went",
        participle: "gone",
        sentence: "I have {{blank}} to the museum several times this year.",
        options: ["gone", "go", "went", "going"],
        correct: "gone"
    },

    // come | came | come
    {
        verb: "come",
        base: "come",
        past: "came",
        participle: "come",
        sentence: "I usually {{blank}} to this cafe every Saturday morning.",
        options: ["come", "comes", "came", "coming"],
        correct: "come"
    },
    {
        verb: "come",
        base: "come",
        past: "came",
        participle: "come",
        sentence: "I {{blank}} to the meeting early yesterday.",
        options: ["came", "come", "comes", "coming"],
        correct: "came"
    },
    {
        verb: "come",
        base: "come",
        past: "came",
        participle: "come",
        sentence: "I will {{blank}} to your party tomorrow evening.",
        options: ["come", "came", "comes", "coming"],
        correct: "come"
    },
    {
        verb: "come",
        base: "come",
        past: "came",
        participle: "come",
        sentence: "I have {{blank}} here many times this month.",
        options: ["come", "came", "comes", "coming"],
        correct: "come"
    },
    {
        verb: "come",
        base: "come",
        past: "came",
        participle: "come",
        sentence: "My cousins usually {{blank}} to visit us during the holidays.",
        options: ["come", "comes", "came", "coming"],
        correct: "comes"
    },

    // do | did | done
    {
        verb: "do",
        base: "do",
        past: "did",
        participle: "done",
        sentence: "I usually {{blank}} my homework after dinner every night.",
        options: ["do", "does", "did", "done"],
        correct: "do"
    },
    {
        verb: "do",
        base: "do",
        past: "did",
        participle: "done",
        sentence: "I usually {{blank}} my homework right after school.",
        options: ["do", "does", "did", "done"],
        correct: "do"
    },
    {
        verb: "do",
        base: "do",
        past: "did",
        participle: "done",
        sentence: "I will {{blank}} my best in the competition tomorrow.",
        options: ["do", "did", "done", "doing"],
        correct: "do"
    },
    {
        verb: "do",
        base: "do",
        past: "did",
        participle: "done",
        sentence: "I have {{blank}} three assignments already this week.",
        options: ["done", "do", "did", "doing"],
        correct: "done"
    },

    // get | got | gotten
    {
        verb: "get",
        base: "get",
        past: "got",
        participle: "gotten",
        sentence: "I usually {{blank}} new books from the library every month.",
        options: ["get", "gets", "got", "gotten"],
        correct: "get"
    },
    {
        verb: "get",
        base: "get",
        past: "got",
        participle: "gotten",
        sentence: "I {{blank}} a gift from my friend yesterday.",
        options: ["got", "get", "gotten", "getting"],
        correct: "got"
    },
    {
        verb: "get",
        base: "get",
        past: "got",
        participle: "gotten",
        sentence: "I will {{blank}} a haircut tomorrow afternoon.",
        options: ["get", "got", "gotten", "getting"],
        correct: "get"
    },
    {
        verb: "get",
        base: "get",
        past: "got",
        participle: "gotten",
        sentence: "I have {{blank}} better at swimming this summer.",
        options: ["gotten", "get", "got", "getting"],
        correct: "gotten"
    },

    // make | made | made
    {
        verb: "make",
        base: "make",
        past: "made",
        participle: "made",
        sentence: "I usually {{blank}} sandwiches for lunch every day.",
        options: ["make", "makes", "made", "making"],
        correct: "make"
    },
    {
        verb: "make",
        base: "make",
        past: "made",
        participle: "made",
        sentence: "I {{blank}} a cake for my mom's birthday yesterday.",
        options: ["made", "make", "makes", "making"],
        correct: "made"
    },
    {
        verb: "make",
        base: "make",
        past: "made",
        participle: "made",
        sentence: "I will {{blank}} a painting tomorrow at art class.",
        options: ["make", "made", "makes", "making"],
        correct: "make"
    },
    {
        verb: "make",
        base: "make",
        past: "made",
        participle: "made",
        sentence: "My mom usually {{blank}} dinner for the family every evening.",
        options: ["make", "makes", "made", "making"],
        correct: "makes"
    },

    // see | saw | seen
    {
        verb: "see",
        base: "see",
        past: "saw",
        participle: "seen",
        sentence: "I usually {{blank}} my grandparents every Sunday afternoon.",
        options: ["see", "sees", "saw", "seen"],
        correct: "see"
    },
    {
        verb: "see",
        base: "see",
        past: "saw",
        participle: "seen",
        sentence: "I {{blank}} a rainbow yesterday after the rain.",
        options: ["saw", "see", "seen", "seeing"],
        correct: "saw"
    },
    {
        verb: "see",
        base: "see",
        past: "saw",
        participle: "seen",
        sentence: "I will {{blank}} my cousins at the picnic tomorrow.",
        options: ["see", "saw", "seen", "seeing"],
        correct: "see"
    },
    {
        verb: "see",
        base: "see",
        past: "saw",
        participle: "seen",
        sentence: "I have {{blank}} that movie three times already.",
        options: ["seen", "see", "saw", "seeing"],
        correct: "seen"
    },
    {
        verb: "see",
        base: "see",
        past: "saw",
        participle: "seen",
        sentence: "I usually {{blank}} my grandparents on weekends.",
        options: ["see", "sees", "saw", "seen"],
        correct: "see"
    },

    // say | said | said
    {
        verb: "say",
        base: "say",
        past: "said",
        participle: "said",
        sentence: "I usually {{blank}} 'good morning' to my teacher every day.",
        options: ["say", "says", "said", "saying"],
        correct: "say"
    },
    {
        verb: "say",
        base: "say",
        past: "said",
        participle: "said",
        sentence: "I {{blank}} 'thank you' to the bus driver yesterday.",
        options: ["said", "say", "says", "saying"],
        correct: "said"
    },
    {
        verb: "say",
        base: "say",
        past: "said",
        participle: "said",
        sentence: "I will {{blank}} hello to everyone tomorrow.",
        options: ["say", "said", "says", "saying"],
        correct: "say"
    },
    {
        verb: "say",
        base: "say",
        past: "said",
        participle: "said",
        sentence: "I have {{blank}} that many times this week.",
        options: ["said", "say", "says", "saying"],
        correct: "said"
    },
    {
        verb: "say",
        base: "say",
        past: "said",
        participle: "said",
        sentence: "My mother usually {{blank}} that honesty is the best policy.",
        options: ["say", "says", "said", "saying"],
        correct: "says"
    },

    // take | took | taken
    {
        verb: "take",
        base: "take",
        past: "took",
        participle: "taken",
        sentence: "I usually {{blank}} the bus to school every morning.",
        options: ["take", "takes", "took", "taken"],
        correct: "take"
    },
    {
        verb: "take",
        base: "take",
        past: "took",
        participle: "taken",
        sentence: "I {{blank}} a long walk in the park yesterday.",
        options: ["took", "take", "taken", "taking"],
        correct: "took"
    },
    {
        verb: "take",
        base: "take",
        past: "took",
        participle: "taken",
        sentence: "I will {{blank}} a vacation next month.",
        options: ["take", "took", "taken", "taking"],
        correct: "take"
    },
    {
        verb: "take",
        base: "take",
        past: "took",
        participle: "taken",
        sentence: "I usually {{blank}} notes during my science class.",
        options: ["take", "takes", "took", "taken"],
        correct: "take"
    },
    {
        verb: "take",
        base: "take",
        past: "took",
        participle: "taken",
        sentence: "I have {{blank}} many photos this week.",
        options: ["taken", "take", "took", "taking"],
        correct: "taken"
    },

    // give | gave | given
    {
        verb: "give",
        base: "give",
        past: "gave",
        participle: "given",
        sentence: "I usually {{blank}} my dog a treat every evening.",
        options: ["give", "gives", "gave", "given"],
        correct: "give"
    },
    {
        verb: "give",
        base: "give",
        past: "gave",
        participle: "given",
        sentence: "I {{blank}} my mom flowers yesterday.",
        options: ["gave", "give", "given", "giving"],
        correct: "gave"
    },
    {
        verb: "give",
        base: "give",
        past: "gave",
        participle: "given",
        sentence: "I will {{blank}} you the book tomorrow.",
        options: ["give", "gave", "given", "giving"],
        correct: "give"
    },
    {
        verb: "give",
        base: "give",
        past: "gave",
        participle: "given",
        sentence: "I have {{blank}} all my old toys to charity.",
        options: ["given", "give", "gave", "giving"],
        correct: "given"
    },
    {
        verb: "give",
        base: "give",
        past: "gave",
        participle: "given",
        sentence: "My teacher usually {{blank}} us homework on Fridays.",
        options: ["give", "gives", "gave", "given"],
        correct: "gives"
    },

    // find | found | found
    {
        verb: "find",
        base: "find",
        past: "found",
        participle: "found",
        sentence: "I usually {{blank}} interesting books at the library every week.",
        options: ["find", "finds", "found", "finding"],
        correct: "find"
    },
    {
        verb: "find",
        base: "find",
        past: "found",
        participle: "found",
        sentence: "I {{blank}} a lost wallet yesterday in the park.",
        options: ["found", "find", "finds", "finding"],
        correct: "found"
    },
    {
        verb: "find",
        base: "find",
        past: "found",
        participle: "found",
        sentence: "I will {{blank}} a good restaurant tomorrow.",
        options: ["find", "found", "finds", "finding"],
        correct: "find"
    },
    {
        verb: "find",
        base: "find",
        past: "found",
        participle: "found",
        sentence: "I have {{blank}} my keys already today.",
        options: ["found", "find", "finds", "finding"],
        correct: "found"
    },
    {
        verb: "find",
        base: "find",
        past: "found",
        participle: "found",
        sentence: "People usually {{blank}} it difficult to wake up early on Mondays.",
        options: ["find", "finds", "found", "finding"],
        correct: "find"
    },

    // think | thought | thought
    {
        verb: "think",
        base: "think",
        past: "thought",
        participle: "thought",
        sentence: "I usually {{blank}} about my goals every morning.",
        options: ["think", "thinks", "thought", "thinking"],
        correct: "think"
    },
    {
        verb: "think",
        base: "think",
        past: "thought",
        participle: "thought",
        sentence: "I {{blank}} about my vacation plans yesterday.",
        options: ["thought", "think", "thinks", "thinking"],
        correct: "thought"
    },
    {
        verb: "think",
        base: "think",
        past: "thought",
        participle: "thought",
        sentence: "I will {{blank}} about your idea tomorrow.",
        options: ["think", "thought", "thinks", "thinking"],
        correct: "think"
    },
    {
        verb: "think",
        base: "think",
        past: "thought",
        participle: "thought",
        sentence: "I have {{blank}} about this problem all week.",
        options: ["thought", "think", "thinks", "thinking"],
        correct: "thought"
    },
    {
        verb: "think",
        base: "think",
        past: "thought",
        participle: "thought",
        sentence: "I usually {{blank}} about my plans for the weekend on Friday mornings.",
        options: ["think", "thinks", "thought", "thinking"],
        correct: "think"
    },

    // tell | told | told
    {
        verb: "tell",
        base: "tell",
        past: "told",
        participle: "told",
        sentence: "I usually {{blank}} my parents about my day every night.",
        options: ["tell", "tells", "told", "telling"],
        correct: "tell"
    },
    {
        verb: "tell",
        base: "tell",
        past: "told",
        participle: "told",
        sentence: "I {{blank}} my friend a funny story yesterday.",
        options: ["told", "tell", "tells", "telling"],
        correct: "told"
    },
    {
        verb: "tell",
        base: "tell",
        past: "told",
        participle: "told",
        sentence: "I will {{blank}} you the news tomorrow.",
        options: ["tell", "told", "tells", "telling"],
        correct: "tell"
    },
    {
        verb: "tell",
        base: "tell",
        past: "told",
        participle: "told",
        sentence: "I have {{blank}} the teacher everything already.",
        options: ["told", "tell", "tells", "telling"],
        correct: "told"
    },
    {
        verb: "tell",
        base: "tell",
        past: "told",
        participle: "told",
        sentence: "My father usually {{blank}} us stories before bedtime.",
        options: ["tell", "tells", "told", "telling"],
        correct: "tells"
    },

    // become | became | become
    {
        verb: "become",
        base: "become",
        past: "became",
        participle: "become",
        sentence: "I usually {{blank}} sleepy after lunch every day.",
        options: ["become", "becomes", "became", "becoming"],
        correct: "become"
    },
    {
        verb: "become",
        base: "become",
        past: "became",
        participle: "become",
        sentence: "I {{blank}} very happy after hearing the good news yesterday.",
        options: ["became", "become", "becomes", "becoming"],
        correct: "became"
    },
    {
        verb: "become",
        base: "become",
        past: "became",
        participle: "become",
        sentence: "I will {{blank}} a doctor in the future.",
        options: ["become", "became", "becomes", "becoming"],
        correct: "become"
    },
    {
        verb: "become",
        base: "become",
        past: "became",
        participle: "become",
        sentence: "I have {{blank}} more confident this year.",
        options: ["become", "became", "becomes", "becoming"],
        correct: "become"
    },

    // leave | left | left
    {
        verb: "leave",
        base: "leave",
        past: "left",
        participle: "left",
        sentence: "I usually {{blank}} the house at 8 a.m. every morning.",
        options: ["leave", "leaves", "left", "leaving"],
        correct: "leave"
    },
    {
        verb: "leave",
        base: "leave",
        past: "left",
        participle: "left",
        sentence: "I {{blank}} my umbrella at school yesterday.",
        options: ["left", "leave", "leaves", "leaving"],
        correct: "left"
    },
    {
        verb: "leave",
        base: "leave",
        past: "left",
        participle: "left",
        sentence: "I will {{blank}} for vacation tomorrow morning.",
        options: ["leave", "left", "leaves", "leaving"],
        correct: "leave"
    },
    {
        verb: "leave",
        base: "leave",
        past: "left",
        participle: "left",
        sentence: "I have {{blank}} my bag at home many times.",
        options: ["left", "leave", "leaves", "leaving"],
        correct: "left"
    },

    // put | put | put
    {
        verb: "put",
        base: "put",
        past: "put",
        participle: "put",
        sentence: "I usually {{blank}} my keys on the table when I come home.",
        options: ["put", "puts", "putting", "putted"],
        correct: "put"
    },
];

export default irregularVerbStage1; 