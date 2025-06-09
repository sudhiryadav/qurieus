import React, { useRef } from "react";

/**
 * OTPInput - A generic OTP/verification code input component.
 * @param length Number of input boxes
 * @param value Current value (string)
 * @param onChange Called with new value on change
 * @param onComplete Called when all boxes are filled (optional)
 * Usage: <OTPInput length={4} value={code} onChange={setCode} onComplete={autoSubmitFn} />
 */
export function OTPInput({ length, value, onChange, onComplete }: { length: number; value: string; onChange: (val: string) => void; onComplete?: (val: string) => void }) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 1) {
      // If user pastes or types multiple digits, fill in the boxes
      const chars = val.split("").slice(0, length);
      chars.forEach((char, i) => {
        if (inputsRef.current[idx + i]) {
          inputsRef.current[idx + i]!.value = char;
        }
      });
      const newValue = value.substring(0, idx) + val.substring(0, length - idx);
      onChange((value.substring(0, idx) + val).slice(0, length));
      if (val.length === length && onComplete) onComplete(val.slice(0, length));
      return;
    }
    let newValue = value.split("");
    newValue[idx] = val;
    const joined = newValue.join("").slice(0, length);
    onChange(joined);
    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
    if (joined.length === length && onComplete) onComplete(joined);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (paste.length === length) {
      onChange(paste);
      if (onComplete) onComplete(paste);
    }
  };

  return (
    <div className="flex gap-2 justify-center mb-6">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={el => {
            inputsRef.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="w-12 h-12 text-center text-2xl border border-stroke rounded-md focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          value={value[idx] || ""}
          onChange={e => handleChange(e, idx)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
} 