// Verb Tenses Data: Practice with irregular verbs
// Simple sentences with common irregular verbs in different tenses

const verbTensesData = [
    // Present to Past
    {
        lineA: "Today I go to the store.",
        lineB: "Yesterday I {{blank}} to the store.",
        options: ["went", "go", "will go"],
        correct: "went"
    },
    {
        lineA: "She makes dinner every night.",
        lineB: "Last night she {{blank}} dinner too.",
        options: ["made", "makes", "will make"],
        correct: "made"
    },
    {
        lineA: "I see my friend at school.",
        lineB: "Yesterday I {{blank}} my friend at the park.",
        options: ["saw", "see", "will see"],
        correct: "saw"
    },
    {
        lineA: "They take the bus to work.",
        lineB: "Last Monday they {{blank}} a taxi instead.",
        options: ["took", "take", "will take"],
        correct: "took"
    },
    {
        lineA: "He brings lunch to school.",
        lineB: "Last Friday he {{blank}} lunch too.",
        options: ["brought", "brings", "will bring"],
        correct: "brought"
    },
    {
        lineA: "I buy new shoes every year.",
        lineB: "Last month I {{blank}} a new jacket.",
        options: ["bought", "buy", "will buy"],
        correct: "bought"
    },
    {
        lineA: "She comes to class on time.",
        lineB: "Yesterday she {{blank}} late to class.",
        options: ["came", "comes", "will come"],
        correct: "came"
    },
    {
        lineA: "I feel happy today.",
        lineB: "Yesterday I {{blank}} sad all day.",
        options: ["felt", "feel", "will feel"],
        correct: "felt"
    },
    {
        lineA: "They eat lunch at noon.",
        lineB: "Yesterday they {{blank}} dinner at 6 PM.",
        options: ["ate", "eat", "will eat"],
        correct: "ate"
    },
    {
        lineA: "He drives to work every day.",
        lineB: "Last weekend he {{blank}} to the beach.",
        options: ["drove", "drives", "will drive"],
        correct: "drove"
    },
    {
        lineA: "I sing in the shower every morning.",
        lineB: "Yesterday morning I {{blank}} in the shower for ten minutes.",
        options: ["sang", "sing", "will sing"],
        correct: "sang"
    },
    {
        lineA: "She speaks three languages fluently.",
        lineB: "At the conference last month, she {{blank}} in French the entire time.",
        options: ["spoke", "speaks", "will speak"],
        correct: "spoke"
    },
    {
        lineA: "They swim in the lake during summer.",
        lineB: "Last summer they {{blank}} in the lake every weekend.",
        options: ["swam", "swim", "will swim"],
        correct: "swam"
    },
    {
        lineA: "He reads a book every week.",
        lineB: "Last week he {{blank}} two books during his vacation.",
        options: ["read", "reads", "will read"],
        correct: "read"
    },
    {
        lineA: "I send emails to my team daily.",
        lineB: "Yesterday I {{blank}} ten emails before lunch.",
        options: ["sent", "send", "will send"],
        correct: "sent"
    },
    
    // Past to Past Participle
    {
        lineA: "Yesterday I went to the store.",
        lineB: "I have {{blank}} to that store many times in the past.",
        options: ["gone", "went", "go"],
        correct: "gone"
    },
    {
        lineA: "She made dinner last night.",
        lineB: "She has {{blank}} dinner for us many times before.",
        options: ["made", "make", "makes"],
        correct: "made"
    },
    {
        lineA: "I saw a movie yesterday.",
        lineB: "I have {{blank}} that movie twice now since last month.",
        options: ["seen", "saw", "see"],
        correct: "seen"
    },
    {
        lineA: "They took a taxi last week.",
        lineB: "They have {{blank}} a taxi many times in the past year.",
        options: ["taken", "took", "take"],
        correct: "taken"
    },
    {
        lineA: "He brought his laptop yesterday.",
        lineB: "He has {{blank}} his laptop to class many times before.",
        options: ["brought", "bring", "brings"],
        correct: "brought"
    },
    {
        lineA: "I bought a new phone last year.",
        lineB: "I have {{blank}} three phones in total over the years.",
        options: ["bought", "buy", "buys"],
        correct: "bought"
    },
    {
        lineA: "She came to the party late.",
        lineB: "She has never {{blank}} to our parties before today.",
        options: ["come", "came", "comes"],
        correct: "come"
    },
    {
        lineA: "I felt tired after work.",
        lineB: "I have {{blank}} tired after work many times in the past.",
        options: ["felt", "feel", "feels"],
        correct: "felt"
    },
    {
        lineA: "They ate at that restaurant last week.",
        lineB: "They have {{blank}} at that restaurant several times since it opened.",
        options: ["eaten", "ate", "eat"],
        correct: "eaten"
    },
    {
        lineA: "He drove to the mountains yesterday.",
        lineB: "He has {{blank}} to the mountains many times over the years.",
        options: ["driven", "drove", "drive"],
        correct: "driven"
    },
    {
        lineA: "I wrote a letter to my friend last week.",
        lineB: "I have {{blank}} many letters to my friend since we met.",
        options: ["written", "wrote", "write"],
        correct: "written"
    },
    {
        lineA: "She broke her arm last year.",
        lineB: "She has {{blank}} her arm twice in her life.",
        options: ["broken", "broke", "break"],
        correct: "broken"
    },
    {
        lineA: "They spoke to the manager yesterday.",
        lineB: "They have {{blank}} to the manager several times about this issue.",
        options: ["spoken", "spoke", "speak"],
        correct: "spoken"
    },
    {
        lineA: "He forgot his password last month.",
        lineB: "He has {{blank}} his password many times since creating the account.",
        options: ["forgotten", "forgot", "forget"],
        correct: "forgotten"
    },
    {
        lineA: "I chose the blue shirt yesterday.",
        lineB: "I have always {{blank}} blue shirts for important meetings.",
        options: ["chosen", "chose", "choose"],
        correct: "chosen"
    },
    
    // Present to Present Continuous
    {
        lineA: "Usually I write emails in the morning.",
        lineB: "Right now at this moment I am {{blank}} an important email.",
        options: ["writing", "write", "wrote"],
        correct: "writing"
    },
    {
        lineA: "She usually reads books in bed.",
        lineB: "She is {{blank}} a magazine right now as we speak.",
        options: ["reading", "read", "reads"],
        correct: "reading"
    },
    {
        lineA: "They speak English at school.",
        lineB: "They are {{blank}} Spanish right now in this class.",
        options: ["speaking", "speak", "spoke"],
        correct: "speaking"
    },
    {
        lineA: "He works from 9 to 5.",
        lineB: "He is {{blank}} late tonight on a special project.",
        options: ["working", "work", "worked"],
        correct: "working"
    },
    {
        lineA: "I sleep eight hours every night.",
        lineB: "The baby is {{blank}} right now at this moment.",
        options: ["sleeping", "sleep", "slept"],
        correct: "sleeping"
    },
    {
        lineA: "She usually walks to school.",
        lineB: "Today she is {{blank}} to school because it's raining.",
        options: ["driving", "drive", "drove"],
        correct: "driving"
    },
    {
        lineA: "They normally eat at home.",
        lineB: "Tonight they are {{blank}} at a restaurant for their anniversary.",
        options: ["eating", "eat", "ate"],
        correct: "eating"
    },
    {
        lineA: "He usually studies in the library.",
        lineB: "Right now he is {{blank}} at home because the library is closed.",
        options: ["studying", "study", "studied"],
        correct: "studying"
    },
    {
        lineA: "I typically watch TV in the evening.",
        lineB: "At this moment I am {{blank}} a movie with my family.",
        options: ["watching", "watch", "watched"],
        correct: "watching"
    },
    {
        lineA: "She normally teaches math classes.",
        lineB: "This semester she is {{blank}} science classes as well.",
        options: ["teaching", "teach", "taught"],
        correct: "teaching"
    },
    
    // Present to Future
    {
        lineA: "I go to the gym on Mondays.",
        lineB: "Tomorrow I {{blank}} to the gym too.",
        options: ["will go", "go", "went"],
        correct: "will go"
    },
    {
        lineA: "She makes her own lunch.",
        lineB: "Tomorrow she {{blank}} lunch for everyone in the office.",
        options: ["will make", "makes", "made"],
        correct: "will make"
    },
    {
        lineA: "They take the train to work.",
        lineB: "Next week they {{blank}} a bus instead of the train.",
        options: ["will take", "take", "took"],
        correct: "will take"
    },
    {
        lineA: "He teaches math on Fridays.",
        lineB: "Next Monday he {{blank}} science instead of math.",
        options: ["will teach", "teaches", "taught"],
        correct: "will teach"
    },
    {
        lineA: "I meet my friends on weekends.",
        lineB: "This coming weekend I {{blank}} my family instead of my friends.",
        options: ["will meet", "meet", "met"],
        correct: "will meet"
    },
    {
        lineA: "She visits her parents monthly.",
        lineB: "Next month she {{blank}} her grandparents instead.",
        options: ["will visit", "visits", "visited"],
        correct: "will visit"
    },
    {
        lineA: "They play soccer on Saturdays.",
        lineB: "This Saturday they {{blank}} basketball for a change.",
        options: ["will play", "play", "played"],
        correct: "will play"
    },
    {
        lineA: "He writes reports every quarter.",
        lineB: "For the next quarter, he {{blank}} presentations instead.",
        options: ["will write", "writes", "wrote"],
        correct: "will write"
    },
    {
        lineA: "I cook dinner on weeknights.",
        lineB: "Tomorrow night I {{blank}} takeout food instead.",
        options: ["will order", "order", "ordered"],
        correct: "will order"
    },
    {
        lineA: "She walks to work in good weather.",
        lineB: "Tomorrow, because of the rain, she {{blank}} the bus.",
        options: ["will take", "takes", "took"],
        correct: "will take"
    },
    
    // Additional irregular verbs - Past Tense
    {
        lineA: "I run every morning.",
        lineB: "Yesterday morning I {{blank}} for an hour in the park.",
        options: ["ran", "run", "will run"],
        correct: "ran"
    },
    {
        lineA: "She gives me a gift on my birthday.",
        lineB: "Last year on my birthday she {{blank}} me a book.",
        options: ["gave", "gives", "will give"],
        correct: "gave"
    },
    {
        lineA: "They tell funny stories.",
        lineB: "At the party last night, they {{blank}} us about their trip.",
        options: ["told", "tell", "will tell"],
        correct: "told"
    },
    {
        lineA: "He thinks about his future.",
        lineB: "Yesterday during the meeting he {{blank}} about his past.",
        options: ["thought", "thinks", "will think"],
        correct: "thought"
    },
    {
        lineA: "I wear casual clothes to work.",
        lineB: "For the interview last week, I {{blank}} a formal suit.",
        options: ["wore", "wear", "will wear"],
        correct: "wore"
    },
    {
        lineA: "She writes a letter every week.",
        lineB: "Last week she {{blank}} two letters to her grandmother.",
        options: ["wrote", "writes", "will write"],
        correct: "wrote"
    },
    {
        lineA: "They grow vegetables in their garden.",
        lineB: "Last summer they {{blank}} tomatoes and peppers.",
        options: ["grew", "grow", "will grow"],
        correct: "grew"
    },
    {
        lineA: "He knows the answer to every question.",
        lineB: "He {{blank}} the answer to that difficult question yesterday in class.",
        options: ["knew", "knows", "will know"],
        correct: "knew"
    },
    {
        lineA: "I keep my promises.",
        lineB: "I {{blank}} my promise to help you last Saturday.",
        options: ["kept", "keep", "will keep"],
        correct: "kept"
    },
    {
        lineA: "She leaves for work at 8 AM.",
        lineB: "Yesterday she {{blank}} at 7 AM because of the meeting.",
        options: ["left", "leaves", "will leave"],
        correct: "left"
    },
    {
        lineA: "They begin class with a review.",
        lineB: "Yesterday they {{blank}} with a quiz instead of a review.",
        options: ["began", "begin", "will begin"],
        correct: "began"
    },
    {
        lineA: "He finds interesting books to read.",
        lineB: "Last week he {{blank}} a rare book at the library sale.",
        options: ["found", "finds", "will find"],
        correct: "found"
    },
    {
        lineA: "I stand in line for coffee every morning.",
        lineB: "Yesterday morning I {{blank}} in line for 20 minutes at the café.",
        options: ["stood", "stand", "will stand"],
        correct: "stood"
    },
    {
        lineA: "She understands the lesson.",
        lineB: "She finally {{blank}} the concept yesterday after the extra help.",
        options: ["understood", "understands", "will understand"],
        correct: "understood"
    },
    {
        lineA: "They win most of their games.",
        lineB: "Last weekend they {{blank}} the championship final match.",
        options: ["won", "win", "will win"],
        correct: "won"
    },
    {
        lineA: "I spend time with my family on weekends.",
        lineB: "Last weekend I {{blank}} the entire day with my cousins.",
        options: ["spent", "spend", "will spend"],
        correct: "spent"
    },
    {
        lineA: "She builds model airplanes as a hobby.",
        lineB: "Last month she {{blank}} a model of the Eiffel Tower.",
        options: ["built", "builds", "will build"],
        correct: "built"
    },
    {
        lineA: "They sell fresh bread every morning.",
        lineB: "Yesterday morning they {{blank}} out of bread by 9 AM.",
        options: ["sold", "sell", "will sell"],
        correct: "sold"
    },
    {
        lineA: "He sends a report every Friday.",
        lineB: "Last Friday he {{blank}} the report late in the evening.",
        options: ["sent", "sends", "will send"],
        correct: "sent"
    },
    {
        lineA: "I catch the 8:30 train to work.",
        lineB: "Yesterday I {{blank}} the 9:15 train because I overslept.",
        options: ["caught", "catch", "will catch"],
        correct: "caught"
    },
    
    // Additional Past Participle
    {
        lineA: "I lost my keys last week.",
        lineB: "I have {{blank}} my keys three times this year already.",
        options: ["lost", "lose", "loses"],
        correct: "lost"
    },
    {
        lineA: "She taught English last semester.",
        lineB: "She has {{blank}} English for over ten years now.",
        options: ["taught", "teach", "teaches"],
        correct: "taught"
    },
    {
        lineA: "They built a house last year.",
        lineB: "They have {{blank}} three houses since they started their business.",
        options: ["built", "build", "builds"],
        correct: "built"
    },
    {
        lineA: "He spent all his money yesterday.",
        lineB: "He has {{blank}} all his savings on this project.",
        options: ["spent", "spend", "spends"],
        correct: "spent"
    },
    {
        lineA: "I caught a cold last month.",
        lineB: "I have {{blank}} a cold twice this winter already.",
        options: ["caught", "catch", "catches"],
        correct: "caught"
    },
    {
        lineA: "She held the meeting last Tuesday.",
        lineB: "She has {{blank}} many important meetings in her career.",
        options: ["held", "hold", "holds"],
        correct: "held"
    },
    {
        lineA: "They won the championship last year.",
        lineB: "They have {{blank}} the championship three times in their history.",
        options: ["won", "win", "wins"],
        correct: "won"
    },
    {
        lineA: "He drew a beautiful picture yesterday.",
        lineB: "He has {{blank}} many beautiful pictures since taking art classes.",
        options: ["drawn", "drew", "draw"],
        correct: "drawn"
    },
    {
        lineA: "I threw away my old shoes last week.",
        lineB: "I have {{blank}} away many old items during my spring cleaning.",
        options: ["thrown", "threw", "throw"],
        correct: "thrown"
    },
    {
        lineA: "She flew to Paris last summer.",
        lineB: "She has {{blank}} to Paris several times for business.",
        options: ["flown", "flew", "fly"],
        correct: "flown"
    },
    
    // Additional Present Continuous
    {
        lineA: "He usually plays soccer after school.",
        lineB: "Today he is {{blank}} basketball with his new friends.",
        options: ["playing", "play", "played"],
        correct: "playing"
    },
    {
        lineA: "I normally cook dinner at home.",
        lineB: "Tonight I am {{blank}} dinner at my parents' house.",
        options: ["cooking", "cook", "cooked"],
        correct: "cooking"
    },
    {
        lineA: "She typically walks to work.",
        lineB: "This week she is {{blank}} the bus because of her injured foot.",
        options: ["taking", "take", "took"],
        correct: "taking"
    },
    {
        lineA: "They usually live in the city.",
        lineB: "This summer they are {{blank}} in a beach house.",
        options: ["living", "live", "lived"],
        correct: "living"
    },
    {
        lineA: "He often writes fiction stories.",
        lineB: "Currently he is {{blank}} a non-fiction book about his travels.",
        options: ["writing", "write", "wrote"],
        correct: "writing"
    },
    
    // Additional Future Tense
    {
        lineA: "I usually stay home on Sundays.",
        lineB: "This Sunday I {{blank}} to the mountains for a hike.",
        options: ["will go", "go", "went"],
        correct: "will go"
    },
    {
        lineA: "She normally drives to work.",
        lineB: "Tomorrow she {{blank}} the train because her car is being repaired.",
        options: ["will take", "takes", "took"],
        correct: "will take"
    },
    {
        lineA: "They typically eat lunch at noon.",
        lineB: "Tomorrow they {{blank}} lunch at 1 PM due to the meeting.",
        options: ["will eat", "eat", "ate"],
        correct: "will eat"
    },
    {
        lineA: "He usually finishes work at 5 PM.",
        lineB: "Tomorrow he {{blank}} work at 3 PM for his doctor's appointment.",
        options: ["will finish", "finishes", "finished"],
        correct: "will finish"
    },
    {
        lineA: "I often read books in the evening.",
        lineB: "Tonight I {{blank}} a movie instead of reading.",
        options: ["will watch", "watch", "watched"],
        correct: "will watch"
    }
]; export default verbTensesData
