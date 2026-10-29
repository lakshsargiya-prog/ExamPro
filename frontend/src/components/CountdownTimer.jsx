import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ deadline, onExpire }) {
  const calculateRemaining = () => {
    if (!deadline) return 0;
    const target = new Date(deadline).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((target - now) / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState(calculateRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onExpire]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n) => String(n).padStart(2, '0');
  const isUrgent = secondsLeft > 0 && secondsLeft <= 300; // <= 5 minutes
  const isExpired = secondsLeft === 0;

  let colorClasses = 'bg-brand-50 border-brand-200 text-brand-700';
  if (isUrgent) {
    colorClasses = 'bg-amber-50 border-amber-300 text-amber-700 animate-pulse';
  } else if (isExpired) {
    colorClasses = 'bg-rose-50 border-rose-300 text-rose-700';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${colorClasses}`}>
      <Clock className="w-4 h-4 shrink-0" />
      <span>
        {isExpired ? (
          'Time Expired'
        ) : (
          `${hours > 0 ? `${pad(hours)}:` : ''}${pad(minutes)}:${pad(seconds)}`
        )}
      </span>
    </div>
  );
}

