// Level 2 Data: Slightly more complex preposition practice
// A small step up from Level 1, introducing more prepositions and slightly longer sentences

const level2Data = [
    // Section 1: Original sentences with blanks in lineA
    {
        lineA: "I'm looking {{blank}} my keys. Have you seen them?",
        lineB: "Did you check your pocket?",
        options: ["for", "at", "on"],
        correct: "for"
    },
    {
        lineA: "She's waiting {{blank}} the bus to arrive.",
        lineB: "The bus is usually on time.",
        options: ["for", "at", "on"],
        correct: "for"
    },
    {
        lineA: "He's afraid {{blank}} spiders.",
        lineB: "Many people are afraid of them.",
        options: ["of", "from", "with"],
        correct: "of"
    },
    {
        lineA: "I'm interested {{blank}} learning Spanish.",
        lineB: "Spanish is a beautiful language.",
        options: ["in", "on", "for"],
        correct: "in"
    },
    {
        lineA: "She's good {{blank}} playing the piano.",
        lineB: "Yes, she practices every day.",
        options: ["at", "in", "with"],
        correct: "at"
    },
    {
        lineA: "I'm tired {{blank}} waiting.",
        lineB: "Just a few more minutes, please.",
        options: ["of", "from", "with"],
        correct: "of"
    },
    {
        lineA: "He's talking {{blank}} his friend on the phone.",
        lineB: "They seem to be having a good conversation.",
        options: ["to", "with", "at"],
        correct: "to"
    },
    {
        lineA: "I'm listening {{blank}} music while I study.",
        lineB: "What kind of music do you like?",
        options: ["to", "at", "on"],
        correct: "to"
    },
    {
        lineA: "She's worried {{blank}} her exam tomorrow.",
        lineB: "Tell her not to worry too much.",
        options: ["about", "for", "of"],
        correct: "about"
    },
    {
        lineA: "I'm thinking {{blank}} buying a new car.",
        lineB: "What kind of car do you want?",
        options: ["about", "on", "for"],
        correct: "about"
    },
    
    // Section 2: More sentences with blanks in lineA
    {
        lineA: "She's writing {{blank}} a pen in her notebook.",
        lineB: "I prefer to use pencils.",
        options: ["with", "by", "in"],
        correct: "with"
    },
    {
        lineA: "He's talking {{blank}} the phone with his mother.",
        lineB: "I'll wait until he finishes.",
        options: ["on", "in", "at"],
        correct: "on"
    },
    {
        lineA: "I'm sorry {{blank}} being late to the meeting.",
        lineB: "That's okay. We just started.",
        options: ["for", "about", "of"],
        correct: "for"
    },
    {
        lineA: "He's excited {{blank}} the party this weekend.",
        lineB: "It's going to be fun.",
        options: ["about", "for", "on"],
        correct: "about"
    },
    {
        lineA: "I'm happy {{blank}} your success in the competition.",
        lineB: "Thank you for your support.",
        options: ["about", "for", "with"],
        correct: "about"
    },
    {
        lineA: "She's angry {{blank}} her brother for breaking her toy.",
        lineB: "What did he do?",
        options: ["with", "to", "at"],
        correct: "with"
    },
    {
        lineA: "I'm proud {{blank}} you for passing the test.",
        lineB: "Thank you. That means a lot to me.",
        options: ["of", "for", "with"],
        correct: "of"
    },
    {
        lineA: "She's good {{blank}} math and science.",
        lineB: "Yes, she always gets good grades.",
        options: ["at", "in", "with"],
        correct: "at"
    },
    {
        lineA: "He's looking {{blank}} the map to find the museum.",
        lineB: "Is he trying to find directions?",
        options: ["at", "on", "in"],
        correct: "at"
    },
    {
        lineA: "She's writing {{blank}} her diary every night.",
        lineB: "Does she write in it every day?",
        options: ["in", "on", "at"],
        correct: "in"
    },
    
    // Section 3: Sentences with blanks in lineB
    {
        lineA: "Why are you looking around?",
        lineB: "I'm searching {{blank}} my glasses.",
        options: ["for", "at", "with"],
        correct: "for"
    },
    {
        lineA: "What are you doing after school?",
        lineB: "I'm meeting {{blank}} my friends at the mall.",
        options: ["with", "for", "to"],
        correct: "with"
    },
    {
        lineA: "Why doesn't Tom like swimming?",
        lineB: "He's scared {{blank}} deep water.",
        options: ["of", "from", "about"],
        correct: "of"
    },
    {
        lineA: "What's your favorite hobby?",
        lineB: "I'm really interested {{blank}} photography.",
        options: ["in", "on", "with"],
        correct: "in"
    },
    {
        lineA: "Does your sister play sports?",
        lineB: "Yes, she's very good {{blank}} tennis.",
        options: ["at", "in", "with"],
        correct: "at"
    },
    {
        lineA: "Why do you want to leave early?",
        lineB: "I'm tired {{blank}} studying all day.",
        options: ["of", "from", "with"],
        correct: "of"
    },
    {
        lineA: "Who is Sarah calling?",
        lineB: "She's speaking {{blank}} her mother right now.",
        options: ["to", "with", "at"],
        correct: "to"
    },
    {
        lineA: "What are you doing with those headphones?",
        lineB: "I'm listening {{blank}} a podcast about history.",
        options: ["to", "at", "on"],
        correct: "to"
    },
    {
        lineA: "Why does Emma look stressed?",
        lineB: "She's worried {{blank}} her job interview tomorrow.",
        options: ["about", "for", "of"],
        correct: "about"
    },
    {
        lineA: "What are you doing this weekend?",
        lineB: "I'm thinking {{blank}} going to the beach.",
        options: ["about", "on", "for"],
        correct: "about"
    },
    
    // Section 4: More varied sentences with blanks in lineA
    {
        lineA: "I'm waiting {{blank}} the rain to stop before I go out.",
        lineB: "It looks like it will stop soon.",
        options: ["for", "to", "at"],
        correct: "for"
    },
    {
        lineA: "The restaurant specializes {{blank}} Italian food.",
        lineB: "Their pasta dishes are delicious.",
        options: ["in", "with", "on"],
        correct: "in"
    },
    {
        lineA: "The movie is based {{blank}} a true story.",
        lineB: "I didn't know that happened in real life.",
        options: ["on", "in", "with"],
        correct: "on"
    },
    {
        lineA: "We're meeting {{blank}} the coffee shop at 3pm.",
        lineB: "I'll be there on time.",
        options: ["at", "in", "on"],
        correct: "at"
    },
    {
        lineA: "She's interested {{blank}} photography as a hobby.",
        lineB: "Her pictures are really beautiful.",
        options: ["in", "about", "for"],
        correct: "in"
    },
    {
        lineA: "I'm responsible {{blank}} feeding the dog every morning.",
        lineB: "What time do you feed it?",
        options: ["for", "of", "with"],
        correct: "for"
    },
    {
        lineA: "He's allergic {{blank}} peanuts and shellfish.",
        lineB: "That must be difficult when eating out.",
        options: ["to", "for", "with"],
        correct: "to"
    },
    {
        lineA: "She's nervous {{blank}} her presentation tomorrow.",
        lineB: "I'm sure she'll do great.",
        options: ["about", "for", "of"],
        correct: "about"
    },
    {
        lineA: "I'm familiar {{blank}} that neighborhood.",
        lineB: "Have you lived there before?",
        options: ["with", "to", "about"],
        correct: "with"
    },
    {
        lineA: "They're excited {{blank}} their vacation next week.",
        lineB: "Where are they going?",
        options: ["about", "for", "with"],
        correct: "about"
    },
    
    // Section 5: More sentences with blanks in lineB
    {
        lineA: "Why did you miss the meeting?",
        lineB: "I apologize {{blank}} not being there.",
        options: ["for", "about", "of"],
        correct: "for"
    },
    {
        lineA: "How does Sarah get to work?",
        lineB: "She usually travels {{blank}} train.",
        options: ["by", "with", "in"],
        correct: "by"
    },
    {
        lineA: "What happened to your project?",
        lineB: "I'm not satisfied {{blank}} the results.",
        options: ["with", "about", "for"],
        correct: "with"
    },
    {
        lineA: "Why is Tom studying so hard?",
        lineB: "He's preparing {{blank}} his final exams.",
        options: ["for", "to", "with"],
        correct: "for"
    },
    {
        lineA: "What's wrong with your computer?",
        lineB: "It's infected {{blank}} a virus.",
        options: ["with", "by", "from"],
        correct: "with"
    },
    {
        lineA: "Why is Lisa so happy today?",
        lineB: "She's excited {{blank}} her birthday party.",
        options: ["about", "for", "with"],
        correct: "about"
    },
    {
        lineA: "What are you doing with that book?",
        lineB: "I'm looking {{blank}} some information.",
        options: ["for", "at", "to"],
        correct: "for"
    },
    {
        lineA: "Why is David wearing a suit?",
        lineB: "He's going {{blank}} a job interview.",
        options: ["to", "for", "at"],
        correct: "to"
    },
    {
        lineA: "What's in that box?",
        lineB: "It's filled {{blank}} old photographs.",
        options: ["with", "by", "of"],
        correct: "with"
    },
    {
        lineA: "Why are you studying Spanish?",
        lineB: "I'm interested {{blank}} Latin American culture.",
        options: ["in", "about", "for"],
        correct: "in"
    },
    
    // Section 6: Additional sentences with blanks in lineA
    {
        lineA: "I'm concerned {{blank}} the environment.",
        lineB: "We should all try to reduce waste.",
        options: ["about", "for", "with"],
        correct: "about"
    },
    {
        lineA: "She's married {{blank}} a doctor.",
        lineB: "How long have they been married?",
        options: ["to", "with", "for"],
        correct: "to"
    },
    {
        lineA: "I'm disappointed {{blank}} the movie.",
        lineB: "I thought it would be better too.",
        options: ["with", "about", "for"],
        correct: "with"
    },
    {
        lineA: "He's famous {{blank}} his paintings.",
        lineB: "I've seen some of them in galleries.",
        options: ["for", "with", "about"],
        correct: "for"
    },
    {
        lineA: "I'm confused {{blank}} these instructions.",
        lineB: "Let me help you understand them.",
        options: ["by", "with", "about"],
        correct: "by"
    },
    {
        lineA: "She's pleased {{blank}} her test results.",
        lineB: "She studied very hard for that test.",
        options: ["with", "about", "for"],
        correct: "with"
    },
    {
        lineA: "I'm surprised {{blank}} the news.",
        lineB: "Nobody expected that to happen.",
        options: ["by", "with", "about"],
        correct: "by"
    },
    {
        lineA: "He's worried {{blank}} his health.",
        lineB: "He should see a doctor soon.",
        options: ["about", "for", "with"],
        correct: "about"
    },
    {
        lineA: "I'm bored {{blank}} this TV show.",
        lineB: "Let's watch something else.",
        options: ["with", "by", "about"],
        correct: "with"
    },
    {
        lineA: "She's annoyed {{blank}} her brother.",
        lineB: "What did he do this time?",
        options: ["with", "by", "about"],
        correct: "with"
    },
    
    // Section 7: Final set of sentences with blanks in lineB
    {
        lineA: "Why can't you come to the party?",
        lineB: "I'm busy {{blank}} my homework.",
        options: ["with", "for", "about"],
        correct: "with"
    },
    {
        lineA: "What's wrong with your phone?",
        lineB: "It's running {{blank}} battery.",
        options: ["out of", "low on", "without"],
        correct: "out of"
    },
    {
        lineA: "Why are you studying so hard?",
        lineB: "I'm aiming {{blank}} a scholarship.",
        options: ["for", "to", "at"],
        correct: "for"
    },
    {
        lineA: "What happened at the meeting?",
        lineB: "We agreed {{blank}} the new proposal.",
        options: ["on", "with", "to"],
        correct: "on"
    },
    {
        lineA: "Why did you choose this university?",
        lineB: "I'm interested {{blank}} their science program.",
        options: ["in", "about", "for"],
        correct: "in"
    },
    {
        lineA: "What's in that container?",
        lineB: "It's full {{blank}} water.",
        options: ["of", "with", "by"],
        correct: "of"
    },
    {
        lineA: "Why are you wearing a coat?",
        lineB: "I'm sensitive {{blank}} cold weather.",
        options: ["to", "with", "about"],
        correct: "to"
    },
    {
        lineA: "What are you doing with that camera?",
        lineB: "I'm taking photos {{blank}} the sunset.",
        options: ["of", "about", "with"],
        correct: "of"
    },
    {
        lineA: "Why are you smiling?",
        lineB: "I'm happy {{blank}} the good news.",
        options: ["about", "with", "for"],
        correct: "about"
    },
    {
        lineA: "What are you writing?",
        lineB: "I'm working {{blank}} my essay.",
        options: ["on", "with", "at"],
        correct: "on"
    },
    
    // Section 8: Additional varied sentences
    {
        lineA: "I'm dependent {{blank}} my parents for financial support.",
        lineB: "Many students are in the same situation.",
        options: ["on", "to", "with"],
        correct: "on"
    },
    {
        lineA: "She's different {{blank}} her sister.",
        lineB: "Yes, they don't look alike at all.",
        options: ["from", "than", "to"],
        correct: "from"
    },
    {
        lineA: "What are you looking {{blank}} in the newspaper?",
        lineB: "I'm checking the movie times.",
        options: ["for", "at", "on"],
        correct: "for"
    },
    {
        lineA: "Why is Tom upset?",
        lineB: "He's angry {{blank}} me for using his computer.",
        options: ["with", "at", "to"],
        correct: "with"
    },
    {
        lineA: "What are you doing this weekend?",
        lineB: "I'm going {{blank}} a concert with friends.",
        options: ["to", "at", "for"],
        correct: "to"
    },
    {
        lineA: "Why did you choose that book?",
        lineB: "I'm interested {{blank}} the topic.",
        options: ["in", "about", "for"],
        correct: "in"
    },
    {
        lineA: "How do you know Sarah?",
        lineB: "We worked {{blank}} the same company.",
        options: ["for", "with", "at"],
        correct: "for"
    },
    {
        lineA: "What's wrong with your car?",
        lineB: "There's something wrong {{blank}} the engine.",
        options: ["with", "in", "about"],
        correct: "with"
    },
    {
        lineA: "Why are you studying French?",
        lineB: "I'm planning to travel {{blank}} France next year.",
        options: ["to", "in", "at"],
        correct: "to"
    },
    {
        lineA: "What are you doing with those tools?",
        lineB: "I'm fixing the problem {{blank}} my bicycle.",
        options: ["with", "on", "at"],
        correct: "with"
    }
]; 