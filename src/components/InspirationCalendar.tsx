import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

interface DayActivity {
  date: string;
  postsCount: number;
  likesCount: number;
}

// Intensity levels based on harvested likes that day
function levelOf(likes: number): number {
  if (likes <= 0) return 0;
  if (likes <= 4) return 1;
  if (likes <= 11) return 2;
  if (likes <= 24) return 3;
  return 4;
}

const LEVEL_CLASSES = [
  'bg-slate-200/70 dark:bg-slate-700/40',
  'bg-[#adc6ff]/70 dark:bg-[#adc6ff]/40',
  'bg-[#2170e4]/75',
  'bg-[#0058be]',
  'bg-[#083a7d] shadow-[0_0_6px_rgba(0,88,190,0.6)]',
];

const WEEKDAY_LABELS = ['一', '', '三', '', '五', '', ''];

export const InspirationCalendar: React.FC = () => {
  const [activity, setActivity] = useState<DayActivity[]>([]);

  useEffect(() => {
    api.getCalendar(98).then(setActivity).catch(() => {});
  }, []);

  // Build a full 14-week grid (Mon-start columns) ending today
  const { weeks, totalLikes, totalPosts, activeDays } = useMemo(() => {
    const map = new Map(activity.map((a) => [a.date, a]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the Monday 13 weeks ago
    const start = new Date(today);
    const dayOfWeek = (start.getDay() + 6) % 7; // Mon=0
    start.setDate(start.getDate() - dayOfWeek - 7 * 13);

    const cols: Array<Array<{ date: string; data?: DayActivity }>> = [];
    const cursor = new Date(start);
    let likes = 0;
    let posts = 0;
    let days = 0;

    while (cursor <= today) {
      const week: Array<{ date: string; data?: DayActivity }> = [];
      for (let i = 0; i < 7; i++) {
        if (cursor > today) break;
        const key = cursor.toISOString().slice(0, 10);
        const data = map.get(key);
        week.push({ date: key, data });
        if (data) {
          likes += data.likesCount;
          posts += data.postsCount;
          if (data.likesCount > 0 || data.postsCount > 0) days++;
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      cols.push(week);
    }

    return { weeks: cols, totalLikes: likes, totalPosts: posts, activeDays: days };
  }, [activity]);

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 mb-8 border border-white/60 dark:border-white/10 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-bold text-base text-[#0b1c30] dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0058be] text-[20px]">calendar_month</span>
          <span>灵感日历</span>
        </h3>
        <span className="text-[11px] text-[#424754] dark:text-gray-400">
          近 14 周 · {activeDays} 天有收获
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {/* Weekday labels */}
        <div className="flex flex-col justify-between py-0.5 shrink-0">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i} className="text-[9px] text-[#424754] dark:text-gray-400 h-[13px] leading-[13px]">
              {label}
            </span>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map(({ date, data }) => {
              const likes = data?.likesCount || 0;
              const posts = data?.postsCount || 0;
              const level = levelOf(likes);
              return (
                <div
                  key={date}
                  title={`${date} · ${posts} 篇灵感 · 收获 ${likes} 个赞`}
                  className={`w-[13px] h-[13px] rounded-[3px] transition-transform hover:scale-125 cursor-default ${LEVEL_CLASSES[level]}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer: legend + totals */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-[10px] text-[#424754] dark:text-gray-400">
          <span>少</span>
          {LEVEL_CLASSES.map((cls, i) => (
            <span key={i} className={`w-[11px] h-[11px] rounded-[3px] ${cls}`} />
          ))}
          <span>多</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[#424754] dark:text-gray-300">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#a43073]" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
            收获 {totalLikes} 个赞
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-[#0058be]">stylus_note</span>
            创作 {totalPosts} 篇
          </span>
        </div>
      </div>
    </div>
  );
};
