// Irregular Verbs Data - Stage 5: Master Level Verbs

const irregularVerbStage5 = [
    // shrink | shrank | shrunk
    {
        verb: "shrink", base: "shrink", past: "shrank", participle: "shrunk",
        sentence: "I usually {{blank}} my wool clothes by washing them in hot water if I'm not careful.",
        options: ["shrink", "shrinks", "shrank", "shrunk"],
        correct: "shrink"
    },
    {
        verb: "shrink", base: "shrink", past: "shrank", participle: "shrunk",
        sentence: "My sweater {{blank}} yesterday in the hot wash cycle.",
        options: ["shrank", "shrink", "shrunk", "shrinking"],
        correct: "shrank"
    },
    {
        verb: "shrink", base: "shrink", past: "shrank", participle: "shrunk",
        sentence: "I will {{blank}} this fabric tomorrow if I don't use cold water.",
        options: ["shrink", "shrank", "shrunk", "shrinking"],
        correct: "shrink"
    },
    {
        verb: "shrink", base: "shrink", past: "shrank", participle: "shrunk",
        sentence: "My jeans have {{blank}} after many washes in hot water.",
        options: ["shrunk", "shrink", "shrank", "shrinking"],
        correct: "shrunk"
    },

    // spring | sprang | sprung
    {
        verb: "spring", base: "spring", past: "sprang", participle: "sprung",
        sentence: "I usually {{blank}} out of bed as soon as my alarm rings each morning.",
        options: ["spring", "springs", "sprang", "sprung"],
        correct: "spring"
    },
    {
        verb: "spring", base: "spring", past: "sprang", participle: "sprung",
        sentence: "I {{blank}} up to answer the door yesterday when the bell rang.",
        options: ["sprang", "spring", "sprung", "springing"],
        correct: "sprang"
    },
    {
        verb: "spring", base: "spring", past: "sprang", participle: "sprung",
        sentence: "I will {{blank}} into action tomorrow morning when I hear the announcement.",
        options: ["spring", "sprang", "sprung", "springing"],
        correct: "spring"
    },
    {
        verb: "spring", base: "spring", past: "sprang", participle: "sprung",
        sentence: "I have {{blank}} into action during emergencies many times in my career.",
        options: ["sprung", "spring", "sprang", "springing"],
        correct: "sprung"
    },

    // sting | stung | stung
    {
        verb: "sting", base: "sting", past: "stung", participle: "stung",
        sentence: "Some plants {{blank}} my hands when I touch them without gloves.",
        options: ["sting", "stings", "stung", "stinging"],
        correct: "sting"
    },
    {
        verb: "sting", base: "sting", past: "stung", participle: "stung",
        sentence: "A bee {{blank}} me yesterday while I was gardening.",
        options: ["stung", "sting", "stings", "stinging"],
        correct: "stung"
    },
    {
        verb: "sting", base: "sting", past: "stung", participle: "stung",
        sentence: "This nettle will {{blank}} me tomorrow if I don't wear my gloves.",
        options: ["sting", "stings", "stung", "stinging"],
        correct: "sting"
    },
    {
        verb: "sting", base: "sting", past: "stung", participle: "stung",
        sentence: "I have been {{blank}} by bees twice this summer already.",
        options: ["stung", "sting", "stings", "stinging"],
        correct: "stung",
        note: "Using passive voice with 'been' + past participle"
    },
    {
        verb: "sting", base: "sting", past: "stung", participle: "stung",
        sentence: "The bees usually {{blank}} when their hive is disturbed or threatened.",
        options: ["sting", "stings", "stung", "stinging"],
        correct: "sting"
    },

    // swear | swore | sworn
    {
        verb: "swear", base: "swear", past: "swore", participle: "sworn",
        sentence: "I usually {{blank}} to tell the truth when I'm in serious situations.",
        options: ["swear", "swears", "swore", "sworn"],
        correct: "swear"
    },
    {
        verb: "swear", base: "swear", past: "swore", participle: "sworn",
        sentence: "I {{blank}} to keep the secret yesterday when my friend told me.",
        options: ["swore", "swear", "sworn", "swearing"],
        correct: "swore"
    },
    {
        verb: "swear", base: "swear", past: "swore", participle: "sworn",
        sentence: "I will {{blank}} an oath tomorrow at the citizenship ceremony.",
        options: ["swear", "swore", "sworn", "swearing"],
        correct: "swear"
    },
    {
        verb: "swear", base: "swear", past: "swore", participle: "sworn",
        sentence: "I have {{blank}} to always be honest in my professional dealings.",
        options: ["sworn", "swear", "swore", "swearing"],
        correct: "sworn"
    },

    // blow | blew | blown
    {
        verb: "blow", base: "blow", past: "blew", participle: "blown",
        sentence: "Strong winds usually {{blank}} through this valley in the winter months.",
        options: ["blow", "blows", "blew", "blown"],
        correct: "blow"
    },
    {
        verb: "blow", base: "blow", past: "blew", participle: "blown",
        sentence: "I {{blank}} out all twenty candles yesterday at my party.",
        options: ["blew", "blow", "blown", "blowing"],
        correct: "blew"
    },
    {
        verb: "blow", base: "blow", past: "blew", participle: "blown",
        sentence: "I will {{blank}} leaves off the driveway tomorrow with a leaf blower.",
        options: ["blow", "blew", "blown", "blowing"],
        correct: "blow"
    },
    {
        verb: "blow", base: "blow", past: "blew", participle: "blown",
        sentence: "I have {{blank}} up hundreds of balloons for parties in my life.",
        options: ["blown", "blow", "blew", "blowing"],
        correct: "blown"
    },

    // bleed | bled | bled
    {
        verb: "bleed", base: "bleed", past: "bled", participle: "bled",
        sentence: "I usually {{blank}} quite a bit when I get a paper cut on my finger.",
        options: ["bleed", "bleeds", "bled", "bleeding"],
        correct: "bleed"
    },
    {
        verb: "bleed", base: "bleed", past: "bled", participle: "bled",
        sentence: "My knee {{blank}} heavily yesterday after I fell on the rocks.",
        options: ["bled", "bleed", "bleeds", "bleeding"],
        correct: "bled"
    },
    {
        verb: "bleed", base: "bleed", past: "bled", participle: "bled",
        sentence: "This cut will {{blank}} again tomorrow if I don't keep it bandaged.",
        options: ["bleed", "bleeds", "bled", "bleeding"],
        correct: "bleed"
    },
    {
        verb: "bleed", base: "bleed", past: "bled", participle: "bled",
        sentence: "My gums have {{blank}} every time I floss this week.",
        options: ["bled", "bleed", "bleeds", "bleeding"],
        correct: "bled"
    },

    // breed | bred | bred
    {
        verb: "breed", base: "breed", past: "bred", participle: "bred",
        sentence: "My neighbor {{blank}} rabbits as a hobby every year.",
        options: ["breeds", "breed", "bred", "breeding"],
        correct: "breeds",
        note: "Using third person singular form for factual sentences"
    },
    {
        verb: "breed", base: "breed", past: "bred", participle: "bred",
        sentence: "The farmers {{blank}} several rare chicken varieties last year.",
        options: ["bred", "breed", "breeds", "breeding"],
        correct: "bred",
        note: "Using third person plural form for clarity"
    },
    {
        verb: "breed", base: "breed", past: "bred", participle: "bred",
        sentence: "The zoo will {{blank}} endangered pandas next spring.",
        options: ["breed", "bred", "breeds", "breeding"],
        correct: "breed",
        note: "Using third person subject for clarity"
    },
    {
        verb: "breed", base: "breed", past: "bred", participle: "bred",
        sentence: "Our farm has {{blank}} many prize horses over the decades.",
        options: ["bred", "breed", "breeds", "breeding"],
        correct: "bred",
        note: "Using third person subject for clarity"
    },
    {
        verb: "breed", base: "breed", past: "bred", participle: "bred",
        sentence: "These rare birds usually {{blank}} only once per year in protected areas.",
        options: ["breed", "breeds", "bred", "breeding"],
        correct: "breed"
    },

    // cling | clung | clung
    {
        verb: "cling", base: "cling", past: "clung", participle: "clung",
        sentence: "I {{blank}} to my backpack tightly on crowded buses and trains.",
        options: ["cling", "clings", "clung", "clinging"],
        correct: "cling"
    },
    {
        verb: "cling", base: "cling", past: "clung", participle: "clung",
        sentence: "I {{blank}} to the railing yesterday during the storm.",
        options: ["clung", "cling", "clings", "clinging"],
        correct: "clung"
    },
    {
        verb: "cling", base: "cling", past: "clung", participle: "clung",
        sentence: "I will {{blank}} to the rope tomorrow during the climbing exercise.",
        options: ["cling", "clung", "clings", "clinging"],
        correct: "cling"
    },
    {
        verb: "cling", base: "cling", past: "clung", participle: "clung",
        sentence: "I have {{blank}} to my dreams all year despite difficulties.",
        options: ["clung", "cling", "clings", "clinging"],
        correct: "clung"
    },
    {
        verb: "cling", base: "cling", past: "clung", participle: "clung",
        sentence: "Young children usually {{blank}} to their parents in unfamiliar situations.",
        options: ["cling", "clings", "clung", "clinging"],
        correct: "cling"
    },

    // creep | crept | crept
    {
        verb: "creep", base: "creep", past: "crept", participle: "crept",
        sentence: "I {{blank}} quietly into my room at night so I don't wake others.",
        options: ["creep", "creeps", "crept", "creeping"],
        correct: "creep"
    },
    {
        verb: "creep", base: "creep", past: "crept", participle: "crept",
        sentence: "I {{blank}} into the house yesterday after missing curfew.",
        options: ["crept", "creep", "creeps", "creeping"],
        correct: "crept"
    },
    {
        verb: "creep", base: "creep", past: "crept", participle: "crept",
        sentence: "I will {{blank}} out early tomorrow to avoid waking my roommates.",
        options: ["creep", "crept", "creeps", "creeping"],
        correct: "creep"
    },
    {
        verb: "creep", base: "creep", past: "crept", participle: "crept",
        sentence: "I have {{blank}} past sleeping dogs many times while delivering mail.",
        options: ["crept", "creep", "creeps", "creeping"],
        correct: "crept"
    },
    {
        verb: "creep", base: "creep", past: "crept", participle: "crept",
        sentence: "Ivy usually {{blank}} up the walls of old buildings over many years.",
        options: ["creep", "creeps", "crept", "creeping"],
        correct: "creeps"
    },

    // deal | dealt | dealt
    {
        verb: "deal", base: "deal", past: "dealt", participle: "dealt",
        sentence: "I {{blank}} with difficult emails first thing every morning.",
        options: ["deal", "deals", "dealt", "dealing"],
        correct: "deal"
    },
    {
        verb: "deal", base: "deal", past: "dealt", participle: "dealt",
        sentence: "I {{blank}} with a challenging customer complaint yesterday.",
        options: ["dealt", "deal", "deals", "dealing"],
        correct: "dealt"
    },
    {
        verb: "deal", base: "deal", past: "dealt", participle: "dealt",
        sentence: "I will {{blank}} with the billing error tomorrow when the office opens.",
        options: ["deal", "dealt", "deals", "dealing"],
        correct: "deal"
    },
    {
        verb: "deal", base: "deal", past: "dealt", participle: "dealt",
        sentence: "I have {{blank}} with many difficult situations in my career.",
        options: ["dealt", "deal", "deals", "dealing"],
        correct: "dealt"
    },
    {
        verb: "deal", base: "deal", past: "dealt", participle: "dealt",
        sentence: "My grandmother usually {{blank}} the cards when we play games on family nights.",
        options: ["deal", "deals", "dealt", "dealing"],
        correct: "deals"
    },

    // flee | fled | fled
    {
        verb: "flee", base: "flee", past: "fled", participle: "fled",
        sentence: "Birds {{blank}} from danger when they sense predators nearby.",
        options: ["flee", "flees", "fled", "fleeing"],
        correct: "flee",
        note: "Using third person plural for a general truth statement"
    },
    {
        verb: "flee", base: "flee", past: "fled", participle: "fled",
        sentence: "The hikers {{blank}} from a thunderstorm yesterday afternoon.",
        options: ["fled", "flee", "flees", "fleeing"],
        correct: "fled",
        note: "Using third person plural for clarity"
    },
    {
        verb: "flee", base: "flee", past: "fled", participle: "fled",
        sentence: "We will {{blank}} to the basement if a tornado warning is issued tomorrow.",
        options: ["flee", "fled", "flees", "fleeing"],
        correct: "flee",
        note: "Using first person plural for clarity"
    },
    {
        verb: "flee", base: "flee", past: "fled", participle: "fled",
        sentence: "Many animals usually {{blank}} from danger when they sense a predator nearby.",
        options: ["flee", "flees", "fled", "fleeing"],
        correct: "flee"
    },

    // grind | ground | ground
    {
        verb: "grind", base: "grind", past: "ground", participle: "ground",
        sentence: "I usually {{blank}} my coffee beans fresh every morning for the best flavor.",
        options: ["grind", "grinds", "ground", "grinding"],
        correct: "grind"
    },
    {
        verb: "grind", base: "grind", past: "ground", participle: "ground",
        sentence: "I {{blank}} the spices yesterday for the special dinner.",
        options: ["ground", "grind", "grinds", "grinding"],
        correct: "ground"
    },
    {
        verb: "grind", base: "grind", past: "ground", participle: "ground",
        sentence: "I will {{blank}} wheat tomorrow for fresh flour.",
        options: ["grind", "ground", "grinds", "grinding"],
        correct: "grind"
    },
    {
        verb: "grind", base: "grind", past: "ground", participle: "ground",
        sentence: "I have {{blank}} fresh coffee every day this week.",
        options: ["ground", "grind", "grinds", "grinding"],
        correct: "ground"
    },

    // wring | wrung | wrung
    {
        verb: "wring", base: "wring", past: "wrung", participle: "wrung",
        sentence: "I {{blank}} out wet towels by hand after swimming.",
        options: ["wring", "wrings", "wrung", "wringing"],
        correct: "wring"
    },
    {
        verb: "wring", base: "wring", past: "wrung", participle: "wrung",
        sentence: "I {{blank}} the cloth thoroughly yesterday to remove all the water.",
        options: ["wrung", "wring", "wrings", "wringing"],
        correct: "wrung"
    },
    {
        verb: "wring", base: "wring", past: "wrung", participle: "wrung",
        sentence: "I will {{blank}} out my wet clothes tomorrow after the rain.",
        options: ["wring", "wrung", "wrings", "wringing"],
        correct: "wring"
    },
    {
        verb: "wring", base: "wring", past: "wrung", participle: "wrung",
        sentence: "I have {{blank}} out many shirts by hand when traveling.",
        options: ["wrung", "wring", "wrings", "wringing"],
        correct: "wrung"
    },
    {
        verb: "wring", base: "wring", past: "wrung", participle: "wrung",
        sentence: "I usually {{blank}} out wet clothes by hand before hanging them to dry.",
        options: ["wring", "wrings", "wrung", "wringing"],
        correct: "wring"
    },

    // sew | sewed | sewn
    {
        verb: "sew", base: "sew", past: "sewed", participle: "sewn",
        sentence: "I {{blank}} clothes as a hobby on weekends.",
        options: ["sew", "sews", "sewed", "sewn"],
        correct: "sew"
    },
    {
        verb: "sew", base: "sew", past: "sewed", participle: "sewn",
        sentence: "I {{blank}} a dress yesterday for the upcoming party.",
        options: ["sewed", "sew", "sewn", "sewing"],
        correct: "sewed"
    },
    {
        verb: "sew", base: "sew", past: "sewed", participle: "sewn",
        sentence: "I will {{blank}} a pillow tomorrow for the new couch.",
        options: ["sew", "sewed", "sewn", "sewing"],
        correct: "sew"
    },
    {
        verb: "sew", base: "sew", past: "sewed", participle: "sewn",
        sentence: "I have {{blank}} many costumes this year for the theater production.",
        options: ["sewn", "sew", "sewed", "sewing"],
        correct: "sewn"
    },
    {
        verb: "sew", base: "sew", past: "sewed", participle: "sewn",
        sentence: "My grandmother usually {{blank}} beautiful dresses for special occasions.",
        options: ["sew", "sews", "sewed", "sewn"],
        correct: "sews"
    },

    // overthrow | overthrew | overthrown
    {
        verb: "overthrow", base: "overthrow", past: "overthrew", participle: "overthrown",
        sentence: "Revolutionaries {{blank}} governments when citizens demand change.",
        options: ["overthrow", "overthrows", "overthrew", "overthrowing"],
        correct: "overthrow",
        note: "Using third person plural for a general statement"
    },
    {
        verb: "overthrow", base: "overthrow", past: "overthrew", participle: "overthrown",
        sentence: "The coach {{blank}} the old training system yesterday after the loss.",
        options: ["overthrew", "overthrow", "overthrown", "overthrowing"],
        correct: "overthrew",
        note: "Using third person singular subject for clarity"
    },
    {
        verb: "overthrow", base: "overthrow", past: "overthrew", participle: "overthrown",
        sentence: "We will {{blank}} the old regulations tomorrow at the board meeting.",
        options: ["overthrow", "overthrew", "overthrown", "overthrowing"],
        correct: "overthrow",
        note: "Using first person plural for clarity"
    },
    {
        verb: "overthrow", base: "overthrow", past: "overthrew", participle: "overthrown",
        sentence: "The team has {{blank}} their rivals in every competition this season.",
        options: ["overthrown", "overthrow", "overthrew", "overthrowing"],
        correct: "overthrown",
        note: "Using third person subject for clarity"
    },
    {
        verb: "overthrow", base: "overthrow", past: "overthrew", participle: "overthrown",
        sentence: "Rebels usually {{blank}} governments when there is widespread discontent.",
        options: ["overthrow", "overthrows", "overthrew", "overthrown"],
        correct: "overthrow"
    }
];

// Make data available globally
window.irregularVerbStage5 = irregularVerbStage5;

export default irregularVerbStage5 