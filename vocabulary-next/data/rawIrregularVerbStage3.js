// Irregular Verbs Data - Stage 3: Action Verbs

const irregularVerbStage3 = [
    // run | ran | run
    {
        verb: "run", base: "run", past: "ran", participle: "run",
        sentence: "I usually {{blank}} in the park every morning before breakfast.",
        options: ["run", "runs", "ran", "running"],
        correct: "run"
    },
    {
        verb: "run", base: "run", past: "ran", participle: "run",
        sentence: "I {{blank}} five miles yesterday evening.",
        options: ["ran", "run", "runs", "running"],
        correct: "ran"
    },
    {
        verb: "run", base: "run", past: "ran", participle: "run",
        sentence: "I will {{blank}} with my friends tomorrow morning.",
        options: ["run", "ran", "runs", "running"],
        correct: "run"
    },
    {
        verb: "run", base: "run", past: "ran", participle: "run",
        sentence: "I have {{blank}} three races this year.",
        options: ["run", "ran", "runs", "running"],
        correct: "run"
    },

    // ride | rode | ridden
    {
        verb: "ride", base: "ride", past: "rode", participle: "ridden",
        sentence: "I usually {{blank}} my bike to school every day.",
        options: ["ride", "rides", "rode", "ridden"],
        correct: "ride"
    },
    {
        verb: "ride", base: "ride", past: "rode", participle: "ridden",
        sentence: "I {{blank}} my horse at the farm yesterday.",
        options: ["rode", "ride", "ridden", "riding"],
        correct: "rode"
    },
    {
        verb: "ride", base: "ride", past: "rode", participle: "ridden",
        sentence: "I will {{blank}} the bus to work tomorrow.",
        options: ["ride", "rode", "ridden", "riding"],
        correct: "ride"
    },
    {
        verb: "ride", base: "ride", past: "rode", participle: "ridden",
        sentence: "I have {{blank}} in a hot air balloon once in my life.",
        options: ["ridden", "ride", "rode", "riding"],
        correct: "ridden"
    },

    // drive | drove | driven
    {
        verb: "drive", base: "drive", past: "drove", participle: "driven",
        sentence: "I usually {{blank}} to work every morning at 8 a.m.",
        options: ["drive", "drives", "drove", "driven"],
        correct: "drive"
    },
    {
        verb: "drive", base: "drive", past: "drove", participle: "driven",
        sentence: "I {{blank}} to the countryside yesterday.",
        options: ["drove", "drive", "driven", "driving"],
        correct: "drove"
    },
    {
        verb: "drive", base: "drive", past: "drove", participle: "driven",
        sentence: "I will {{blank}} my parents to the airport tomorrow.",
        options: ["drive", "drove", "driven", "driving"],
        correct: "drive"
    },
    {
        verb: "drive", base: "drive", past: "drove", participle: "driven",
        sentence: "I have {{blank}} through many cities this month.",
        options: ["driven", "drive", "drove", "driving"],
        correct: "driven"
    },

    // swim | swam | swum
    {
        verb: "swim", base: "swim", past: "swam", participle: "swum",
        sentence: "I usually {{blank}} in the pool every weekend.",
        options: ["swim", "swims", "swam", "swum"],
        correct: "swim"
    },
    {
        verb: "swim", base: "swim", past: "swam", participle: "swum",
        sentence: "I {{blank}} at the beach yesterday afternoon.",
        options: ["swam", "swim", "swum", "swimming"],
        correct: "swam"
    },
    {
        verb: "swim", base: "swim", past: "swam", participle: "swum",
        sentence: "I will {{blank}} in the competition tomorrow.",
        options: ["swim", "swam", "swum", "swimming"],
        correct: "swim"
    },
    {
        verb: "swim", base: "swim", past: "swam", participle: "swum",
        sentence: "I have {{blank}} across this lake twice before.",
        options: ["swum", "swim", "swam", "swimming"],
        correct: "swum"
    },

    // fly | flew | flown
    {
        verb: "fly", base: "fly", past: "flew", participle: "flown",
        sentence: "I usually {{blank}} to New York for work every month.",
        options: ["fly", "flies", "flew", "flown"],
        correct: "fly"
    },
    {
        verb: "fly", base: "fly", past: "flew", participle: "flown",
        sentence: "I {{blank}} to Los Angeles yesterday.",
        options: ["flew", "fly", "flown", "flying"],
        correct: "flew"
    },
    {
        verb: "fly", base: "fly", past: "flew", participle: "flown",
        sentence: "I will {{blank}} to Chicago next week.",
        options: ["fly", "flew", "flown", "flying"],
        correct: "fly"
    },
    {
        verb: "fly", base: "fly", past: "flew", participle: "flown",
        sentence: "I have {{blank}} over the ocean many times in my life.",
        options: ["flown", "fly", "flew", "flying"],
        correct: "flown"
    },

    // draw | drew | drawn
    {
        verb: "draw", base: "draw", past: "drew", participle: "drawn",
        sentence: "I usually {{blank}} cartoons in my notebook every evening.",
        options: ["draw", "draws", "drew", "drawn"],
        correct: "draw"
    },
    {
        verb: "draw", base: "draw", past: "drew", participle: "drawn",
        sentence: "I {{blank}} a picture of my dog yesterday.",
        options: ["drew", "draw", "drawn", "drawing"],
        correct: "drew"
    },
    {
        verb: "draw", base: "draw", past: "drew", participle: "drawn",
        sentence: "I will {{blank}} a landscape tomorrow.",
        options: ["draw", "drew", "drawn", "drawing"],
        correct: "draw"
    },
    {
        verb: "draw", base: "draw", past: "drew", participle: "drawn",
        sentence: "I have {{blank}} many sketches this week.",
        options: ["drawn", "draw", "drew", "drawing"],
        correct: "drawn"
    },

    // break | broke | broken
    {
        verb: "break", base: "break", past: "broke", participle: "broken",
        sentence: "I usually {{blank}} my pencils when I press too hard while writing.",
        options: ["break", "breaks", "broke", "broken"],
        correct: "break"
    },
    {
        verb: "break", base: "break", past: "broke", participle: "broken",
        sentence: "I {{blank}} my phone yesterday by accident.",
        options: ["broke", "break", "broken", "breaking"],
        correct: "broke"
    },
    {
        verb: "break", base: "break", past: "broke", participle: "broken",
        sentence: "I will {{blank}} the bad news to my parents tomorrow.",
        options: ["break", "broke", "broken", "breaking"],
        correct: "break"
    },
    {
        verb: "break", base: "break", past: "broke", participle: "broken",
        sentence: "I have {{blank}} two glasses this month.",
        options: ["broken", "break", "broke", "breaking"],
        correct: "broken"
    },

    // wear | wore | worn
    {
        verb: "wear", base: "wear", past: "wore", participle: "worn",
        sentence: "I usually {{blank}} my school uniform every day.",
        options: ["wear", "wears", "wore", "worn"],
        correct: "wear"
    },
    {
        verb: "wear", base: "wear", past: "wore", participle: "worn",
        sentence: "I {{blank}} a new dress yesterday.",
        options: ["wore", "wear", "worn", "wearing"],
        correct: "wore"
    },
    {
        verb: "wear", base: "wear", past: "wore", participle: "worn",
        sentence: "I will {{blank}} my costume to the party tomorrow.",
        options: ["wear", "wore", "worn", "wearing"],
        correct: "wear"
    },
    {
        verb: "wear", base: "wear", past: "wore", participle: "worn",
        sentence: "I have {{blank}} this jacket all winter.",
        options: ["worn", "wear", "wore", "wearing"],
        correct: "worn"
    },

    // choose | chose | chosen
    {
        verb: "choose", base: "choose", past: "chose", participle: "chosen",
        sentence: "I usually {{blank}} a new book to read every week.",
        options: ["choose", "chooses", "chose", "chosen"],
        correct: "choose"
    },
    {
        verb: "choose", base: "choose", past: "chose", participle: "chosen",
        sentence: "I {{blank}} the red shirt yesterday.",
        options: ["chose", "choose", "chosen", "choosing"],
        correct: "chose"
    },
    {
        verb: "choose", base: "choose", past: "chose", participle: "chosen",
        sentence: "I will {{blank}} a college next year.",
        options: ["choose", "chose", "chosen", "choosing"],
        correct: "choose"
    },
    {
        verb: "choose", base: "choose", past: "chose", participle: "chosen",
        sentence: "I have {{blank}} my favorite restaurant already.",
        options: ["chosen", "choose", "chose", "choosing"],
        correct: "chosen"
    },

    // begin | began | begun
    {
        verb: "begin", base: "begin", past: "began", participle: "begun",
        sentence: "I usually {{blank}} my homework right after dinner every evening.",
        options: ["begin", "begins", "began", "begun"],
        correct: "begin"
    },
    {
        verb: "begin", base: "begin", past: "began", participle: "begun",
        sentence: "I {{blank}} my project yesterday evening.",
        options: ["began", "begin", "begun", "beginning"],
        correct: "began"
    },
    {
        verb: "begin", base: "begin", past: "began", participle: "begun",
        sentence: "I will {{blank}} my trip tomorrow morning.",
        options: ["begin", "began", "begun", "beginning"],
        correct: "begin"
    },
    {
        verb: "begin", base: "begin", past: "began", participle: "begun",
        sentence: "I have {{blank}} writing my essay already.",
        options: ["begun", "begin", "began", "beginning"],
        correct: "begun"
    },

    // fall | fell | fallen
    {
        verb: "fall", base: "fall", past: "fell", participle: "fallen",
        sentence: "I usually {{blank}} asleep early every night.",
        options: ["fall", "falls", "fell", "fallen"],
        correct: "fall"
    },
    {
        verb: "fall", base: "fall", past: "fell", participle: "fallen",
        sentence: "I {{blank}} on the icy stairs yesterday.",
        options: ["fell", "fall", "fallen", "falling"],
        correct: "fell"
    },
    {
        verb: "fall", base: "fall", past: "fell", participle: "fallen",
        sentence: "I will {{blank}} behind if I skip school tomorrow.",
        options: ["fall", "fell", "fallen", "falling"],
        correct: "fall"
    },
    {
        verb: "fall", base: "fall", past: "fell", participle: "fallen",
        sentence: "I have {{blank}} on this slippery path several times this winter.",
        options: ["fallen", "fall", "fell", "falling"],
        correct: "fallen"
    },

    // grow | grew | grown
    {
        verb: "grow", base: "grow", past: "grew", participle: "grown",
        sentence: "I usually {{blank}} tomatoes in my garden every summer.",
        options: ["grow", "grows", "grew", "grown"],
        correct: "grow"
    },
    {
        verb: "grow", base: "grow", past: "grew", participle: "grown",
        sentence: "I {{blank}} a sunflower last year.",
        options: ["grew", "grow", "grown", "growing"],
        correct: "grew"
    },
    {
        verb: "grow", base: "grow", past: "grew", participle: "grown",
        sentence: "I will {{blank}} a small tree in my yard next spring.",
        options: ["grow", "grew", "grown", "growing"],
        correct: "grow"
    },
    {
        verb: "grow", base: "grow", past: "grew", participle: "grown",
        sentence: "I have {{blank}} many plants this season.",
        options: ["grown", "grow", "grew", "growing"],
        correct: "grown"
    },

    // drink | drank | drunk
    {
        verb: "drink", base: "drink", past: "drank", participle: "drunk",
        sentence: "I usually {{blank}} a glass of water every morning with breakfast.",
        options: ["drink", "drinks", "drank", "drunk"],
        correct: "drink"
    },
    {
        verb: "drink", base: "drink", past: "drank", participle: "drunk",
        sentence: "I {{blank}} lemonade yesterday at lunch.",
        options: ["drank", "drink", "drunk", "drinking"],
        correct: "drank"
    },
    {
        verb: "drink", base: "drink", past: "drank", participle: "drunk",
        sentence: "I will {{blank}} coffee tomorrow morning.",
        options: ["drink", "drank", "drunk", "drinking"],
        correct: "drink"
    },
    {
        verb: "drink", base: "drink", past: "drank", participle: "drunk",
        sentence: "I have {{blank}} three cups of tea today already.",
        options: ["drunk", "drink", "drank", "drinking"],
        correct: "drunk"
    },

    // sing | sang | sung
    {
        verb: "sing", base: "sing", past: "sang", participle: "sung",
        sentence: "I usually {{blank}} in the school choir every Friday.",
        options: ["sing", "sings", "sang", "sung"],
        correct: "sing"
    },
    {
        verb: "sing", base: "sing", past: "sang", participle: "sung",
        sentence: "I {{blank}} my favorite song yesterday.",
        options: ["sang", "sing", "sung", "singing"],
        correct: "sang"
    },
    {
        verb: "sing", base: "sing", past: "sang", participle: "sung",
        sentence: "I will {{blank}} at the talent show tomorrow.",
        options: ["sing", "sang", "sung", "singing"],
        correct: "sing"
    },
    {
        verb: "sing", base: "sing", past: "sang", participle: "sung",
        sentence: "I have {{blank}} many songs this month.",
        options: ["sung", "sing", "sang", "singing"],
        correct: "sung"
    },

    // My brother usually {{blank}} his bike to school when the weather is nice.
    {
        verb: "ride", base: "ride", past: "rode", participle: "ridden",
        sentence: "My brother usually {{blank}} his bike to school when the weather is nice.",
        options: ["ride", "rides", "rode", "ridden"],
        correct: "rides"
    },

    // I usually {{blank}} to work instead of taking the bus.
    {
        verb: "drive", base: "drive", past: "drove", participle: "driven",
        sentence: "I usually {{blank}} to work instead of taking the bus.",
        options: ["drive", "drives", "drove", "driven"],
        correct: "drive"
    },

    // We usually {{blank}} in the ocean during our beach vacations.
    {
        verb: "swim", base: "swim", past: "swam", participle: "swum",
        sentence: "We usually {{blank}} in the ocean during our beach vacations.",
        options: ["swim", "swims", "swam", "swum"],
        correct: "swim"
    },

    // Birds usually {{blank}} south for the winter to find warmer weather.
    {
        verb: "fly", base: "fly", past: "flew", participle: "flown",
        sentence: "Birds usually {{blank}} south for the winter to find warmer weather.",
        options: ["fly", "flies", "flew", "flown"],
        correct: "fly"
    },

    // My daughter usually {{blank}} pictures of animals in her free time.
    {
        verb: "draw", base: "draw", past: "drew", participle: "drawn",
        sentence: "My daughter usually {{blank}} pictures of animals in her free time.",
        options: ["draw", "draws", "drew", "drawn"],
        correct: "draws"
    },

    // Children sometimes {{blank}} toys when they play too roughly.
    {
        verb: "break", base: "break", past: "broke", participle: "broken",
        sentence: "Children sometimes {{blank}} toys when they play too roughly.",
        options: ["break", "breaks", "broke", "broken"],
        correct: "break"
    },

    // I usually {{blank}} comfortable shoes when I know I'll be walking a lot.
    {
        verb: "wear", base: "wear", past: "wore", participle: "worn",
        sentence: "I usually {{blank}} comfortable shoes when I know I'll be walking a lot.",
        options: ["wear", "wears", "wore", "worn"],
        correct: "wear"
    },

    // I usually {{blank}} healthy options when I eat at restaurants.
    {
        verb: "choose", base: "choose", past: "chose", participle: "chosen",
        sentence: "I usually {{blank}} healthy options when I eat at restaurants.",
        options: ["choose", "chooses", "chose", "chosen"],
        correct: "choose"
    },

    // Classes usually {{blank}} at 8 AM at our school.
    {
        verb: "begin", base: "begin", past: "began", participle: "begun",
        sentence: "Classes usually {{blank}} at 8 AM at our school.",
        options: ["begin", "begins", "began", "begun"],
        correct: "begin"
    },

    // Leaves usually {{blank}} from the trees in autumn.
    {
        verb: "fall", base: "fall", past: "fell", participle: "fallen",
        sentence: "Leaves usually {{blank}} from the trees in autumn.",
        options: ["fall", "falls", "fell", "fallen"],
        correct: "fall"
    },

    // Plants usually {{blank}} faster during the spring and summer months.
    {
        verb: "grow", base: "grow", past: "grew", participle: "grown",
        sentence: "Plants usually {{blank}} faster during the spring and summer months.",
        options: ["grow", "grows", "grew", "grown"],
        correct: "grow"
    },

    // I usually {{blank}} water with my meals rather than soda.
    {
        verb: "drink", base: "drink", past: "drank", participle: "drunk",
        sentence: "I usually {{blank}} water with my meals rather than soda.",
        options: ["drink", "drinks", "drank", "drunk"],
        correct: "drink"
    },

    // The birds usually {{blank}} in the morning when the sun rises.
    {
        verb: "sing", base: "sing", past: "sang", participle: "sung",
        sentence: "The birds usually {{blank}} in the morning when the sun rises.",
        options: ["sing", "sings", "sang", "sung"],
        correct: "sing"
    }
];

export default irregularVerbStage3; 