import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const PomodoroTimer = () => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default to 25 minutes

  useEffect(() => {
    let timer;
    if (isTimerRunning) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsBreakTime((prevBreak) => !prevBreak); // Toggle between focus and break
            return isBreakTime ? 25 * 60 : 5 * 60; // Reset time for the next session
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, isBreakTime]);

  const handleStartPauseTimer = () => setIsTimerRunning(!isTimerRunning);
  
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(isBreakTime ? 5 * 60 : 25 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="my-6 bg-white/10 p-4 rounded-lg flex flex-col items-center justify-center text-white">
      <h2 className="text-xl font-semibold mb-4">
        {isBreakTime ? 'Break Time' : 'Focus Time'}
      </h2>
      <div className="text-4xl font-bold mb-4">{formatTime(timeLeft)}</div>
      <div className="flex gap-4">
        <button
          onClick={handleStartPauseTimer}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center gap-2"
        >
          {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
          {isTimerRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={handleResetTimer}
          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <RotateCcw size={20} />
          Reset
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;