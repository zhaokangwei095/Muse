// Guest identity generator: first visit gets a random aesthetic nickname
// and a generated gradient avatar, persisted in localStorage. This keeps the
// demo personal without a real account system, and leaves room to swap in
// real auth later (same User shape).

const ADJECTIVES = [
  '晨光里的', '雾中的', '慢半拍的', '青灰色的', '拾光者',
  '追风筝的', '安静的', '微醺的', '散步的', '收集',
  '窗边的', '雨后的', '失眠的', '透明的', '远方的',
];

const NOUNS = [
  '岛屿', '灯塔', '云层', '胶片', '信笺',
  '窗台', '旅人', '白猫', '诗人', '回声',
  '季风', '站台', '花园', '星轨', '潮汐',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function svgAvatar(ch: string, hue: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue},72%,62%)'/><stop offset='1' stop-color='hsl(${(hue + 70) % 360},68%,44%)'/></linearGradient></defs><rect width='160' height='160' rx='80' fill='url(#g)'/><text x='80' y='104' font-size='62' text-anchor='middle' fill='white' font-family='sans-serif'>${ch}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const STORAGE_KEY = 'muse-guest-v1';

export interface GuestProfile {
  name: string;
  handle: string;
  avatar: string;
}

export function loadOrCreateGuest(): { profile: GuestProfile; created: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { profile: JSON.parse(raw) as GuestProfile, created: false };
    }
  } catch {
    // fall through to create a new one
  }

  const name = pick(ADJECTIVES) + pick(NOUNS);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const profile: GuestProfile = {
    name,
    handle: `@muse_${suffix}`,
    avatar: svgAvatar(name.slice(-1), Math.floor(Math.random() * 360)),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return { profile, created: true };
}
