export type WordStatus = 'new' | 'learning' | 'known'

export interface PictureVocabularyWord {
  image: string
  english: string
  chinese: string
}

export interface PictureVocabularySet {
  id: string
  name: string
  words: PictureVocabularyWord[]
}

export const pictureVocabularySets: PictureVocabularySet[] = [
  {
    id: 'set1',
    name: 'Set 1',
    words: [
      { image: '/picture-vocabulary/headphones.webp', english: 'headphones', chinese: '耳机' },
      { image: '/picture-vocabulary/basketball.webp', english: 'basketball', chinese: '篮球' },
      { image: '/picture-vocabulary/ski.webp', english: 'skiing', chinese: '滑雪' },
      { image: '/picture-vocabulary/windsurfing.webp', english: 'windsurfing', chinese: '帆板运动' },
      { image: '/picture-vocabulary/rollercoaster.webp', english: 'roller coaster', chinese: '过山车' },
      { image: '/picture-vocabulary/tree_roots.webp', english: 'tree roots', chinese: '树根' },
      { image: '/picture-vocabulary/lungs.webp', english: 'lungs', chinese: '肺' },
      { image: '/picture-vocabulary/mud.webp', english: 'mud', chinese: '泥' },
      { image: '/picture-vocabulary/ladder.webp', english: 'ladder', chinese: '梯子' },
      { image: '/picture-vocabulary/duck.webp', english: 'duck', chinese: '鸭子' },
      { image: '/picture-vocabulary/cliff_diving.webp', english: 'cliff diving', chinese: '悬崖跳水' },
      { image: '/picture-vocabulary/button.webp', english: 'button', chinese: '按钮' },
      { image: '/picture-vocabulary/sewing_machine.webp', english: 'sewing machine', chinese: '缝纫机' },
      { image: '/picture-vocabulary/backpack.webp', english: 'backpack', chinese: '背包' },
      { image: '/picture-vocabulary/train.webp', english: 'train', chinese: '火车' },
      { image: '/picture-vocabulary/windmill.webp', english: 'windmill', chinese: '风车' },
    ],
  },
  {
    id: 'set2',
    name: 'Set 2',
    words: [
      { image: '/picture-vocabulary/wallet.webp', english: 'wallet', chinese: '钱包' },
      { image: '/picture-vocabulary/scale.webp', english: 'scale', chinese: '体重秤 / 秤' },
      { image: '/picture-vocabulary/ceiling_fan.webp', english: 'ceiling fan', chinese: '吊扇' },
      { image: '/picture-vocabulary/dishes.webp', english: 'dishes', chinese: '碗碟 / 餐具' },
      { image: '/picture-vocabulary/ambulance.webp', english: 'ambulance', chinese: '救护车' },
      { image: '/picture-vocabulary/qr_code.webp', english: 'QR code', chinese: '二维码' },
      { image: '/picture-vocabulary/pocket.webp', english: 'pocket', chinese: '口袋' },
      { image: '/picture-vocabulary/reef.webp', english: 'reef', chinese: '珊瑚礁' },
      { image: '/picture-vocabulary/glacier.webp', english: 'glacier', chinese: '冰川' },
      { image: '/picture-vocabulary/rain_forest.webp', english: 'rain forest', chinese: '雨林' },
      { image: '/picture-vocabulary/oven.webp', english: 'oven', chinese: '烤箱' },
      { image: '/picture-vocabulary/squirrel.webp', english: 'squirrel', chinese: '松鼠' },
      { image: '/picture-vocabulary/fireflies.webp', english: 'fireflies', chinese: '萤火虫' },
      { image: '/picture-vocabulary/lollipop.webp', english: 'lollipop', chinese: '棒棒糖' },
      { image: '/picture-vocabulary/scarf.webp', english: 'scarf', chinese: '围巾' },
      { image: '/picture-vocabulary/broccoli.webp', english: 'broccoli', chinese: '西兰花' },
      { image: '/picture-vocabulary/tomato.webp', english: 'tomato', chinese: '番茄' },
      { image: '/picture-vocabulary/carrot.webp', english: 'carrot', chinese: '胡萝卜' },
      { image: '/picture-vocabulary/peppers.webp', english: 'peppers', chinese: '辣椒 / 青椒' },
      { image: '/picture-vocabulary/vegetables.webp', english: 'vegetables', chinese: '蔬菜' },
      { image: '/picture-vocabulary/pineapple.webp', english: 'pineapple', chinese: '菠萝' },
      { image: '/picture-vocabulary/mango.webp', english: 'mango', chinese: '芒果' },
      { image: '/picture-vocabulary/bread.webp', english: 'bread', chinese: '面包' },
      { image: '/picture-vocabulary/soy_sauce.webp', english: 'soy sauce', chinese: '酱油' },
      { image: '/picture-vocabulary/soda.webp', english: 'soda', chinese: '汽水' },
      { image: '/picture-vocabulary/milk.webp', english: 'milk', chinese: '牛奶' },
    ],
  },
]
