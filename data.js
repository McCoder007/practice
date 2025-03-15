// Practice data organized by levels
const practiceDataByLevel = {
    // Level 1: Original simple sentences
    level1: [
        // Original sentences
        {
            lineA: "The book is {{blank}} the table.",
            lineB: "Yes, I can see it.",
            options: ["at", "on", "in"],
            correct: "on"
        },
        {
            lineA: "My cat sleeps {{blank}} the bed.",
            lineB: "That's cute. I like cats.",
            options: ["on", "at", "to"],
            correct: "on"
        },
        {
            lineA: "I live {{blank}} a small house.",
            lineB: "Is it near the park?",
            options: ["on", "at", "in"],
            correct: "in"
        },
        {
            lineA: "I go to school {{blank}} bus.",
            lineB: "I walk to school.",
            options: ["with", "by", "on"],
            correct: "by"
        },
        {
            lineA: "What do you have {{blank}} your bag?",
            lineB: "I have my lunch and some books.",
            options: ["in", "on", "at"],
            correct: "in"
        },
        {
            lineA: "Let's meet {{blank}} 2 o'clock.",
            lineB: "OK. I'll be there.",
            options: ["in", "at", "on"],
            correct: "at"
        },
        {
            lineA: "The store is {{blank}} Main Street.",
            lineB: "Thank you. I'll find it.",
            options: ["on", "in", "at"],
            correct: "on"
        },
        {
            lineA: "I'm learning English {{blank}} school.",
            lineB: "Me too! It's fun.",
            options: ["at", "on", "to"],
            correct: "at"
        },
        {
            lineA: "She works {{blank}} a hospital.",
            lineB: "That's a good job.",
            options: ["at", "on", "in"],
            correct: "at"
        },
        {
            lineA: "We have class {{blank}} Monday.",
            lineB: "I know. I'll see you then.",
            options: ["in", "at", "on"],
            correct: "on"
        },
        // Additional sentences from the original data
        {
            lineA: "The keys are {{blank}} the drawer.",
            lineB: "Thank you, I'll check there.",
            options: ["in", "on", "at"],
            correct: "in"
        },
        {
            lineA: "I usually arrive {{blank}} 8:30.",
            lineB: "That's quite early.",
            options: ["in", "at", "on"],
            correct: "at"
        },
        {
            lineA: "She lives {{blank}} Japan.",
            lineB: "I'd like to visit Japan someday.",
            options: ["at", "on", "in"],
            correct: "in"
        },
        {
            lineA: "The meeting is {{blank}} Tuesday.",
            lineB: "I'll make a note of that.",
            options: ["in", "at", "on"],
            correct: "on"
        },
        {
            lineA: "I'm waiting {{blank}} the bus stop.",
            lineB: "The bus should arrive soon.",
            options: ["at", "on", "in"],
            correct: "at"
        },
        {
            lineA: "There's a picture {{blank}} the wall.",
            lineB: "Yes, it's very beautiful.",
            options: ["on", "in", "at"],
            correct: "on"
        },
        {
            lineA: "I'll see you {{blank}} the weekend.",
            lineB: "Great! I'm looking forward to it.",
            options: ["on", "at", "in"],
            correct: "on"
        },
        {
            lineA: "She arrived {{blank}} time for the meeting.",
            lineB: "Yes, she's always punctual.",
            options: ["in", "on", "at"],
            correct: "in"
        },
        {
            lineA: "The restaurant is {{blank}} the corner.",
            lineB: "I know where that is.",
            options: ["on", "in", "at"],
            correct: "on"
        },
        {
            lineA: "We're meeting {{blank}} noon.",
            lineB: "I'll be there.",
            options: ["at", "in", "on"],
            correct: "at"
        },
        {
            lineA: "The cat is hiding {{blank}} the sofa.",
            lineB: "I'll help you find it.",
            options: ["under", "on", "in"],
            correct: "under"
        },
        {
            lineA: "I put the letter {{blank}} the envelope.",
            lineB: "Did you seal it?",
            options: ["in", "on", "at"],
            correct: "in"
        },
        {
            lineA: "She's standing {{blank}} the door.",
            lineB: "Should I let her in?",
            options: ["at", "on", "in"],
            correct: "at"
        },
        {
            lineA: "The bank is {{blank}} First Avenue.",
            lineB: "Is it far from here?",
            options: ["on", "at", "in"],
            correct: "on"
        },
        {
            lineA: "I'll call you {{blank}} Friday.",
            lineB: "I'll be waiting for your call.",
            options: ["on", "in", "at"],
            correct: "on"
        },
        {
            lineA: "There's a fly {{blank}} the ceiling.",
            lineB: "I see it too.",
            options: ["on", "in", "at"],
            correct: "on"
        },
        {
            lineA: "I have a meeting {{blank}} 3 PM.",
            lineB: "Don't be late.",
            options: ["at", "in", "on"],
            correct: "at"
        },
        {
            lineA: "She lives {{blank}} an apartment.",
            lineB: "Is it a nice place?",
            options: ["in", "on", "at"],
            correct: "in"
        },
        {
            lineA: "The dog is sleeping {{blank}} its bed.",
            lineB: "It looks very comfortable.",
            options: ["in", "on", "at"],
            correct: "in"
        },
        {
            lineA: "I'll see you {{blank}} the morning.",
            lineB: "I'll be ready.",
            options: ["in", "on", "at"],
            correct: "in"
        },
        {
            lineA: "The children are playing {{blank}} the park.",
            lineB: "They seem to be having fun.",
            options: ["in", "on", "at"],
            correct: "in"
        },
        {
            lineA: "She's waiting {{blank}} the bus.",
            lineB: "The bus is usually on time.",
            options: ["for", "at", "on"],
            correct: "for"
        },
        {
            lineA: "I'm looking {{blank}} my keys.",
            lineB: "Did you check your pocket?",
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
            lineA: "He's talking {{blank}} his friend.",
            lineB: "They seem to be having a good conversation.",
            options: ["to", "with", "at"],
            correct: "to"
        },
        {
            lineA: "I'm listening {{blank}} music.",
            lineB: "What kind of music do you like?",
            options: ["to", "at", "on"],
            correct: "to"
        },
        {
            lineA: "She's worried {{blank}} her exam.",
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
        {
            lineA: "He's looking {{blank}} the window.",
            lineB: "What can he see?",
            options: ["through", "at", "in"],
            correct: "through"
        },
        {
            lineA: "She's writing {{blank}} a pen.",
            lineB: "I prefer to use pencils.",
            options: ["with", "by", "in"],
            correct: "with"
        },
        {
            lineA: "I'm waiting {{blank}} my friend.",
            lineB: "Is your friend usually on time?",
            options: ["for", "to", "at"],
            correct: "for"
        },
        {
            lineA: "He's talking {{blank}} the phone.",
            lineB: "I'll wait until he finishes.",
            options: ["on", "in", "at"],
            correct: "on"
        },
        {
            lineA: "She's looking {{blank}} a job.",
            lineB: "I hope she finds one soon.",
            options: ["for", "at", "on"],
            correct: "for"
        },
        {
            lineA: "I'm sorry {{blank}} being late.",
            lineB: "That's okay. We just started.",
            options: ["for", "about", "of"],
            correct: "for"
        },
        {
            lineA: "He's excited {{blank}} the party.",
            lineB: "It's going to be fun.",
            options: ["about", "for", "on"],
            correct: "about"
        },
        {
            lineA: "She's different {{blank}} her sister.",
            lineB: "Yes, they don't look alike at all.",
            options: ["from", "than", "to"],
            correct: "from"
        },
        {
            lineA: "I'm happy {{blank}} your success.",
            lineB: "Thank you for your support.",
            options: ["about", "for", "with"],
            correct: "about"
        },
        {
            lineA: "He's married {{blank}} my cousin.",
            lineB: "How long have they been married?",
            options: ["to", "with", "for"],
            correct: "to"
        },
        {
            lineA: "She's angry {{blank}} her brother.",
            lineB: "What did he do?",
            options: ["with", "to", "at"],
            correct: "with"
        },
        {
            lineA: "I'm proud {{blank}} you.",
            lineB: "Thank you. That means a lot to me.",
            options: ["of", "for", "with"],
            correct: "of"
        },
        {
            lineA: "He's afraid {{blank}} heights.",
            lineB: "Many people have that fear.",
            options: ["of", "from", "about"],
            correct: "of"
        },
        {
            lineA: "She's good {{blank}} math.",
            lineB: "Yes, she always gets good grades.",
            options: ["at", "in", "with"],
            correct: "at"
        },
        {
            lineA: "I'm worried {{blank}} my exam.",
            lineB: "Don't worry, you'll do fine.",
            options: ["about", "for", "of"],
            correct: "about"
        },
        {
            lineA: "He's listening {{blank}} the radio.",
            lineB: "What station is he listening to?",
            options: ["to", "at", "on"],
            correct: "to"
        },
        {
            lineA: "She's looking {{blank}} her keys.",
            lineB: "Did she lose them again?",
            options: ["for", "at", "after"],
            correct: "for"
        },
        {
            lineA: "I'm interested {{blank}} history.",
            lineB: "History is a fascinating subject.",
            options: ["in", "about", "for"],
            correct: "in"
        },
        {
            lineA: "He's talking {{blank}} his teacher.",
            lineB: "They seem to be having a serious conversation.",
            options: ["to", "with", "at"],
            correct: "to"
        },
        {
            lineA: "She's worried {{blank}} her health.",
            lineB: "She should see a doctor.",
            options: ["about", "for", "of"],
            correct: "about"
        },
        {
            lineA: "I'm thinking {{blank}} you.",
            lineB: "That's sweet of you to say.",
            options: ["about", "of", "for"],
            correct: "about"
        },
        {
            lineA: "He's looking {{blank}} the map.",
            lineB: "Is he trying to find directions?",
            options: ["at", "on", "in"],
            correct: "at"
        },
        {
            lineA: "She's writing {{blank}} her diary.",
            lineB: "Does she write in it every day?",
            options: ["in", "on", "at"],
            correct: "in"
        },
        {
            lineA: "I'm waiting {{blank}} the rain to stop.",
            lineB: "It looks like it will stop soon.",
            options: ["for", "to", "at"],
            correct: "for"
        },
        {
            lineA: "Why are you wearing a coat?",
            lineB: "I'm cold {{blank}} this weather.",
            options: ["in", "at", "with"],
            correct: "in"
        },
        {
            lineA: "What are you doing now?",
            lineB: "I'm waiting {{blank}} the bus.",
            options: ["to", "for", "at"],
            correct: "for"
        }
    ],
    
    // Level 2: Slightly more complex sentences
    level2: [
        {
            lineA: "The professor explained the concept {{blank}} great detail.",
            lineB: "His explanations are always thorough.",
            options: ["in", "with", "by"],
            correct: "in"
        },
        {
            lineA: "She succeeded {{blank}} completing the marathon despite her injury.",
            lineB: "That's quite an accomplishment.",
            options: ["in", "at", "for"],
            correct: "in"
        },
        {
            lineA: "The museum is located {{blank}} the outskirts of the city.",
            lineB: "Is there public transportation available?",
            options: ["on", "at", "in"],
            correct: "on"
        },
        {
            lineA: "The documentary focuses {{blank}} environmental issues.",
            lineB: "Those topics are becoming increasingly important.",
            options: ["on", "about", "with"],
            correct: "on"
        },
        {
            lineA: "The committee agreed {{blank}} the proposal unanimously.",
            lineB: "That's excellent news for the project.",
            options: ["to", "with", "on"],
            correct: "to"
        },
        {
            lineA: "She's quite knowledgeable {{blank}} ancient history.",
            lineB: "Yes, she studied archaeology in college.",
            options: ["about", "on", "with"],
            correct: "about"
        },
        {
            lineA: "The company invested heavily {{blank}} new technology.",
            lineB: "That should improve their productivity.",
            options: ["in", "on", "with"],
            correct: "in"
        },
        {
            lineA: "The recipe calls {{blank}} two tablespoons of olive oil.",
            lineB: "I think we have enough in the pantry.",
            options: ["for", "with", "to"],
            correct: "for"
        },
        {
            lineA: "The detective is suspicious {{blank}} the new evidence.",
            lineB: "He thinks it might have been planted.",
            options: ["of", "about", "with"],
            correct: "of"
        },
        {
            lineA: "The patient is responding well {{blank}} the treatment.",
            lineB: "That's encouraging news.",
            options: ["to", "with", "for"],
            correct: "to"
        },
        {
            lineA: "The article refers {{blank}} several scientific studies.",
            lineB: "Are those studies reliable sources?",
            options: ["to", "at", "on"],
            correct: "to"
        },
        {
            lineA: "She's quite proficient {{blank}} speaking multiple languages.",
            lineB: "How many languages does she speak?",
            options: ["at", "in", "with"],
            correct: "at"
        },
        {
            lineA: "The company is committed {{blank}} reducing its carbon footprint.",
            lineB: "That's an important environmental initiative.",
            options: ["to", "for", "with"],
            correct: "to"
        },
        {
            lineA: "The novel is based {{blank}} historical events.",
            lineB: "Which period of history does it cover?",
            options: ["on", "in", "with"],
            correct: "on"
        },
        {
            lineA: "The team is confident {{blank}} winning the championship.",
            lineB: "They've been performing exceptionally well this season.",
            options: ["of", "about", "in"],
            correct: "about"
        },
        {
            lineA: "The building was constructed {{blank}} the early 1900s.",
            lineB: "It has beautiful architectural features from that era.",
            options: ["in", "during", "at"],
            correct: "in"
        },
        {
            lineA: "The scientist is conducting research {{blank}} renewable energy.",
            lineB: "That field is becoming increasingly important.",
            options: ["on", "about", "with"],
            correct: "on"
        },
        {
            lineA: "The company is collaborating {{blank}} several universities.",
            lineB: "Academic partnerships can be very beneficial.",
            options: ["with", "to", "for"],
            correct: "with"
        },
        {
            lineA: "The documentary was filmed {{blank}} various locations worldwide.",
            lineB: "Which countries did they visit?",
            options: ["at", "in", "across"],
            correct: "across"
        },
        {
            lineA: "The professor is lecturing {{blank}} quantum physics this semester.",
            lineB: "That's a challenging but fascinating subject.",
            options: ["on", "about", "for"],
            correct: "on"
        },
        {
            lineA: "The company is expanding {{blank}} international markets.",
            lineB: "Global expansion can be quite challenging.",
            options: ["into", "to", "for"],
            correct: "into"
        },
        {
            lineA: "The medication should be taken {{blank}} an empty stomach.",
            lineB: "Is it best to take it in the morning?",
            options: ["on", "with", "during"],
            correct: "on"
        },
        {
            lineA: "The conference will be held {{blank}} the Grand Hotel.",
            lineB: "That venue has excellent facilities.",
            options: ["at", "in", "on"],
            correct: "at"
        },
        {
            lineA: "The report contains information {{blank}} market trends.",
            lineB: "Those insights will be valuable for our strategy.",
            options: ["about", "on", "with"],
            correct: "about"
        },
        {
            lineA: "The painting dates {{blank}} the Renaissance period.",
            lineB: "The artistic techniques from that era are remarkable.",
            options: ["from", "to", "in"],
            correct: "from"
        },
        {
            lineA: "The company is investing {{blank}} employee development.",
            lineB: "That's a wise long-term strategy.",
            options: ["in", "for", "on"],
            correct: "in"
        },
        {
            lineA: "The restaurant specializes {{blank}} Mediterranean cuisine.",
            lineB: "Their seafood dishes are particularly excellent.",
            options: ["in", "with", "on"],
            correct: "in"
        },
        {
            lineA: "The study was conducted {{blank}} a period of five years.",
            lineB: "That's a substantial amount of research time.",
            options: ["over", "during", "for"],
            correct: "over"
        },
        {
            lineA: "The author is working {{blank}} her third novel.",
            lineB: "Her previous books were bestsellers.",
            options: ["on", "with", "at"],
            correct: "on"
        },
        {
            lineA: "The company is known {{blank}} its innovative products.",
            lineB: "Their design team is exceptionally creative.",
            options: ["for", "by", "with"],
            correct: "for"
        },
        {
            lineA: "The decision depends {{blank}} several factors.",
            lineB: "We should consider all of them carefully.",
            options: ["on", "from", "with"],
            correct: "on"
        },
        {
            lineA: "The museum is dedicated {{blank}} modern art.",
            lineB: "They have an impressive collection of contemporary pieces.",
            options: ["to", "for", "with"],
            correct: "to"
        },
        {
            lineA: "The experiment resulted {{blank}} unexpected findings.",
            lineB: "Scientific discoveries often happen that way.",
            options: ["in", "with", "to"],
            correct: "in"
        },
        {
            lineA: "The company is responding {{blank}} customer feedback.",
            lineB: "That's essential for improving their services.",
            options: ["to", "for", "with"],
            correct: "to"
        },
        {
            lineA: "The lecture will begin {{blank}} exactly 3 PM.",
            lineB: "We should arrive a few minutes early.",
            options: ["at", "on", "in"],
            correct: "at"
        },
        {
            lineA: "The organization is dedicated {{blank}} helping underprivileged children.",
            lineB: "Their community programs have made a significant impact.",
            options: ["to", "for", "with"],
            correct: "to"
        },
        {
            lineA: "The solution consists {{blank}} several components.",
            lineB: "Each element plays an important role.",
            options: ["of", "in", "with"],
            correct: "of"
        },
        {
            lineA: "The company is competing {{blank}} the industry leader.",
            lineB: "Their innovative approach gives them an advantage.",
            options: ["with", "against", "to"],
            correct: "with"
        },
        {
            lineA: "The research contributes {{blank}} our understanding of climate change.",
            lineB: "Scientific knowledge in this area is crucial.",
            options: ["to", "for", "with"],
            correct: "to"
        },
        {
            lineA: "The festival takes place {{blank}} the first weekend of July.",
            lineB: "That's usually when the weather is perfect.",
            options: ["on", "at", "during"],
            correct: "on"
        },
        {
            lineA: "The company is focusing {{blank}} sustainable practices.",
            lineB: "Environmental responsibility is increasingly important.",
            options: ["on", "with", "for"],
            correct: "on"
        },
        {
            lineA: "The medication should be stored {{blank}} room temperature.",
            lineB: "Keep it away from direct sunlight as well.",
            options: ["at", "in", "with"],
            correct: "at"
        },
        {
            lineA: "The professor is an expert {{blank}} medieval literature.",
            lineB: "Her lectures on that topic are fascinating.",
            options: ["in", "on", "with"],
            correct: "in"
        },
        {
            lineA: "The company is collaborating {{blank}} developing new technology.",
            lineB: "Partnerships often accelerate innovation.",
            options: ["on", "for", "with"],
            correct: "on"
        },
        {
            lineA: "The documentary provides insight {{blank}} cultural traditions.",
            lineB: "It's both educational and entertaining.",
            options: ["into", "about", "for"],
            correct: "into"
        },
        {
            lineA: "The meeting is scheduled {{blank}} Wednesday afternoon.",
            lineB: "I'll make sure to be available then.",
            options: ["for", "on", "at"],
            correct: "for"
        },
        {
            lineA: "The company is investing {{blank}} research and development.",
            lineB: "That's essential for long-term growth.",
            options: ["in", "for", "on"],
            correct: "in"
        },
        {
            lineA: "The book is divided {{blank}} three main sections.",
            lineB: "The organization makes it easy to follow.",
            options: ["into", "in", "with"],
            correct: "into"
        },
        {
            lineA: "The conference will focus {{blank}} emerging technologies.",
            lineB: "Those topics are particularly relevant right now.",
            options: ["on", "about", "with"],
            correct: "on"
        },
        {
            lineA: "The company is committed {{blank}} customer satisfaction.",
            lineB: "Their service quality reflects that priority.",
            options: ["to", "for", "with"],
            correct: "to"
        },
        {
            lineA: "The study was conducted {{blank}} a team of researchers.",
            lineB: "Their collaborative approach yielded comprehensive results.",
            options: ["by", "with", "from"],
            correct: "by"
        },
        {
            lineA: "The restaurant is famous {{blank}} its authentic cuisine.",
            lineB: "Their traditional recipes have been preserved for generations.",
            options: ["for", "with", "about"],
            correct: "for"
        },
        {
            lineA: "The company is expanding {{blank}} new markets.",
            lineB: "Their global strategy is quite ambitious.",
            options: ["into", "to", "for"],
            correct: "into"
        },
        {
            lineA: "The lecture will be held {{blank}} the main auditorium.",
            lineB: "That space can accommodate a large audience.",
            options: ["in", "at", "on"],
            correct: "in"
        },
        {
            lineA: "The report contains information {{blank}} recent developments.",
            lineB: "Those updates are quite significant.",
            options: ["about", "on", "with"],
            correct: "about"
        },
        {
            lineA: "The company is responding {{blank}} changing market conditions.",
            lineB: "Adaptability is crucial for business success.",
            options: ["to", "for", "with"],
            correct: "to"
        },
        {
            lineA: "The medication should be taken {{blank}} meals.",
            lineB: "That helps reduce potential side effects.",
            options: ["with", "during", "at"],
            correct: "with"
        },
        {
            lineA: "The professor specializes {{blank}} environmental science.",
            lineB: "Her research in that field is widely respected.",
            options: ["in", "on", "with"],
            correct: "in"
        },
        {
            lineA: "The company is known {{blank}} its ethical practices.",
            lineB: "Corporate responsibility is increasingly important to consumers.",
            options: ["for", "by", "with"],
            correct: "for"
        },
        {
            lineA: "The conference will be held {{blank}} September 15-17.",
            lineB: "I'll mark those dates in my calendar.",
            options: ["on", "at", "during"],
            correct: "on"
        },
        {
            lineA: "The organization is dedicated {{blank}} environmental conservation.",
            lineB: "Their projects have made a significant impact.",
            options: ["to", "for", "with"],
            correct: "to"
        },
        {
            lineA: "The solution depends {{blank}} multiple factors.",
            lineB: "We need to consider all variables carefully.",
            options: ["on", "from", "with"],
            correct: "on"
        },
        {
            lineA: "The company is investing {{blank}} sustainable technologies.",
            lineB: "That's both environmentally responsible and financially smart.",
            options: ["in", "for", "on"],
            correct: "in"
        }
    ]
};

// Randomly select questions from a specific level
function getRandomQuestions(level, totalQuestions) {
    // Make a copy of the data array for the specified level
    const allQuestions = [...practiceDataByLevel[level]];
    
    // Shuffle the array
    for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    
    // Return the first n questions
    return allQuestions.slice(0, totalQuestions);
}

// Initialize with level 1 by default
let practiceData = [];
let currentLevel = "level1";

// This will be set by the app.js when a level is selected
function setLevel(level, questionsCount = 10) {
    currentLevel = level;
    practiceData = getRandomQuestions(level, questionsCount);
    return practiceData;
}