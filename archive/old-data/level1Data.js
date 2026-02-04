// Level 1 Data: Basic preposition practice
// Simple sentences with common prepositions (in, on, at, etc.)

const level1Data = [
    // Original sentences with blanks in lineA
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
        options: ["on", "with", "in"],
        correct: "in"
    },
    {
        lineA: "I go to school {{blank}} bus.",
        lineB: "I walk to school.",
        options: ["with", "by", "at"],
        correct: "by"
    },
    {
        lineA: "What do you have {{blank}} your bag?",
        lineB: "I have my lunch and some books.",
        options: ["in", "with", "at"],
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
        options: ["on", "in", "with"],
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
        options: ["at", "on", "with"],
        correct: "at"
    },
    {
        lineA: "We have class {{blank}} Monday.",
        lineB: "I know. I'll see you then.",
        options: ["in", "at", "on"],
        correct: "on"
    },
    
    // More sentences with blanks in lineA
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
        options: ["at", "with", "in"],
        correct: "at"
    },
    {
        lineA: "There's a picture {{blank}} the wall.",
        lineB: "Yes, it's very beautiful.",
        options: ["on", "in", "with"],
        correct: "on"
    },
    {
        lineA: "I'll see you {{blank}} the weekend.",
        lineB: "Great! I'm looking forward to it.",
        options: ["on", "with", "in"],
        correct: "on"
    },
    {
        lineA: "She arrived {{blank}} time for the meeting.",
        lineB: "Yes, she's always punctual.",
        options: ["in", "with", "at"],
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
    
    // Sentences with blanks in lineB
    {
        lineA: "Where is your pen?",
        lineB: "It's {{blank}} my desk.",
        options: ["on", "with", "at"],
        correct: "on"
    },
    {
        lineA: "When does the movie start?",
        lineB: "It starts {{blank}} 7 PM.",
        options: ["on", "in", "at"],
        correct: "at"
    },
    {
        lineA: "Where do you live?",
        lineB: "I live {{blank}} a small apartment.",
        options: ["on", "in", "at"],
        correct: "in"
    },
    {
        lineA: "How do you go to work?",
        lineB: "I go {{blank}} train.",
        options: ["with", "by", "at"],
        correct: "by"
    },
    {
        lineA: "Where are your glasses?",
        lineB: "They're {{blank}} my bag.",
        options: ["in", "with", "at"],
        correct: "in"
    },
    {
        lineA: "When is your birthday?",
        lineB: "It's {{blank}} May 15th.",
        options: ["in", "on", "with"],
        correct: "on"
    },
    {
        lineA: "Where is the library?",
        lineB: "It's {{blank}} First Avenue.",
        options: ["on", "in", "with"],
        correct: "on"
    },
    {
        lineA: "Where did you learn English?",
        lineB: "I learned it {{blank}} high school.",
        options: ["with", "on", "in"],
        correct: "in"
    },
    {
        lineA: "Where does your sister work?",
        lineB: "She works {{blank}} a bank.",
        options: ["at", "on", "with"],
        correct: "at"
    },
    {
        lineA: "When do we have our next class?",
        lineB: "We have it {{blank}} Thursday.",
        options: ["in", "at", "on"],
        correct: "on"
    },
    
    // More sentences with blanks in lineA
    {
        lineA: "The cat is {{blank}} the sofa.",
        lineB: "She looks very comfortable.",
        options: ["on", "at", "with"],
        correct: "on"
    },
    {
        lineA: "My birthday is {{blank}} December.",
        lineB: "That's a nice time for a birthday.",
        options: ["in", "with", "at"],
        correct: "in"
    },
    {
        lineA: "I'll call you {{blank}} 6 o'clock.",
        lineB: "I'll be waiting for your call.",
        options: ["in", "at", "on"],
        correct: "at"
    },
    {
        lineA: "The dog is sleeping {{blank}} its bed.",
        lineB: "It looks very peaceful.",
        options: ["in", "with", "at"],
        correct: "in"
    },
    {
        lineA: "There's a fly {{blank}} the ceiling.",
        lineB: "I see it too.",
        options: ["on", "with", "at"],
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
        options: ["in", "on", "with"],
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
        options: ["in", "on", "with"],
        correct: "in"
    },
    
    // More sentences with blanks in lineB
    {
        lineA: "Where did you put my book?",
        lineB: "It's {{blank}} the shelf.",
        options: ["on", "with", "at"],
        correct: "on"
    },
    {
        lineA: "When is the concert?",
        lineB: "It's {{blank}} Friday evening.",
        options: ["on", "in", "with"],
        correct: "on"
    },
    {
        lineA: "Where are the children?",
        lineB: "They're playing {{blank}} the garden.",
        options: ["in", "on", "with"],
        correct: "in"
    },
    {
        lineA: "How do you travel to school?",
        lineB: "I usually go {{blank}} car.",
        options: ["with", "by", "at"],
        correct: "by"
    },
    {
        lineA: "Where is the milk?",
        lineB: "It's {{blank}} the refrigerator.",
        options: ["in", "with", "at"],
        correct: "in"
    },
    {
        lineA: "When is your appointment?",
        lineB: "It's {{blank}} 10:30.",
        options: ["with", "at", "on"],
        correct: "at"
    },
    {
        lineA: "Where is the post office?",
        lineB: "It's {{blank}} Main Street.",
        options: ["on", "in", "at"],
        correct: "on"
    },
    {
        lineA: "Where does John work?",
        lineB: "He works {{blank}} a restaurant.",
        options: ["with", "on", "in"],
        correct: "in"
    },
    {
        lineA: "When is the meeting?",
        lineB: "It's {{blank}} Wednesday morning.",
        options: ["in", "at", "on"],
        correct: "on"
    },
    
    // More varied sentences with blanks in lineA
    {
        lineA: "The pen is {{blank}} the desk.",
        lineB: "I need it to write a note.",
        options: ["on", "with", "at"],
        correct: "on"
    },
    {
        lineA: "We have dinner {{blank}} 7 PM.",
        lineB: "That's a good time.",
        options: ["at", "in", "on"],
        correct: "at"
    },
    {
        lineA: "They live {{blank}} New York.",
        lineB: "That's a big city.",
        options: ["in", "on", "with"],
        correct: "in"
    },
    {
        lineA: "She travels {{blank}} train.",
        lineB: "I prefer to drive.",
        options: ["by", "with", "in"],
        correct: "by"
    },
    {
        lineA: "The exam is {{blank}} June 10th.",
        lineB: "I need to study more.",
        options: ["on", "in", "with"],
        correct: "on"
    },
    {
        lineA: "The bank is {{blank}} Fifth Avenue.",
        lineB: "Is it far from here?",
        options: ["on", "in", "with"],
        correct: "on"
    },
    {
        lineA: "I study English {{blank}} home.",
        lineB: "That's a good way to learn.",
        options: ["at", "on", "in"],
        correct: "at"
    },
    {
        lineA: "He works {{blank}} an office.",
        lineB: "Does he like his job?",
        options: ["in", "with", "on"],
        correct: "in"
    },
    {
        lineA: "We have a test {{blank}} Monday.",
        lineB: "I need to prepare for it.",
        options: ["on", "in", "at"],
        correct: "on"
    },
    
    // More sentences with blanks in lineB
    {
        lineA: "Where are your shoes?",
        lineB: "They're {{blank}} the closet.",
        options: ["in", "with", "at"],
        correct: "in"
    },
    {
        lineA: "When do you wake up?",
        lineB: "I usually wake up {{blank}} 6:30.",
        options: ["at", "in", "on"],
        correct: "at"
    },
    {
        lineA: "Where does your cousin live?",
        lineB: "She lives {{blank}} Canada.",
        options: ["in", "on", "with"],
        correct: "in"
    },
    {
        lineA: "When is the party?",
        lineB: "It's {{blank}} Saturday night.",
        options: ["on", "in", "with"],
        correct: "on"
    },
    {
        lineA: "Where is the supermarket?",
        lineB: "It's {{blank}} Park Street.",
        options: ["on", "in", "with"],
        correct: "on"
    },
    {
        lineA: "Where do you eat lunch?",
        lineB: "I usually eat {{blank}} the cafeteria.",
        options: ["in", "on", "with"],
        correct: "in"
    },
    {
        lineA: "Where does your father work?",
        lineB: "He works {{blank}} a factory.",
        options: ["in", "with", "on"],
        correct: "in"
    },
    {
        lineA: "When is your dentist appointment?",
        lineB: "It's {{blank}} Thursday afternoon.",
        options: ["on", "in", "at"],
        correct: "on"
    },
    
    // Additional sentences with blanks in lineA
    {
        lineA: "The flowers are {{blank}} the vase.",
        lineB: "They look beautiful.",
        options: ["in", "with", "at"],
        correct: "in"
    },
    {
        lineA: "The class starts {{blank}} 9 AM.",
        lineB: "Don't be late.",
        options: ["at", "in", "on"],
        correct: "at"
    },
    {
        lineA: "They're {{blank}} the living room.",
        lineB: "Should I join them?",
        options: ["in", "on", "at"],
        correct: "in"
    },
    {
        lineA: "The key is {{blank}} my pocket.",
        lineB: "Are you sure?",
        options: ["in", "with", "at"],
        correct: "in"
    },
    {
        lineA: "My birthday is {{blank}} October 18th.",
        lineB: "I'll remember that.",
        options: ["on", "in", "at"],
        correct: "on"
    },
    {
        lineA: "The hotel is {{blank}} Ocean Drive.",
        lineB: "That's a nice location.",
        options: ["on", "in", "with"],
        correct: "on"
    },
    {
        lineA: "She's {{blank}} the kitchen.",
        lineB: "Is she cooking dinner?",
        options: ["in", "with", "on"],
        correct: "in"
    },
    {
        lineA: "The concert is {{blank}} Friday.",
        lineB: "I already bought tickets.",
        options: ["on", "in", "at"],
        correct: "on"
    },
    
    // Final set of sentences with blanks in lineB
    {
        lineA: "Where did you leave your jacket?",
        lineB: "I left it {{blank}} the chair.",
        options: ["on", "in", "with"],
        correct: "on"
    },
    {
        lineA: "When do you go to bed?",
        lineB: "I usually go to bed {{blank}} 11 PM.",
        options: ["at", "in", "on"],
        correct: "at"
    },
    {
        lineA: "Where are the students?",
        lineB: "They're {{blank}} the classroom.",
        options: ["in", "on", "with"],
        correct: "in"
    },
    {
        lineA: "How did she get to the airport?",
        lineB: "She went {{blank}} bus.",
        options: ["by", "with", "at"],
        correct: "by"
    },
    {
        lineA: "Where are my glasses?",
        lineB: "They're {{blank}} your head!",
        options: ["on", "in", "with"],
        correct: "on"
    },
    {
        lineA: "When is the wedding?",
        lineB: "It's {{blank}} June 15th.",
        options: ["on", "in", "at"],
        correct: "on"
    },
    {
        lineA: "Where is the new cafe?",
        lineB: "It's {{blank}} Maple Avenue.",
        options: ["on", "in", "at"],
        correct: "on"
    },
    {
        lineA: "Where do you study?",
        lineB: "I study {{blank}} the library.",
        options: ["in", "with", "on"],
        correct: "in"
    },
    {
        lineA: "Where is your mother?",
        lineB: "She's {{blank}} work right now.",
        options: ["at", "in", "on"],
        correct: "at"
    }
]; 