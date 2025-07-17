import React, { useEffect, useState } from 'react';
import './DigitalClock.css';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return <div className="live-clock">⏰ {time.toLocaleTimeString()}</div>;
};

export default React.memo(LiveClock);
