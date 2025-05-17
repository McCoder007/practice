/**
 * Example script to add Day 13 using the new system
 */

const { addNewDay } = require('./addNewDay');

addNewDay(13, 'Transportation and Travel', [
  {
    word: 'subway',
    chinese: '地铁',
    partOfSpeech: 'noun',
    simpleSentence: 'I take the subway to work every day.',
    chineseSentence: '我每天坐地铁去上班。'
  },
  {
    word: 'airport',
    chinese: '机场',
    partOfSpeech: 'noun',
    simpleSentence: 'We arrived at the airport two hours early.',
    chineseSentence: '我们提前两小时到达了机场。'
  },
  {
    word: 'bus stop',
    chinese: '公交车站',
    partOfSpeech: 'noun',
    simpleSentence: 'The bus stop is just around the corner.',
    chineseSentence: '公交车站就在拐角处。'
  },
  {
    word: 'ticket',
    chinese: '票',
    partOfSpeech: 'noun',
    simpleSentence: 'I need to buy a train ticket.',
    chineseSentence: '我需要买一张火车票。'
  },
  {
    word: 'delay',
    chinese: '延误',
    partOfSpeech: 'noun/verb',
    simpleSentence: 'Our flight has a two-hour delay.',
    chineseSentence: '我们的航班有两小时的延误。'
  }
]); 