// Color psychology profiles for the inspiration gacha ritual.
// Each color maps to an insight, a positive affirmation, inspiration themes,
// and base emotion dimensions that get personalized with user activity data.

export interface EmotionProfile {
  curiosity: number;   // 探索欲
  creativity: number;  // 创造欲
  energy: number;      // 能量感
  calm: number;        // 平静感
  fatigue: number;     // 疲惫
  loneliness: number;  // 孤独
}

export interface ColorProfile {
  id: string;
  name: string;
  gradient: string;      // css background for the orb
  glow: string;          // css box-shadow color
  insight: string;       // one-line psychological reading
  affirmation: string;   // positive closing suggestion
  themes: string[];      // inspiration keywords fed to card generation
  emotions: EmotionProfile;
  fallbackTitles: string[];
  fallbackTexts: string[];
}

// Ring positions matching the design (percent of container)
export const COLOR_RING_LAYOUT: Record<string, { x: number; y: number }> = {
  blue:   { x: 50, y: 8 },
  purple: { x: 25, y: 28 },
  green:  { x: 75, y: 28 },
  red:    { x: 13, y: 52 },
  yellow: { x: 87, y: 52 },
  orange: { x: 25, y: 76 },
  pink:   { x: 75, y: 76 },
  white:  { x: 50, y: 95 },
};

export const COLOR_PROFILES: ColorProfile[] = [
  {
    id: 'blue',
    name: '蓝',
    gradient: 'radial-gradient(circle at 32% 30%, #7cc0ff, #2170e4 68%)',
    glow: 'rgba(33,112,228,0.55)',
    insight: '你正在安静地整理内心的秩序，你要的是清晰，而不是热闹。',
    affirmation: '理清思绪的过程本身就是答案，慢慢来，你做得很好。',
    themes: ['静谧蓝调', '秩序与留白', '清晨的光'],
    emotions: { curiosity: 62, creativity: 58, energy: 44, calm: 88, fatigue: 38, loneliness: 26 },
    fallbackTitles: ['把心事折成一只蓝色的纸船', '安静的秩序感：给生活做一次留白', '蓝色时刻：一天中最诚实的十分钟'],
    fallbackTexts: ['有些答案不需要寻找，只需要安静下来，它们会自己浮出水面。愿你在蓝色的静谧里，听见自己真实的声音。', '秩序不是束缚，而是给心灵腾出呼吸的空间。当你开始整理，生活也会温柔地回应你。'],
  },
  {
    id: 'purple',
    name: '紫',
    gradient: 'radial-gradient(circle at 32% 30%, #c084fc, #7c3aed 68%)',
    glow: 'rgba(124,58,237,0.55)',
    insight: '你今天正在寻找答案，而不是寻找陪伴。',
    affirmation: '你的直觉比想象中更可靠，相信它，路已经在脚下。',
    themes: ['梦境与直觉', '暮色紫罗兰', '神秘的灵感'],
    emotions: { curiosity: 82, creativity: 78, energy: 52, calm: 46, fatigue: 46, loneliness: 31 },
    fallbackTitles: ['直觉在说话：那些梦境教我的事', '紫色黄昏里，灵感悄悄降临', '给自己的问题写一封回信'],
    fallbackTexts: ['当你开始向内寻找，世界也会向你敞开。那些看似模糊的直觉，往往是心灵最先看见的光。', '答案不在远处，而在你安静下来的那一刻。愿你今天与自己的对话，温柔而诚实。'],
  },
  {
    id: 'green',
    name: '绿',
    gradient: 'radial-gradient(circle at 32% 30%, #6ee7b7, #10b981 68%)',
    glow: 'rgba(16,185,129,0.55)',
    insight: '你心里正在萌发一些新的东西，是时候让它慢慢生长了。',
    affirmation: '成长不必着急，你已经在路上了，这本身就值得庆祝。',
    themes: ['植物与新芽', '森系呼吸', '生长的力量'],
    emotions: { curiosity: 70, creativity: 66, energy: 72, calm: 74, fatigue: 28, loneliness: 18 },
    fallbackTitles: ['像植物一样，安静地生长', '给生活种下一点绿意', '新芽日记：重新开始的力量'],
    fallbackTexts: ['每一次萌发都值得被温柔以待。不必和别人比较花期，你的季节自有安排。', '生长是安静的事。愿你像绿植一样，向着光，慢慢来，稳稳地。'],
  },
  {
    id: 'red',
    name: '红',
    gradient: 'radial-gradient(circle at 32% 30%, #fca5a5, #ef4444 68%)',
    glow: 'rgba(239,68,68,0.5)',
    insight: '你身体里有一团还没释放的热情，是时候去做那件一直想做的事了。',
    affirmation: '你的行动力是被低估的天赋，今天就迈出那一小步。',
    themes: ['热爱与行动', '炽热的瞬间', '心跳加速的时刻'],
    emotions: { curiosity: 66, creativity: 72, energy: 90, calm: 32, fatigue: 30, loneliness: 16 },
    fallbackTitles: ['把热爱活成动词', '心跳加速的瞬间，值得被记录', '今天就出发：致那件想了很久的事'],
    fallbackTexts: ['热情是灵魂的火种。当你开始行动，世界会为你让出一条路。', '不要等准备好了才开始，开始了才会慢慢准备好。你的勇气，比想象中更动人。'],
  },
  {
    id: 'yellow',
    name: '黄',
    gradient: 'radial-gradient(circle at 32% 30%, #fde047, #f59e0b 68%)',
    glow: 'rgba(245,158,11,0.5)',
    insight: '你已经准备好被看见了，你的光芒值得大方表达。',
    affirmation: '尽情发光吧，你比昨天的自己更耀眼。',
    themes: ['阳光与明亮', '柠檬色的心情', '高光时刻'],
    emotions: { curiosity: 74, creativity: 80, energy: 84, calm: 48, fatigue: 22, loneliness: 14 },
    fallbackTitles: ['把自己活成一束光', '柠檬色的好心情指南', '今天，轮到我发光了'],
    fallbackTexts: ['明亮不是张扬，而是对自己诚实的勇气。愿你的表达，被世界温柔接住。', '光会吸引光。当你开始发光，同频的人正在向你走来。'],
  },
  {
    id: 'orange',
    name: '橙',
    gradient: 'radial-gradient(circle at 32% 30%, #fdba74, #f97316 68%)',
    glow: 'rgba(249,115,22,0.5)',
    insight: '你在想念人与人之间的温度，付出一点，就会收获很多。',
    affirmation: '你的温暖是稀缺的礼物，值得的人正在珍惜它。',
    themes: ['人间烟火', '温暖的相聚', '黄昏的橘色'],
    emotions: { curiosity: 60, creativity: 62, energy: 70, calm: 58, fatigue: 34, loneliness: 40 },
    fallbackTitles: ['人间烟火气，最抚凡人心', '收集生活中温暖的瞬间', '橘色黄昏：关于相聚的小事'],
    fallbackTexts: ['温度是会传递的。你给出的每一份善意，都会以另一种方式回到你身边。', '人与人的联结，是平凡日子里最亮的光。愿你被惦记，也惦记着别人。'],
  },
  {
    id: 'pink',
    name: '粉',
    gradient: 'radial-gradient(circle at 32% 30%, #f9a8d4, #ec4899 68%)',
    glow: 'rgba(236,72,153,0.5)',
    insight: '你渴望被温柔对待，请记得，先把这份温柔给自己。',
    affirmation: '你值得所有美好的事物，从今天的小小犒赏开始。',
    themes: ['柔软与浪漫', '给自己的情书', '粉色的仪式感'],
    emotions: { curiosity: 58, creativity: 70, energy: 56, calm: 62, fatigue: 42, loneliness: 36 },
    fallbackTitles: ['写给自己的情书', '今天也要好好宠爱自己', '柔软是一种力量'],
    fallbackTexts: ['温柔不是软弱，而是看过世界之后依然选择善意。愿你先被自己好好爱着。', '给自己一点仪式感，生活就会回你一点甜。你值得这世间所有温柔的对待。'],
  },
  {
    id: 'white',
    name: '白',
    gradient: 'radial-gradient(circle at 32% 30%, #ffffff, #cbd5e1 70%)',
    glow: 'rgba(148,163,184,0.45)',
    insight: '你在给内心做减法，空白，是你此刻最好的礼物。',
    affirmation: '放下也是一种拥有，轻装上阵的你，会走得更远。',
    themes: ['极简与留白', '断舍离', '纯净的开始'],
    emotions: { curiosity: 54, creativity: 60, energy: 48, calm: 92, fatigue: 50, loneliness: 24 },
    fallbackTitles: ['给生活留一点白', '减法生活：越简单，越丰盛', '从零开始的勇气'],
    fallbackTexts: ['空白不是空无一物，而是为真正重要的事腾出位置。愿你轻装前行。', '简单，是复杂的最终形态。当你开始放下，空间与光会一起涌进来。'],
  },
];

export interface UserStats {
  postsCount: number;
  bookmarksCount: number;
  likedCount: number;
  topCategory?: string;
}

// Blend the color's base profile with the user's real activity,
// plus a tiny deterministic jitter so repeated draws feel alive.
export function computeEmotions(profile: ColorProfile, stats: UserStats): EmotionProfile {
  const jitter = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280 * 8 - 4;
  const clamp = (v: number) => Math.max(6, Math.min(96, Math.round(v)));

  const creativityBoost = Math.min(stats.postsCount * 0.5, 14);
  const curiosityBoost = Math.min(stats.bookmarksCount * 1.2, 12);
  const energyBoost = Math.min(stats.likedCount * 0.3, 8);

  const base = profile.emotions;
  const day = new Date().getDate();
  return {
    curiosity: clamp(base.curiosity + curiosityBoost + jitter(day + 1)),
    creativity: clamp(base.creativity + creativityBoost + jitter(day + 2)),
    energy: clamp(base.energy + energyBoost + jitter(day + 3)),
    calm: clamp(base.calm + jitter(day + 4)),
    fatigue: clamp(base.fatigue + jitter(day + 5)),
    loneliness: clamp(base.loneliness + jitter(day + 6)),
  };
}

// Personalized closing line referencing the user's recent activity
export function buildPersonalNote(stats: UserStats, profile: ColorProfile): string {
  const parts: string[] = [];
  if (stats.postsCount > 0) parts.push(`你已发布 ${stats.postsCount} 篇灵感`);
  if (stats.bookmarksCount > 0) parts.push(`收藏了 ${stats.bookmarksCount} 份心动`);
  if (stats.topCategory) parts.push(`最近常流连于「${stats.topCategory}」`);
  if (parts.length === 0) return `${profile.name}色的心境正在苏醒，第一篇灵感在等你。`;
  return `${parts.join('，')}——你的${profile.name}色心境，早已藏在这些痕迹里。`;
}
