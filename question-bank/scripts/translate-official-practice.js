#!/usr/bin/env node
/**
 * Phase 2 — Official Exam Practice pool.
 * Merges Simplified Chinese translations onto the Phase 1 English-only
 * staging.json, producing translated.json. Never touches correctChoice,
 * ids, sources, or the English text — additive only.
 */
const fs = require("fs");
const path = require("path");

const STAGING_PATH = path.join(__dirname, "..", "official-practice", "staging.json");
const OUTPUT_PATH = path.join(__dirname, "..", "official-practice", "translated.json");

// id -> { question: zh, choices: { a, b, c, d } }
const translations = {
  "official-practice-001": {
    question: "由植物寄生虫引起的疾病示例是",
    choices: { a: "白喉。", b: "肝炎。", c: "癣。", d: "疥疮。" },
  },
  "official-practice-002": {
    question: "单体液、UV凝胶和粘合剂会产生",
    choices: { a: "烟雾。", b: "气体。", c: "粉尘。", d: "蒸气。" },
  },
  "official-practice-003": {
    question: "以下哪项是继发性皮损？",
    choices: { a: "肿瘤", b: "皲裂", c: "丘疹", d: "大疱" },
  },
  "official-practice-004": {
    question: "以下哪项是指甲油、亮油和底油的特性？",
    choices: {
      a: "指甲经过打磨处理后，它们的附着效果最好。",
      b: "它们通过蒸发起作用。",
      c: "它们会发生聚合反应。",
      d: "它们需要催化剂。",
    },
  },
  "official-practice-005": {
    question: "结节的示例是",
    choices: { a: "痤疮。", b: "雀斑。", c: "囊肿。", d: "疣。" },
  },
  "official-practice-006": {
    question: "天然指甲的一个特性是",
    choices: {
      a: "它们是皮肤的附属器官。",
      b: "它们主要由钙构成。",
      c: "老年人的指甲生长速度最快。",
      d: "甲板的生长完全依赖于循环系统。",
    },
  },
  "official-practice-007": {
    question: "嵌甲的专业术语是",
    choices: { a: "嵌甲症。", b: "咬甲癖。", c: "甲真菌病。", d: "甲炎。" },
  },
  "official-practice-008": {
    question: "一种会影响甲床、使甲板下方出现被称为鲑鱼斑的黄红色斑点的疾病是",
    choices: { a: "嵌甲症。", b: "甲剥离。", c: "甲银屑病。", d: "甲沟炎。" },
  },
  "official-practice-009": {
    question: "从业者不慎用金属器械划伤了客户。该器械需要被",
    choices: { a: "丢弃。", b: "消毒。", c: "灭菌。", d: "双层打包后丢弃。" },
  },
  "official-practice-010": {
    question: "以下哪块肌肉能使脚向上移动并伸展脚趾？",
    choices: { a: "趾长伸肌", b: "胫骨前肌", c: "腓骨长肌", d: "比目鱼肌" },
  },
  "official-practice-011": {
    question: "器械从消毒剂中取出后应如何处理？",
    choices: {
      a: "更换为正在使用中的器械",
      b: "喷洒抗菌溶剂",
      c: "用水彻底冲洗并擦干",
      d: "用吸水材料覆盖",
    },
  },
  "official-practice-012": {
    question: "细菌也被称为",
    choices: { a: "寄生虫。", b: "微生物/病菌。", c: "病毒。", d: "真菌。" },
  },
  "official-practice-013": {
    question: "手部和足部的骨骼是什么？",
    choices: { a: "腕骨", b: "距骨", c: "指骨/趾骨", d: "转子" },
  },
  "official-practice-014": {
    question: "以下哪项是人体最大的器官？",
    choices: { a: "心脏", b: "大脑", c: "皮肤", d: "肺" },
  },
  "official-practice-015": {
    question: "甲真菌病的病因是什么？",
    choices: { a: "角蛋白", b: "真菌", c: "细菌", d: "炎症" },
  },
  "official-practice-016": {
    question: "在为有倒刺的客户提供咨询时，正确的护理建议是",
    choices: {
      a: "剪除周围皮肤。",
      b: "小心地抛光甲板。",
      c: "接受热油手部美甲护理。",
      d: "建议客户考虑做美甲增强。",
    },
  },
  "official-practice-017": {
    question: "附着在甲板上的甲小皮被视为一种",
    choices: { a: "神经。", b: "血管。", c: "组织。", d: "甲母质。" },
  },
  "official-practice-018": {
    question: "甲小皮软化剂不应停留超过10分钟，原因是其含有以下成分",
    choices: {
      a: "甘油。",
      b: "6%的过氧化氢。",
      c: "2%至5%的氢氧化钠或氢氧化钾。",
      d: "硅酮。",
    },
  },
  "official-practice-019": {
    question: "以下哪项是一次性用品的示例？",
    choices: { a: "玻璃锉", b: "甲钳", c: "浮石", d: "金属推皮棒" },
  },
  "official-practice-020": {
    question: "什么决定了天然指甲的厚度、宽度和弧度？",
    choices: { a: "甲床", b: "甲下皮", c: "甲上皮", d: "甲母质" },
  },
  "official-practice-021": {
    question: "关于多次使用用品和一次性用品，以下哪项是正确的？",
    choices: {
      a: "多次使用用品无需清洁即可为不同客户重复使用",
      b: "一次性用品若存放在客户专属包内，可为同一客户重复使用",
      c: "一次性用品具有多孔性，每次使用后都必须丢弃",
      d: "多次使用用品是无孔的，且无法消毒",
    },
  },
  "official-practice-022": {
    question: "寄生虫需要以下哪项才能生存？",
    choices: { a: "宿主", b: "病原体", c: "毒素", d: "病毒" },
  },
  "official-practice-023": {
    question:
      "指甲疾病的明显迹象包括发红、肿胀、流脓，并可能使客户感到疼痛。出现这些情况时，美甲师应始终与客户沟通并",
    choices: {
      a: "提供基础手部或足部美甲护理服务。",
      b: "执行安全的卫生操作规范。",
      c: "将客户转介给医疗专业人员。",
      d: "佩戴防护手套。",
    },
  },
  "official-practice-024": {
    question: "以下哪项是负责制定并执行安全与健康标准的政府机构？",
    choices: {
      a: "物料安全数据表",
      b: "环境保护署",
      c: "职业安全与健康管理局",
      d: "普遍预防措施",
    },
  },
  "official-practice-025": {
    question: "无法消毒的物品被称为",
    choices: { a: "可重复使用的。", b: "多次使用的。", c: "客户包。", d: "一次性使用的。" },
  },
  "official-practice-026": {
    question: "最大的腿骨是",
    choices: { a: "股骨。", b: "胫骨。", c: "髌骨。", d: "腓骨。" },
  },
  "official-practice-027": {
    question: "以下哪项是可能产生热量的化学反应？",
    choices: { a: "乳化", b: "悬浮", c: "催化剂", d: "聚合反应" },
  },
  "official-practice-028": {
    question: "以下哪项是指甲上的白点？",
    choices: { a: "嵌甲症", b: "咬甲癖", c: "白甲症", d: "甲肥厚症" },
  },
  "official-practice-029": {
    question: "在服务过程中，被血液污染的一次性用品必须被",
    choices: { a: "消毒。", b: "丢弃。", c: "擦拭干净。", d: "用肥皂清洗。" },
  },
  "official-practice-030": {
    question: "皮肤真皮层的另一个名称是什么？",
    choices: { a: "棘层", b: "角质层", c: "真皮", d: "基底细胞" },
  },
  "official-practice-031": {
    question: "沙龙产品作用于皮肤的哪一层？",
    choices: { a: "生发层", b: "角质层", c: "透明层", d: "黏液层" },
  },
  "official-practice-032": {
    question: "指甲的特殊韧带具有什么功能？",
    choices: {
      a: "形成保护屏障，防止细菌进入甲床",
      b: "将甲床连接到骨骼",
      c: "将甲板连接到甲床",
      d: "在指甲两侧形成沟槽，使指甲在生长时能够移动",
    },
  },
  "official-practice-033": {
    question: "皮肤的哪一层会持续脱落，并由角蛋白构成的细胞替换？",
    choices: { a: "乳头层", b: "角质层", c: "棘层", d: "真皮层" },
  },
  "official-practice-034": {
    question: "甲板从甲母质延伸到",
    choices: { a: "甲小皮。", b: "甲半月。", c: "甲床。", d: "游离缘。" },
  },
  "official-practice-035": {
    question: "以下哪项具有pH值？",
    choices: { a: "甲小皮油", b: "洗涤剂", c: "指甲油", d: "单体液" },
  },
  "official-practice-036": {
    question: "弧度增大的甲板在游离缘处有较深或较尖锐的弧度。这种形状由以下哪项决定",
    choices: { a: "甲母质。", b: "甲床。", c: "淤伤的指甲。", d: "博氏线。" },
  },
  "official-practice-037": {
    question: "以下哪项描述了甲沟炎？",
    choices: {
      a: "它是一种足部真菌感染。",
      b: "它是指甲或趾甲变暗。",
      c: "它是甲周组织的细菌感染。",
      d: "它会导致甲板表面出现细小凹陷或严重粗糙。",
    },
  },
  "official-practice-038": {
    question:
      "健康人体甲板的生长在很大程度上取决于合理的饮食、运动和身体健康状况。而其形状、宽度和厚度则取决于",
    choices: { a: "甲床。", b: "甲母质。", c: "甲板。", d: "甲襞。" },
  },
  "official-practice-039": {
    question: "加速化学反应的物质名称是什么？",
    choices: { a: "抑制剂", b: "催化剂", c: "蒸发", d: "底剂" },
  },
  "official-practice-040": {
    question: "使掌心向上转动的肌肉名称是什么？",
    choices: { a: "屈肌", b: "旋后肌", c: "旋前肌", d: "伸肌" },
  },
  "official-practice-041": {
    question: "在足部美甲护理中，涂抹以下哪项可以去除死皮？",
    choices: { a: "石蜡", b: "泡脚液", c: "轻抚法", d: "去角质磨砂膏" },
  },
  "official-practice-042": {
    question:
      "在提供足部美甲护理服务时，切记不要推压或剪除甲上皮，这一点极为重要。对于患有以下疾病的客户尤其重要",
    choices: { a: "足癣。", b: "糖尿病。", c: "甲病。", d: "倒刺。" },
  },
  "official-practice-043": {
    question: "足部按摩被定义为揉搓、捏、揉捻和轻拍。医学词典将这些动作称为",
    choices: {
      a: "跖骨剪。",
      b: "一种手法操作。",
      c: "轻抚法动作。",
      d: "拳式扭转按压。",
    },
  },
  "official-practice-044": {
    question: "以下哪项是足部美甲护理中按压脚背皮肤组织的放松手法？",
    choices: { a: "轻抚法", b: "揉捏法", c: "叩击法", d: "摩擦法" },
  },
  "official-practice-045": {
    question: "水晶甲的卸除需要使用以下哪种液体？",
    choices: { a: "干燥剂", b: "丙酮", c: "底剂", d: "树脂" },
  },
  "official-practice-046": {
    question:
      "在为手部美甲护理进行客户评估时，发现一根指甲周围的皮肤发红肿胀。从业者应采取什么行动？",
    choices: {
      a: "为指甲提供服务，但避免触碰发红的那根",
      b: "告知客户这一情况，并将客户转介给医生",
      c: "在服务中使用低致敏性产品",
      d: "待真菌感染痊愈后重新预约",
    },
  },
  "official-practice-047": {
    question: "美甲师在进行足部按摩时会使用以下哪项？",
    choices: { a: "乳液", b: "磨砂膏", c: "防腐剂", d: "水" },
  },
  "official-practice-048": {
    question: "在手部美甲护理中，哪种器械能为天然指甲增加光泽并抚平波状隆起？",
    choices: { a: "粗目锉", b: "金属锉", c: "指甲刷", d: "抛光棒" },
  },
  "official-practice-049": {
    question: "使用哪种光源可以固化凝胶指甲？",
    choices: { a: "紫外线", b: "白炽灯", c: "荧光灯", d: "红外线" },
  },
  "official-practice-050": {
    question: "对于希望指甲能够轻松卸除的客户，推荐使用以下哪种凝胶产品？",
    choices: { a: "塑形凝胶", b: "自流平凝胶", c: "风干型凝胶", d: "软凝胶" },
  },
  "official-practice-051": {
    question: "美甲增强产品出现翘起问题通常是由于",
    choices: {
      a: "未充分打磨甲板。",
      b: "准备工作不当；未做到清洁和干燥。",
      c: "未用油护理甲板。",
      d: "去除了甲小皮。",
    },
  },
  "official-practice-052": {
    question: "以下哪项可用于溶解直接粘附在甲板上的软组织？",
    choices: { a: "丙酮", b: "指甲漂白剂", c: "甲小皮软化剂", d: "指甲护理素" },
  },
  "official-practice-053": {
    question: "以下哪种器械在为客户使用后需要丢弃？",
    choices: { a: "磨甲锉", b: "指甲剪", c: "金属推皮棒", d: "甲钳" },
  },
  "official-practice-054": {
    question: "在制作人工甲的过程中，以下哪项可以加速化学反应过程？",
    choices: { a: "引发剂", b: "催化剂", c: "聚合反应", d: "水晶甲液" },
  },
  "official-practice-055": {
    question: "在手部美甲护理中，以下哪项用于清洁并软化指甲？",
    choices: { a: "浸指碗", b: "加温乳液", c: "推皮棒", d: "免洗洗手液" },
  },
  "official-practice-056": {
    question: "在手部美甲护理中，推荐使用以下哪种磨甲锉修整指甲形状？",
    choices: { a: "中目", b: "电动锉", c: "粗目", d: "抛光棒" },
  },
  "official-practice-057": {
    question: "以下哪项是沙龙中最安全、最常用的溶剂之一？",
    choices: { a: "底剂", b: "丙烯酸酯", c: "丙酮", d: "指甲油" },
  },
  "official-practice-058": {
    question: "以下哪项是水晶甲硬化过程中三种基本成分之一？",
    choices: { a: "底剂", b: "粘合剂", c: "单体液", d: "硬化剂" },
  },
  "official-practice-059": {
    question: "以下哪项可以磨平足部胼胝？",
    choices: { a: "足锉", b: "毛巾", c: "温水", d: "刮匙" },
  },
  "official-practice-060": {
    question: "足部美甲护理完成后，从业者洗手时间至少应持续多少秒？",
    choices: { a: "5", b: "10", c: "15", d: "30" },
  },
  "official-practice-061": {
    question: "以下哪种天然指甲锉磨方式可能导致嵌甲？",
    choices: {
      a: "来回锉磨",
      b: "锉入两侧甲角",
      c: "之字形动作",
      d: "在浸指碗中浸泡之后",
    },
  },
  "official-practice-062": {
    question: "出现以下哪种情况时，从业者应拒绝为客户提供服务？",
    choices: {
      a: "感染、炎症或肿胀",
      b: "变色和淤伤",
      c: "脆弱、柔软且弯曲的指甲",
      d: "脊纹、白点或裂纹",
    },
  },
  "official-practice-063": {
    question: "以下哪种按摩手法用于足底以刺激血液循环？",
    choices: { a: "轻抚法", b: "揉捏法", c: "叩击法", d: "摩擦法" },
  },
  "official-practice-064": {
    question: "客户美甲咨询表上的哪项内容有助于保护从业者免于承担责任？",
    choices: { a: "病史", b: "客户转介", c: "服务费", d: "沟通偏好" },
  },
  "official-practice-065": {
    question: "以下哪项是将甲片固定到天然指甲上的粘合剂？",
    choices: { a: "织物包裹", b: "底剂", c: "粘合剂", d: "单体液" },
  },
  "official-practice-066": {
    question: "凝胶甲上的阻聚层应使用以下哪项去除",
    choices: { a: "凝胶封层剂。", b: "引发剂。", c: "活化剂。", d: "凝胶清洁剂。" },
  },
  "official-practice-067": {
    question: "打造精美雕塑指甲的过程是单体液与以下哪项的结合",
    choices: { a: "聚合反应。", b: "玻璃纤维。", c: "黏度。", d: "聚合物粉。" },
  },
  "official-practice-068": {
    question: "在进行足部美甲护理时，客户双脚浸泡在足浴中时绝不应添加哪种溶液？",
    choices: { a: "防腐剂", b: "液体皂", c: "消毒剂", d: "泡脚液" },
  },
  "official-practice-069": {
    question: "以下哪项应用于涂抹甲小皮软化剂？",
    choices: { a: "三面抛光棒", b: "甲小皮钳", c: "棉头木棒", d: "指甲刷" },
  },
  "official-practice-070": {
    question: "在足部美甲护理中，为使客户放松而应熟练掌握并运用的按摩手法被称为",
    choices: { a: "叩击法。", b: "摩擦法。", c: "轻抚法。", d: "揉捏法。" },
  },
  "official-practice-071": {
    question:
      "对于提供美甲增强服务的从业者来说，购置一台电动磨甲机很有帮助。选购时需要考虑机器的扭矩。扭矩指的是机器的",
    choices: { a: "转速。", b: "用途。", c: "保养。", d: "动力。" },
  },
  "official-practice-072": {
    question: "以下哪项服务推荐用于干性皮肤和指甲？",
    choices: { a: "热油/乳液护理", b: "反射疗法", c: "指甲护理素", d: "按摩乳液" },
  },
  "official-practice-073": {
    question:
      "美甲师准备为下一位客户提供甲片增强服务。用于将甲片固定到客户天然指甲上的粘合剂被称为",
    choices: {
      a: "刮匙。",
      b: "粘合剂。",
      c: "底剂。",
      d: "修补贴片。",
    },
  },
  "official-practice-074": {
    question: "在贴甲片之前去除甲板上残留的油脂需要使用以下哪种产品？",
    choices: { a: "覆盖层", b: "树脂", c: "促进剂", d: "干燥剂" },
  },
  "official-practice-075": {
    question: "以下哪种器械用于修形并缩短甲板长度？",
    choices: { a: "抛光棒", b: "推皮棒", c: "甲钳", d: "指甲锉" },
  },
  "official-practice-076": {
    question: "美甲服务完成后，一次性器械应放入以下哪种容器？",
    choices: {
      a: "垃圾桶",
      b: "清洁溶液",
      c: "工作台抽屉",
      d: "贴有生物危害标志的密封塑料袋",
    },
  },
  "official-practice-077": {
    question: "以下哪种器械可用于松开甲小皮？",
    choices: { a: "木质推皮棒", b: "甲钳", c: "抛光棒", d: "金属刮刀" },
  },
  "official-practice-078": {
    question: "在抛光甲板时，应抬起抛光棒以防止",
    choices: { a: "斜边。", b: "发黄。", c: "划痕。", d: "灼伤。" },
  },
  "official-practice-079": {
    question: "以下哪种用品可以去除游离缘下方的变色？",
    choices: { a: "卸甲水", b: "指甲漂白剂", c: "防晒稳定剂", d: "底油" },
  },
  "official-practice-080": {
    question: "如果客户的光固化指甲经常断裂，应涂抹含有以下哪种成分的凝胶来增强指甲强度？",
    choices: { a: "织物", b: "单体液", c: "聚合物", d: "促进剂" },
  },
  "official-practice-081": {
    question: "在足部美甲护理中，可使用以下哪项软化干燥脱皮的皮肤和胼胝",
    choices: { a: "磨砂膏。", b: "粉末。", c: "丙酮。", d: "防腐剂。" },
  },
  "official-practice-082": {
    question: "以下哪种光源用于固化人工甲产品？",
    choices: { a: "荧光灯", b: "白炽灯", c: "LED灯", d: "紫外线灯" },
  },
  "official-practice-083": {
    question: "以下哪种产品应添加到足浴中？",
    choices: { a: "乳液", b: "消毒剂", c: "泡脚液", d: "去角质磨砂膏" },
  },
  "official-practice-084": {
    question: "在涂抹底剂之前，使用以下哪项去除甲板上的水分和油脂，以便进行水晶甲护理？",
    choices: { a: "防腐剂", b: "干燥剂", c: "粘合剂", d: "单体液" },
  },
  "official-practice-085": {
    question:
      "在基础手部美甲护理中，修剪指甲时应格外小心。指甲较薄且更脆弱，修剪时应",
    choices: {
      a: "浸泡后朝任意方向锉磨。",
      b: "从右侧锉向中间，再从左侧锉向中间。",
      c: "从右侧锉向中间，再从左侧锉向中间，指甲应保持湿润。",
      d: "以来回拉锯的方式锉磨。",
    },
  },
  "official-practice-086": {
    question: "一次性美甲器械之所以被丢弃，是因为它们",
    choices: {
      a: "无法被消毒并重复使用。",
      b: "价格低廉且易于更换。",
      c: "由可回收材料制成。",
      d: "含有非致病性微生物。",
    },
  },
  "official-practice-087": {
    question: "哪种护理被视为一种奢华的附加项目，能够锁住皮肤水分并促进血液循环？",
    choices: { a: "护理油手部美甲护理", b: "揉捏法", c: "芳香疗法", d: "石蜡护理" },
  },
  "official-practice-088": {
    question: "甲片的哪个部位设有定位止点，用于与天然指甲对齐？",
    choices: { a: "包裹层", b: "游离缘", c: "尖端", d: "贴合槽" },
  },
  "official-practice-089": {
    question: "磨甲锉用于去除并修整以下哪项？",
    choices: { a: "甲半月", b: "甲床", c: "甲小皮", d: "游离缘" },
  },
  "official-practice-090": {
    question: "使用电动磨甲机时，若转速调得过高，会导致",
    choices: { a: "热量减少。", b: "表面暗淡。", c: "完美的表面。", d: "过热。" },
  },
  "official-practice-091": {
    question: "一位客户长期手部冰凉且皮肤干燥。针对这种情况，推荐以下哪种护理？",
    choices: { a: "芳香疗法", b: "石蜡护理", c: "去角质", d: "手膜护理" },
  },
  "official-practice-092": {
    question:
      "由于按摩会促进血液循环，以下哪种病症在提供按摩服务前需要获得医生批准？",
    choices: { a: "指甲疾患", b: "咬甲癖", c: "高血压", d: "甲纵裂" },
  },
  "official-practice-093": {
    question: "水晶甲护理使用以下哪种产品去除甲板上的水分和油脂？",
    choices: { a: "底剂", b: "干燥剂", c: "聚合物粉", d: "单体液" },
  },
  "official-practice-094": {
    question: "可重复使用的甲模由铝或以下哪种材料制成",
    choices: { a: "塑料。", b: "纸。", c: "聚酯薄膜。", d: "ABS塑料。" },
  },
  "official-practice-095": {
    question: "以下哪种产品在涂抹彩色指甲油之前使用？",
    choices: { a: "封层剂", b: "指甲干燥剂", c: "底油", d: "护甲油" },
  },
  "official-practice-096": {
    question: "在手部美甲护理中，使用以下哪种器械清除游离缘下方的碎屑？",
    choices: { a: "指甲剪", b: "推皮棒", c: "指甲锉", d: "指甲刷" },
  },
  "official-practice-097": {
    question: "在手部和足部美甲护理中使用的以下哪种放松按摩手法是缓慢、有节奏且抚摸式的？",
    choices: { a: "叩击法", b: "振动法", c: "揉捏法", d: "轻抚法" },
  },
  "official-practice-098": {
    question: "以下哪种美甲器械和用品需要在每次服务前后都进行消毒？",
    choices: { a: "金属推皮棒", b: "三面或四面抛光棒", c: "毛巾", d: "手臂垫" },
  },
  "official-practice-099": {
    question: "以下哪项包含成功完成美甲服务所需的信息？",
    choices: { a: "沙龙服务菜单", b: "预约安排", c: "咨询区", d: "客户档案卡" },
  },
  "official-practice-100": {
    question: "UV凝胶需要以下哪项来提高其与指甲的附着力？",
    choices: { a: "底剂", b: "封层剂", c: "刷子", d: "促进剂" },
  },
};

function main() {
  const staging = JSON.parse(fs.readFileSync(STAGING_PATH, "utf8"));

  if (staging.questions.length !== 100) {
    throw new Error(`Expected 100 staged questions, found ${staging.questions.length}`);
  }
  const stagedIds = staging.questions.map((q) => q.id);
  const translationIds = Object.keys(translations);
  if (
    translationIds.length !== stagedIds.length ||
    translationIds.some((id, index) => id !== stagedIds[index])
  ) {
    throw new Error("Translation ids must exactly match staged ids in source order");
  }

  const translatedQuestions = staging.questions.map((q) => {
    const t = translations[q.id];
    if (!t) throw new Error(`Missing translation for ${q.id}`);
    if (!t.question || !t.question.trim()) throw new Error(`Empty question.zh for ${q.id}`);
    if (/[?,;]/.test(t.question)) {
      throw new Error(`Use Chinese punctuation in question.zh for ${q.id}`);
    }

    const stagedChoiceIds = q.choices.map((choice) => choice.id);
    const translatedChoiceIds = Object.keys(t.choices);
    if (
      q.choices.length !== 4 ||
      translatedChoiceIds.length !== stagedChoiceIds.length ||
      translatedChoiceIds.some((id, index) => id !== stagedChoiceIds[index])
    ) {
      throw new Error(`Translation choices must exactly match staged choices for ${q.id}`);
    }

    const originalCorrect = q.correctChoice;

    const choices = q.choices.map((c) => {
      const zh = t.choices[c.id];
      if (!zh || !zh.trim()) throw new Error(`Empty choices[${c.id}].zh for ${q.id}`);
      if (/[?,;]/.test(zh)) {
        throw new Error(`Use Chinese punctuation in choices[${c.id}].zh for ${q.id}`);
      }
      return { ...c, zh };
    });
    if (new Set(choices.map((choice) => choice.zh)).size !== choices.length) {
      throw new Error(`Duplicate Chinese choice translation for ${q.id}`);
    }

    const result = {
      ...q,
      question: { ...q.question, zh: t.question },
      choices,
    };

    // Guard: translation must never alter correctChoice or English text.
    if (result.correctChoice !== originalCorrect) {
      throw new Error(`correctChoice drifted for ${q.id}`);
    }
    result.choices.forEach((c, i) => {
      if (c.en !== q.choices[i].en) throw new Error(`English choice text drifted for ${q.id}`);
    });
    if (result.question.en !== q.question.en) throw new Error(`English question text drifted for ${q.id}`);

    return result;
  });

  const output = {
    ...staging,
    questions: translatedQuestions,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");
  console.log(`Wrote ${translatedQuestions.length} translated questions to ${OUTPUT_PATH}`);
}

main();
