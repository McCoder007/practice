import { QuestionDataV2 } from '@/components/QuizV2';

const tooEnoughQuizData: QuestionDataV2[] = [
  // From Section B
  {
    lineA: "Leo ate {{blank}} fries, and he put {{blank}} salt on them.",
    options: ["too many", "too much", "enough", "too"],
    correct: ["too many", "too much"]
  },
  {
    lineA: "Carla's still hungry because she didn't eat {{blank}} food.",
    options: ["enough", "too much", "too many", "too"],
    correct: "enough"
  },
  {
    lineA: "Leo is {{blank}} full, but Carla isn't. Her salad wasn't filling {{blank}}.",
    options: ["too", "enough", "too much", "too many"],
    correct: ["too", "enough"]
  },
  {
    lineA: "Carla eats {{blank}} slowly. She doesn't eat fast {{blank}}.",
    options: ["too", "enough", "too much", "too many"],
    correct: ["too", "enough"]
  },
  // From Section A
  {
    lineA: "I eat {{blank}} fast food and not {{blank}} fruits and vegetables.",
    options: ["too much", "enough", "too many", "too"],
    correct: ["too much", "enough"]
  },
  {
    lineA: "There's never {{blank}} time to shop or cook during the week, so I eat out a lot.",
    options: ["enough", "too much", "too many", "too"],
    correct: "enough"
  },
  {
    lineA: "During my exams, I study {{blank}} and I don't sleep {{blank}}.",
    options: ["too much", "enough", "too many", "too"],
    correct: ["too much", "enough"]
  },
  {
    lineA: "I don't like fried foods - there's {{blank}} fat in them. It's better to grill or steam food.",
    options: ["too much", "enough", "too many", "too"],
    correct: "too much"
  },
  {
    lineA: "I don't like fried foods - there's {{blank}} fat in them.",
    options: ["too much", "enough", "too many", "too"],
    correct: "too much"
  },
  {
    lineA: "If I don't eat {{blank}} for breakfast, or if breakfast isn't filling {{blank}}, I'm usually hungry to wait for lunch.",
    options: ["enough", "too much", "too many", "too"],
    correct: ["enough", "enough"]
  },
  {
    lineA: "Sometimes, I eat {{blank}} fast and I get a stomachache.",
    options: ["too", "enough", "too much", "too many"],
    correct: "too"
  },
  {
    lineA: "I don't like ice cream. I find most desserts are {{blank}}.",
    options: ["too sweet", "sweet enough", "too much sweet", "enough sweet"],
    correct: "too sweet"
  },
  {
    lineA: "I don't like ice cream. I find most desserts are {{blank}} sweet for me.",
    options: ["too", "enough", "too much", "too many"],
    correct: "too"
  },
  {
    lineA: "I get sick if I eat {{blank}} fatty things.",
    options: ["too many", "too much", "enough", "too"],
    correct: "too many"
  },
  {
    lineA: "I'm probably {{blank}} careful about what I eat.",
    options: ["enough", "too", "too much", "too many"],
    correct: "too"
  }
];

export default tooEnoughQuizData; 