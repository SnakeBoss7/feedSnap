import React, { useEffect, useState, useRef } from 'react';

const ProjectProgress = ({ resolved, total }) => {
  const percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const pending = total - resolved;

  const [animVal, setAnimVal] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const dur = 900;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      setAnimVal(Math.round((1 - Math.pow(1 - p, 3)) * percentage));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [percentage, visible]);

  // Circle math
  const size = 160;
  const strokeW = 14;
  const r = (size - strokeW) / 2;
  const circumference = 2 * Math.PI * r;

  // Gap between the two segments (in px of arc length)
  const gap = 24;

  // Usable arc = total circumference minus two gaps
  const usable = circumference - gap * 2;

  // Resolved & pending arc lengths
  const resolvedLen = (animVal / 100) * usable;
  const pendingLen = ((100 - animVal) / 100) * usable;

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-6 w-full py-2 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7E2AC9" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          {/* Pending (gray) arc */}
          {animVal < 100 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={strokeW}
              strokeLinecap="round"
              className="stroke-gray-100 dark:stroke-white/[0.08]"
              strokeDasharray={`${pendingLen} ${circumference - pendingLen}`}
              strokeDashoffset={-(resolvedLen + gap)}
            />
          )}

          {/* Resolved (purple gradient) arc */}
          {animVal > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={strokeW}
              strokeLinecap="round"
              stroke="url(#ringGrad)"
              strokeDasharray={`${resolvedLen} ${circumference - resolvedLen}`}
              strokeDashoffset={0}
              style={{ transition: 'stroke-dasharray 0.15s ease' }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[38px] font-extrabold leading-none tracking-tight text-gray-900 dark:text-white tabular-nums">
            {animVal}
            <span className="text-base font-semibold text-gray-400 dark:text-gray-500">%</span>
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="w-full space-y-3 px-1">
        {/* Resolved */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#7E2AC9] to-[#c084fc] shrink-0" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</span>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{resolved}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />

        {/* Pending */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-600 shrink-0" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</span>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{pending}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectProgress;
