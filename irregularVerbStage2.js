// Irregular Verbs Data - Stage 2: Everyday Verbs

const irregularVerbStage2 = [
    // feel | felt | felt
    {
        verb: "feel",
        base: "feel",
        past: "felt",
        participle: "felt",
        sentence: "I usually {{blank}} excited before my soccer games every weekend.",
        options: ["feel", "feels", "felt", "feeling"],
        correct: "feel"
    },
    {
        verb: "feel",
        base: "feel",
        past: "felt",
        participle: "felt",
        sentence: "I {{blank}} tired after hiking yesterday.",
        options: ["felt", "feel", "feels", "feeling"],
        correct: "felt"
    },
    {
        verb: "feel",
        base: "feel",
        past: "felt",
        participle: "felt",
        sentence: "I will {{blank}} proud after my exam tomorrow.",
        options: ["feel", "felt", "feels", "feeling"],
        correct: "feel"
    },
    {
        verb: "feel",
        base: "feel",
        past: "felt",
        participle: "felt",
        sentence: "I have {{blank}} nervous before every test this month.",
        options: ["felt", "feel", "feels", "feeling"],
        correct: "felt"
    },

    // bring | brought | brought
    {
        verb: "bring",
        base: "bring",
        past: "brought",
        participle: "brought",
        sentence: "I usually {{blank}} my notebook to class every day.",
        options: ["bring", "brings", "brought", "bringing"],
        correct: "bring"
    },
    {
        verb: "bring",
        base: "bring",
        past: "brought",
        participle: "brought",
        sentence: "I {{blank}} cookies to the party yesterday.",
        options: ["brought", "bring", "brings", "bringing"],
        correct: "brought"
    },
    {
        verb: "bring",
        base: "bring",
        past: "brought",
        participle: "brought",
        sentence: "I will {{blank}} extra clothes tomorrow for the trip.",
        options: ["bring", "brought", "brings", "bringing"],
        correct: "bring"
    },
    {
        verb: "bring",
        base: "bring",
        past: "brought",
        participle: "brought",
        sentence: "I have {{blank}} snacks for everyone already.",
        options: ["brought", "bring", "brings", "bringing"],
        correct: "brought"
    },

    // buy | bought | bought
    {
        verb: "buy",
        base: "buy",
        past: "bought",
        participle: "bought",
        sentence: "I usually {{blank}} fruits from the market every Saturday.",
        options: ["buy", "buys", "bought", "buying"],
        correct: "buy"
    },
    {
        verb: "buy",
        base: "buy",
        past: "bought",
        participle: "bought",
        sentence: "I {{blank}} a new backpack yesterday.",
        options: ["bought", "buy", "buys", "buying"],
        correct: "bought"
    },
    {
        verb: "buy",
        base: "buy",
        past: "bought",
        participle: "bought",
        sentence: "I will {{blank}} a gift for my friend tomorrow.",
        options: ["buy", "bought", "buys", "buying"],
        correct: "buy"
    },
    {
        verb: "buy",
        base: "buy",
        past: "bought",
        participle: "bought",
        sentence: "I have {{blank}} several books this week.",
        options: ["bought", "buy", "buys", "buying"],
        correct: "bought"
    },

    // build | built | built
    {
        verb: "build",
        base: "build",
        past: "built",
        participle: "built",
        sentence: "I usually {{blank}} models from kits every month.",
        options: ["build", "builds", "built", "building"],
        correct: "build"
    },
    {
        verb: "build",
        base: "build",
        past: "built",
        participle: "built",
        sentence: "I {{blank}} a treehouse with my dad yesterday.",
        options: ["built", "build", "builds", "building"],
        correct: "built"
    },
    {
        verb: "build",
        base: "build",
        past: "built",
        participle: "built",
        sentence: "I will {{blank}} a birdhouse tomorrow.",
        options: ["build", "built", "builds", "building"],
        correct: "build"
    },
    {
        verb: "build",
        base: "build",
        past: "built",
        participle: "built",
        sentence: "I have {{blank}} many projects at school this year.",
        options: ["built", "build", "builds", "building"],
        correct: "built"
    },

    // send | sent | sent
    {
        verb: "send",
        base: "send",
        past: "sent",
        participle: "sent",
        sentence: "I usually {{blank}} letters to my grandma every month.",
        options: ["send", "sends", "sent", "sending"],
        correct: "send"
    },
    {
        verb: "send",
        base: "send",
        past: "sent",
        participle: "sent",
        sentence: "I {{blank}} an email to my teacher yesterday.",
        options: ["sent", "send", "sends", "sending"],
        correct: "sent"
    },
    {
        verb: "send",
        base: "send",
        past: "sent",
        participle: "sent",
        sentence: "I will {{blank}} a package tomorrow.",
        options: ["send", "sent", "sends", "sending"],
        correct: "send"
    },
    {
        verb: "send",
        base: "send",
        past: "sent",
        participle: "sent",
        sentence: "I have {{blank}} all my applications already.",
        options: ["sent", "send", "sends", "sending"],
        correct: "sent"
    },

    // spend | spent | spent
    {
        verb: "spend",
        base: "spend",
        past: "spent",
        participle: "spent",
        sentence: "I usually {{blank}} one hour reading every night.",
        options: ["spend", "spends", "spent", "spending"],
        correct: "spend"
    },
    {
        verb: "spend",
        base: "spend",
        past: "spent",
        participle: "spent",
        sentence: "I {{blank}} the whole day at the beach yesterday.",
        options: ["spent", "spend", "spends", "spending"],
        correct: "spent"
    },
    {
        verb: "spend",
        base: "spend",
        past: "spent",
        participle: "spent",
        sentence: "I will {{blank}} the afternoon studying tomorrow.",
        options: ["spend", "spent", "spends", "spending"],
        correct: "spend"
    },
    {
        verb: "spend",
        base: "spend",
        past: "spent",
        participle: "spent",
        sentence: "I have {{blank}} a lot of time on this project this month.",
        options: ["spent", "spend", "spends", "spending"],
        correct: "spent"
    },

    // hear | heard | heard
    {
        verb: "hear",
        base: "hear",
        past: "heard",
        participle: "heard",
        sentence: "I usually {{blank}} birds singing every morning.",
        options: ["hear", "hears", "heard", "hearing"],
        correct: "hear"
    },
    {
        verb: "hear",
        base: "hear",
        past: "heard",
        participle: "heard",
        sentence: "I {{blank}} a strange noise last night.",
        options: ["heard", "hear", "hears", "hearing"],
        correct: "heard"
    },
    {
        verb: "hear",
        base: "hear",
        past: "heard",
        participle: "heard",
        sentence: "I will {{blank}} the concert tomorrow.",
        options: ["hear", "heard", "hears", "hearing"],
        correct: "hear"
    },
    {
        verb: "hear",
        base: "hear",
        past: "heard",
        participle: "heard",
        sentence: "I have {{blank}} this song many times this year.",
        options: ["heard", "hear", "hears", "hearing"],
        correct: "heard"
    },

    // keep | kept | kept
    {
        verb: "keep",
        base: "keep",
        past: "kept",
        participle: "kept",
        sentence: "I usually {{blank}} my room clean every day.",
        options: ["keep", "keeps", "kept", "keeping"],
        correct: "keep"
    },
    {
        verb: "keep",
        base: "keep",
        past: "kept",
        participle: "kept",
        sentence: "I {{blank}} a diary when I was younger.",
        options: ["kept", "keep", "keeps", "keeping"],
        correct: "kept"
    },
    {
        verb: "keep",
        base: "keep",
        past: "kept",
        participle: "kept",
        sentence: "I will {{blank}} this secret for you starting tomorrow.",
        options: ["keep", "kept", "keeps", "keeping"],
        correct: "keep"
    },
    {
        verb: "keep",
        base: "keep",
        past: "kept",
        participle: "kept",
        sentence: "I have {{blank}} every birthday card I've received since childhood.",
        options: ["kept", "keep", "keeps", "keeping"],
        correct: "kept"
    },

    // meet | met | met
    {
        verb: "meet",
        base: "meet",
        past: "met",
        participle: "met",
        sentence: "I usually {{blank}} new people at work every week.",
        options: ["meet", "meets", "met", "meeting"],
        correct: "meet"
    },
    {
        verb: "meet",
        base: "meet",
        past: "met",
        participle: "met",
        sentence: "I {{blank}} my best friend at school yesterday.",
        options: ["met", "meet", "meets", "meeting"],
        correct: "met"
    },
    {
        verb: "meet",
        base: "meet",
        past: "met",
        participle: "met",
        sentence: "I will {{blank}} my cousin tomorrow afternoon.",
        options: ["meet", "met", "meets", "meeting"],
        correct: "meet"
    },
    {
        verb: "meet",
        base: "meet",
        past: "met",
        participle: "met",
        sentence: "I have {{blank}} many interesting people this month.",
        options: ["met", "meet", "meets", "meeting"],
        correct: "met"
    },

    // sit | sat | sat
    {
        verb: "sit",
        base: "sit",
        past: "sat",
        participle: "sat",
        sentence: "I usually {{blank}} by the window in class every day.",
        options: ["sit", "sits", "sat", "sitting"],
        correct: "sit"
    },
    {
        verb: "sit",
        base: "sit",
        past: "sat",
        participle: "sat",
        sentence: "I {{blank}} on the grass during the picnic yesterday.",
        options: ["sat", "sit", "sits", "sitting"],
        correct: "sat"
    },
    {
        verb: "sit",
        base: "sit",
        past: "sat",
        participle: "sat",
        sentence: "I will {{blank}} near the front at tomorrow's concert.",
        options: ["sit", "sat", "sits", "sitting"],
        correct: "sit"
    },
    {
        verb: "sit",
        base: "sit",
        past: "sat",
        participle: "sat",
        sentence: "I have {{blank}} at this desk all morning today.",
        options: ["sat", "sit", "sits", "sitting"],
        correct: "sat"
    },

    // stand | stood | stood
    {
        verb: "stand",
        base: "stand",
        past: "stood",
        participle: "stood",
        sentence: "I usually {{blank}} in line for coffee every morning.",
        options: ["stand", "stands", "stood", "standing"],
        correct: "stand"
    },
    {
        verb: "stand",
        base: "stand",
        past: "stood",
        participle: "stood",
        sentence: "I {{blank}} under a tree yesterday to avoid the rain.",
        options: ["stood", "stand", "stands", "standing"],
        correct: "stood"
    },
    {
        verb: "stand",
        base: "stand",
        past: "stood",
        participle: "stood",
        sentence: "I will {{blank}} near the entrance tomorrow.",
        options: ["stand", "stood", "stands", "standing"],
        correct: "stand"
    },
    {
        verb: "stand",
        base: "stand",
        past: "stood",
        participle: "stood",
        sentence: "I have {{blank}} here many times in the past.",
        options: ["stood", "stand", "stands", "standing"],
        correct: "stood"
    },

    // lose | lost | lost
    {
        verb: "lose",
        base: "lose",
        past: "lost",
        participle: "lost",
        sentence: "I usually {{blank}} my keys when I'm in a hurry.",
        options: ["lose", "loses", "lost", "losing"],
        correct: "lose"
    },
    {
        verb: "lose",
        base: "lose",
        past: "lost",
        participle: "lost",
        sentence: "I {{blank}} my wallet yesterday in the mall.",
        options: ["lost", "lose", "loses", "losing"],
        correct: "lost"
    },
    {
        verb: "lose",
        base: "lose",
        past: "lost",
        participle: "lost",
        sentence: "I will {{blank}} weight if I exercise regularly, starting tomorrow.",
        options: ["lose", "lost", "loses", "losing"],
        correct: "lose"
    },
    {
        verb: "lose",
        base: "lose",
        past: "lost",
        participle: "lost",
        sentence: "I have {{blank}} my phone once this month.",
        options: ["lost", "lose", "loses", "losing"],
        correct: "lost"
    },

    // pay | paid | paid
    {
        verb: "pay",
        base: "pay",
        past: "paid",
        participle: "paid",
        sentence: "I usually {{blank}} for my lunch every day.",
        options: ["pay", "pays", "paid", "paying"],
        correct: "pay"
    },
    {
        verb: "pay",
        base: "pay",
        past: "paid",
        participle: "paid",
        sentence: "I {{blank}} for my movie ticket yesterday.",
        options: ["paid", "pay", "pays", "paying"],
        correct: "paid"
    },
    {
        verb: "pay",
        base: "pay",
        past: "paid",
        participle: "paid",
        sentence: "I will {{blank}} my phone bill tomorrow.",
        options: ["pay", "paid", "pays", "paying"],
        correct: "pay"
    },
    {
        verb: "pay",
        base: "pay",
        past: "paid",
        participle: "paid",
        sentence: "I have {{blank}} all my bills this month.",
        options: ["paid", "pay", "pays", "paying"],
        correct: "paid"
    },

    // teach | taught | taught
    {
        verb: "teach",
        base: "teach",
        past: "taught",
        participle: "taught",
        sentence: "I usually {{blank}} my little brother to ride a bike every weekend.",
        options: ["teach", "teaches", "taught", "teaching"],
        correct: "teach"
    },
    {
        verb: "teach",
        base: "teach",
        past: "taught",
        participle: "taught",
        sentence: "I {{blank}} my cousin to swim yesterday.",
        options: ["taught", "teach", "teaches", "teaching"],
        correct: "taught"
    },
    {
        verb: "teach",
        base: "teach",
        past: "taught",
        participle: "taught",
        sentence: "I will {{blank}} you how to cook tomorrow.",
        options: ["teach", "taught", "teaches", "teaching"],
        correct: "teach"
    },
    {
        verb: "teach",
        base: "teach",
        past: "taught",
        participle: "taught",
        sentence: "I have {{blank}} many children this year.",
        options: ["taught", "teach", "teaches", "teaching"],
        correct: "taught"
    },

    // catch | caught | caught
    {
        verb: "catch",
        base: "catch",
        past: "caught",
        participle: "caught",
        sentence: "I usually {{blank}} the bus at 7 a.m. every morning.",
        options: ["catch", "catches", "caught", "catching"],
        correct: "catch"
    },
    {
        verb: "catch",
        base: "catch",
        past: "caught",
        participle: "caught",
        sentence: "I {{blank}} a cold yesterday after getting wet in the rain.",
        options: ["caught", "catch", "catches", "catching"],
        correct: "caught"
    },
    {
        verb: "catch",
        base: "catch",
        past: "caught",
        participle: "caught",
        sentence: "I will {{blank}} the early train tomorrow.",
        options: ["catch", "caught", "catches", "catching"],
        correct: "catch"
    },
    {
        verb: "catch",
        base: "catch",
        past: "caught",
        participle: "caught",
        sentence: "I have {{blank}} many errors in my work this week.",
        options: ["caught", "catch", "catches", "catching"],
        correct: "caught"
    }
];

// Make data available globally
window.irregularVerbStage2 = irregularVerbStage2; 