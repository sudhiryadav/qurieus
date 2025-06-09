import React, { useEffect, useState } from "react";

/**
 * CountdownTimer - A generic countdown timer component.
 * @param seconds Number of seconds to count down from
 * @param onComplete Callback when timer reaches zero
 * @param className Optional className for styling
 * Usage: <CountdownTimer seconds={60} onComplete={fn} />
 */
export function CountdownTimer({ seconds, onComplete, className = "" }: { seconds: number; onComplete: () => void; className?: string }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
    if (seconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  return (
    <span className={className}>
      {timeLeft > 0 ? `Resend code in ${timeLeft}s` : null}
    </span>
  );
} 