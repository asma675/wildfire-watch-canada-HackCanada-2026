import React, { useState, useRef, useEffect } from "react";
import { CalendarDays, Play, Pause } from "lucide-react";
import { addDays, format } from "date-fns";

export default function TimeSlider({ dayOffset, onChange, minDay = 1, maxDay = 14 }) {
  const [playing, setPlaying] = React.useState(false);
  const intervalRef = React.useRef(null);

  const dateLabel = format(addDays(new Date(), dayOffset), "MMM d, yyyy");

  const startPlay = () => {
    setPlaying(true);
    intervalRef.current = setInterval(() => {
      onChange(prev => {
        if (prev >= maxDay) {
          clearInterval(intervalRef.current);
          setPlaying(false);
          return maxDay;
        }
        return prev + 1;
      });
    }, 700);
  };

  const stopPlay = () => {
    clearInterval(intervalRef.current);
    setPlaying(false);
  };

  React.useEffect(() => () => clearInterval(intervalRef.current), []);

  // Progress pct for gradient
  const pct = ((dayOffset - minDay) / (maxDay - minDay)) * 100;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[min(420px,calc(100vw-100px))]
                    bg-[#1a1a2e]/95 backdrop-blur-xl rounded-2xl border border-pink-500/25 p-3 shadow-2xl">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-pink-300">Prediction Timeline</span>
        <span className="ml-auto text-xs font-bold text-white bg-pink-500/20 border border-pink-500/30 rounded-md px-2 py-0.5">
          {dateLabel}
        </span>
        <button
          onClick={playing ? stopPlay : startPlay}
          className="p-1.5 rounded-lg bg-pink-500/15 border border-pink-500/25 hover:bg-pink-500/25 text-pink-400 transition-colors"
        >
          {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
      </div>

      <div className="relative flex items-center gap-1">
        <span className="text-[9px] text-slate-500 w-10 flex-shrink-0">Day {minDay}</span>
        <div className="relative flex-1 h-5 flex items-center">
          {/* Track */}
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/5" />
          {/* Filled */}
          <div
            className="absolute left-0 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={minDay}
            max={maxDay}
            value={dayOffset}
            onChange={e => onChange(Number(e.target.value))}
            className="relative w-full appearance-none bg-transparent cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-white
                       [&::-webkit-slider-thumb]:border-2
                       [&::-webkit-slider-thumb]:border-pink-400
                       [&::-webkit-slider-thumb]:shadow-lg"
          />
        </div>
        <span className="text-[9px] text-slate-500 w-10 text-right flex-shrink-0">Day {maxDay}</span>
      </div>

      {/* Day ticks */}
      <div className="flex justify-between px-10 mt-0.5">
        {[1, 4, 7, 10, 14].map(d => (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`text-[9px] transition-colors ${dayOffset === d ? "text-pink-400 font-bold" : "text-slate-600 hover:text-slate-400"}`}
          >
            {d}
          </button>
        ))}
      </div>

      <p className="text-[9px] text-slate-600 text-center mt-1">
        Risk markers scale with proximity to predicted ignition window
      </p>
    </div>
  );
}