// Irregular Verbs Data - Stage 4: Less Common Verbs

const irregularVerbStage4 = [
    // eat | ate | eaten
    {
        verb: "eat", base: "eat", past: "ate", participle: "eaten",
        sentence: "I usually {{blank}} breakfast at 7 a.m. every morning.",
        options: ["eat", "eats", "ate", "eaten"],
        correct: "eat"
    },
    {
        verb: "eat", base: "eat", past: "ate", participle: "eaten",
        sentence: "I {{blank}} pizza with friends yesterday.",
        options: ["ate", "eat", "eaten", "eating"],
        correct: "ate"
    },
    {
        verb: "eat", base: "eat", past: "ate", participle: "eaten",
        sentence: "I will {{blank}} cake at the party tomorrow.",
        options: ["eat", "ate", "eaten", "eating"],
        correct: "eat"
    },
    {
        verb: "eat", base: "eat", past: "ate", participle: "eaten",
        sentence: "I have {{blank}} sushi twice this week.",
        options: ["eaten", "eat", "ate", "eating"],
        correct: "eaten"
    },

    // speak | spoke | spoken
    {
        verb: "speak", base: "speak", past: "spoke", participle: "spoken",
        sentence: "I usually {{blank}} with my teacher every afternoon after class.",
        options: ["speak", "speaks", "spoke", "spoken"],
        correct: "speak"
    },
    {
        verb: "speak", base: "speak", past: "spoke", participle: "spoken",
        sentence: "I {{blank}} to my cousin on the phone yesterday.",
        options: ["spoke", "speak", "spoken", "speaking"],
        correct: "spoke"
    },
    {
        verb: "speak", base: "speak", past: "spoke", participle: "spoken",
        sentence: "I will {{blank}} at the meeting tomorrow.",
        options: ["speak", "spoke", "spoken", "speaking"],
        correct: "speak"
    },
    {
        verb: "speak", base: "speak", past: "spoke", participle: "spoken",
        sentence: "I have {{blank}} to many customers today.",
        options: ["spoken", "speak", "spoke", "speaking"],
        correct: "spoken"
    },

    // write | wrote | written
    {
        verb: "write", base: "write", past: "wrote", participle: "written",
        sentence: "I usually {{blank}} in my journal every night before bed.",
        options: ["write", "writes", "wrote", "written"],
        correct: "write"
    },
    {
        verb: "write", base: "write", past: "wrote", participle: "written",
        sentence: "I {{blank}} a letter to my friend yesterday.",
        options: ["wrote", "write", "written", "writing"],
        correct: "wrote"
    },
    {
        verb: "write", base: "write", past: "wrote", participle: "written",
        sentence: "I will {{blank}} a poem tomorrow morning.",
        options: ["write", "wrote", "written", "writing"],
        correct: "write"
    },
    {
        verb: "write", base: "write", past: "wrote", participle: "written",
        sentence: "I have {{blank}} five essays this semester.",
        options: ["written", "write", "wrote", "writing"],
        correct: "written"
    },

    // forget | forgot | forgotten
    {
        verb: "forget", base: "forget", past: "forgot", participle: "forgotten",
        sentence: "I usually {{blank}} my keys sometimes when I am in a hurry.",
        options: ["forget", "forgets", "forgot", "forgotten"],
        correct: "forget"
    },
    {
        verb: "forget", base: "forget", past: "forgot", participle: "forgotten",
        sentence: "I {{blank}} my homework yesterday.",
        options: ["forgot", "forget", "forgotten", "forgetting"],
        correct: "forgot"
    },
    {
        verb: "forget", base: "forget", past: "forgot", participle: "forgotten",
        sentence: "I will {{blank}} all my worries tomorrow during vacation.",
        options: ["forget", "forgot", "forgotten", "forgetting"],
        correct: "forget"
    },
    {
        verb: "forget", base: "forget", past: "forgot", participle: "forgotten",
        sentence: "I have {{blank}} my password once this month.",
        options: ["forgotten", "forget", "forgot", "forgetting"],
        correct: "forgotten"
    },

    // freeze | froze | frozen
    {
        verb: "freeze", base: "freeze", past: "froze", participle: "frozen",
        sentence: "I usually {{blank}} leftovers every weekend for future meals.",
        options: ["freeze", "freezes", "froze", "frozen"],
        correct: "freeze"
    },
    {
        verb: "freeze", base: "freeze", past: "froze", participle: "frozen",
        sentence: "I {{blank}} some fruit yesterday for smoothies.",
        options: ["froze", "freeze", "frozen", "freezing"],
        correct: "froze"
    },
    {
        verb: "freeze", base: "freeze", past: "froze", participle: "frozen",
        sentence: "I will {{blank}} the cake tomorrow before decorating it.",
        options: ["freeze", "froze", "frozen", "freezing"],
        correct: "freeze"
    },
    {
        verb: "freeze", base: "freeze", past: "froze", participle: "frozen",
        sentence: "I have {{blank}} vegetables for winter storage.",
        options: ["frozen", "freeze", "froze", "freezing"],
        correct: "frozen"
    },

    // hide | hid | hidden
    {
        verb: "hide", base: "hide", past: "hid", participle: "hidden",
        sentence: "I usually {{blank}} my diary under my bed every night.",
        options: ["hide", "hides", "hid", "hidden"],
        correct: "hide"
    },
    {
        verb: "hide", base: "hide", past: "hid", participle: "hidden",
        sentence: "I {{blank}} the gift yesterday before the party.",
        options: ["hid", "hide", "hidden", "hiding"],
        correct: "hid"
    },
    {
        verb: "hide", base: "hide", past: "hid", participle: "hidden",
        sentence: "I will {{blank}} the treasure tomorrow for the scavenger hunt.",
        options: ["hide", "hid", "hidden", "hiding"],
        correct: "hide"
    },
    {
        verb: "hide", base: "hide", past: "hid", participle: "hidden",
        sentence: "I have {{blank}} my money safely in a secret spot.",
        options: ["hidden", "hide", "hid", "hiding"],
        correct: "hidden"
    },

    // steal | stole | stolen
    {
        verb: "steal", base: "steal", past: "stole", participle: "stolen",
        sentence: "I usually {{blank}} glances at the clock during class when I'm bored.",
        options: ["steal", "steals", "stole", "stolen"],
        correct: "steal"
    },
    {
        verb: "steal", base: "steal", past: "stole", participle: "stolen",
        sentence: "I {{blank}} a cookie from the jar yesterday when no one was looking.",
        options: ["stole", "steal", "stolen", "stealing"],
        correct: "stole"
    },
    {
        verb: "steal", base: "steal", past: "stole", participle: "stolen",
        sentence: "I will {{blank}} a look at the answers tomorrow before the test.",
        options: ["steal", "stole", "stolen", "stealing"],
        correct: "steal"
    },
    {
        verb: "steal", base: "steal", past: "stole", participle: "stolen",
        sentence: "I have {{blank}} some quiet moments today despite my busy schedule.",
        options: ["stolen", "steal", "stole", "stealing"],
        correct: "stolen"
    },

    // shake | shook | shaken
    {
        verb: "shake", base: "shake", past: "shook", participle: "shaken",
        sentence: "I usually {{blank}} the juice bottle before drinking it every time.",
        options: ["shake", "shakes", "shook", "shaken"],
        correct: "shake"
    },
    {
        verb: "shake", base: "shake", past: "shook", participle: "shaken",
        sentence: "I {{blank}} hands with my teacher yesterday after the presentation.",
        options: ["shook", "shake", "shaken", "shaking"],
        correct: "shook"
    },
    {
        verb: "shake", base: "shake", past: "shook", participle: "shaken",
        sentence: "I will {{blank}} the rug tomorrow to clean it.",
        options: ["shake", "shook", "shaken", "shaking"],
        correct: "shake"
    },
    {
        verb: "shake", base: "shake", past: "shook", participle: "shaken",
        sentence: "I have {{blank}} the bottle already, so it's ready to pour.",
        options: ["shaken", "shake", "shook", "shaking"],
        correct: "shaken"
    },

    // ring | rang | rung
    {
        verb: "ring", base: "ring", past: "rang", participle: "rung",
        sentence: "I usually {{blank}} the doorbell when I visit my friends' houses.",
        options: ["ring", "rings", "rang", "rung"],
        correct: "ring"
    },
    {
        verb: "ring", base: "ring", past: "rang", participle: "rung",
        sentence: "I {{blank}} the bell yesterday afternoon to get attention.",
        options: ["rang", "ring", "rung", "ringing"],
        correct: "rang"
    },
    {
        verb: "ring", base: "ring", past: "rang", participle: "rung",
        sentence: "I will {{blank}} the doorbell tomorrow when I arrive.",
        options: ["ring", "rang", "rung", "ringing"],
        correct: "ring"
    },
    {
        verb: "ring", base: "ring", past: "rang", participle: "rung",
        sentence: "I have {{blank}} the bell many times but no one answered.",
        options: ["rung", "ring", "rang", "ringing"],
        correct: "rung"
    },

    // shoot | shot | shot
    {
        verb: "shoot", base: "shoot", past: "shot", participle: "shot",
        sentence: "I usually {{blank}} basketballs at the park every weekend for practice.",
        options: ["shoot", "shoots", "shot", "shooting"],
        correct: "shoot"
    },
    {
        verb: "shoot", base: "shoot", past: "shot", participle: "shot",
        sentence: "I {{blank}} five baskets yesterday during the game.",
        options: ["shot", "shoot", "shoots", "shooting"],
        correct: "shot"
    },
    {
        verb: "shoot", base: "shoot", past: "shot", participle: "shot",
        sentence: "I will {{blank}} some videos tomorrow at the beach.",
        options: ["shoot", "shot", "shoots", "shooting"],
        correct: "shoot"
    },
    {
        verb: "shoot", base: "shoot", past: "shot", participle: "shot",
        sentence: "I have {{blank}} many photos this month for my project.",
        options: ["shot", "shoot", "shoots", "shooting"],
        correct: "shot"
    },

    // lay | laid | laid
    {
        verb: "lay", base: "lay", past: "laid", participle: "laid",
        sentence: "Every night, I {{blank}} my clothes out for the next day.",
        options: ["lay", "lays", "laid", "laying"],
        correct: "lay"
    },
    {
        verb: "lay", base: "lay", past: "laid", participle: "laid",
        sentence: "I {{blank}} the blanket on the grass yesterday for our picnic.",
        options: ["laid", "lay", "lays", "laying"],
        correct: "laid"
    },
    {
        verb: "lay", base: "lay", past: "laid", participle: "laid",
        sentence: "I will {{blank}} out my clothes tomorrow for the interview.",
        options: ["lay", "laid", "lays", "laying"],
        correct: "lay"
    },
    {
        verb: "lay", base: "lay", past: "laid", participle: "laid",
        sentence: "I have {{blank}} the table many times for family dinners.",
        options: ["laid", "lay", "lays", "laying"],
        correct: "laid"
    },

    // light | lit | lit
    {
        verb: "light", base: "light", past: "lit", participle: "lit",
        sentence: "I usually {{blank}} a candle every evening to relax.",
        options: ["light", "lights", "lit", "lighting"],
        correct: "light"
    },
    {
        verb: "light", base: "light", past: "lit", participle: "lit",
        sentence: "I {{blank}} a fire in the fireplace yesterday when it was cold.",
        options: ["lit", "light", "lights", "lighting"],
        correct: "lit"
    },
    {
        verb: "light", base: "light", past: "lit", participle: "lit",
        sentence: "I will {{blank}} fireworks tomorrow night for the celebration.",
        options: ["light", "lit", "lights", "lighting"],
        correct: "light"
    },
    {
        verb: "light", base: "light", past: "lit", participle: "lit",
        sentence: "I have {{blank}} candles for every birthday party I've hosted.",
        options: ["lit", "light", "lights", "lighting"],
        correct: "lit"
    },

    // lend | lent | lent
    {
        verb: "lend", base: "lend", past: "lent", participle: "lent",
        sentence: "I usually {{blank}} my books to classmates every week when they ask.",
        options: ["lend", "lends", "lent", "lending"],
        correct: "lend"
    },
    {
        verb: "lend", base: "lend", past: "lent", participle: "lent",
        sentence: "I {{blank}} my umbrella to a friend yesterday during the rainstorm.",
        options: ["lent", "lend", "lends", "lending"],
        correct: "lent"
    },
    {
        verb: "lend", base: "lend", past: "lent", participle: "lent",
        sentence: "I will {{blank}} my car to my brother tomorrow for his trip.",
        options: ["lend", "lent", "lends", "lending"],
        correct: "lend"
    },
    {
        verb: "lend", base: "lend", past: "lent", participle: "lent",
        sentence: "I have {{blank}} money to friends many times in the past.",
        options: ["lent", "lend", "lends", "lending"],
        correct: "lent"
    },

    // sweep | swept | swept
    {
        verb: "sweep", base: "sweep", past: "swept", participle: "swept",
        sentence: "I usually {{blank}} the kitchen floor every morning after breakfast.",
        options: ["sweep", "sweeps", "swept", "sweeping"],
        correct: "sweep"
    },
    {
        verb: "sweep", base: "sweep", past: "swept", participle: "swept",
        sentence: "I {{blank}} the porch yesterday afternoon before guests arrived.",
        options: ["swept", "sweep", "sweeps", "sweeping"],
        correct: "swept"
    },
    {
        verb: "sweep", base: "sweep", past: "swept", participle: "swept",
        sentence: "I will {{blank}} the garage tomorrow during spring cleaning.",
        options: ["sweep", "swept", "sweeps", "sweeping"],
        correct: "sweep"
    },
    {
        verb: "sweep", base: "sweep", past: "swept", participle: "swept",
        sentence: "I have {{blank}} the whole house today in preparation for visitors.",
        options: ["swept", "sweep", "sweeps", "sweeping"],
        correct: "swept"
    }
];

export default irregularVerbStage4; 