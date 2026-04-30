"use client";

import { useEffect, useState } from "react";

type EventCountdownProps = {
  startAtIso: string;
};

function getTimeLeft(startAtIso: string, now: number) {
  if (!startAtIso) {
    return null;
  }

  const diff = new Date(startAtIso).getTime() - now;
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      started: true
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    started: false
  };
}

export function EventCountdown({ startAtIso }: EventCountdownProps) {
  const [now, setNow] = useState(Date.now());
  const timeLeft = getTimeLeft(startAtIso, now);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (!timeLeft) {
    return (
      <div className="panel rounded-sm border-moss/30 p-5 shadow-glow">
        <p className="text-sm font-black uppercase tracking-wide text-moss">Таймер старту</p>
        <p className="mt-2 text-2xl font-black text-white">Дата буде оголошена</p>
      </div>
    );
  }

  if (timeLeft.started) {
    return (
      <div className="panel rounded-sm border-moss/30 p-5 shadow-glow">
        <p className="text-sm font-black uppercase tracking-wide text-moss">Таймер старту</p>
        <p className="mt-2 text-2xl font-black text-acid">Івент уже стартував</p>
      </div>
    );
  }

  return (
    <div className="panel rounded-sm border-moss/30 p-5 shadow-glow">
      <p className="text-sm font-black uppercase tracking-wide text-moss">До старту</p>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {[
          ["Дні", timeLeft.days],
          ["Год", timeLeft.hours],
          ["Хв", timeLeft.minutes],
          ["Сек", timeLeft.seconds]
        ].map(([label, value]) => (
          <div key={label} className="block-surface rounded-sm border border-white/10 p-3 text-center">
            <p className="text-2xl font-black text-acid">{String(value).padStart(2, "0")}</p>
            <p className="mt-1 text-xs font-black uppercase text-fog/45">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
