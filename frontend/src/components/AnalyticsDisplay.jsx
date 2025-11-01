import React, { useState, useEffect } from 'react';
import api from '../services/api';

const generateAsciiBar = (label, value, maxValue) => {
  const barLength = 20;
  const scaledValue = maxValue > 0 ? (value / maxValue) * barLength : 0;
  const bar = '█'.repeat(Math.floor(scaledValue));
  const padding = ' '.repeat(barLength - bar.length);
  return `${label.padEnd(20)} [${bar}${padding}] ${value}\n`;
};

const AnalyticsDisplay = () => {
  const [stats, setStats] = useState({ completed: 0, rejected: 0 });
  const [marketSlots, setMarketSlots] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/swap/my-stats');
        setStats(statsRes.data);
        
        const marketRes = await api.get('/swap/swappable-slots');
        setMarketSlots(marketRes.data.length);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    fetchData();
  }, []);

  const total = stats.completed + stats.rejected;
  const max = Math.max(stats.completed, stats.rejected, marketSlots, 1);

  return (
    <div className="terminal-output">
      <p>Running script: ./fetch-swap-analytics.sh</p>
      <p>Connecting to database... OK</p>
      <p>Generating system report...</p>
      <br />
      <pre>
        <strong>SWAP STATISTICS (ALL-TIME)</strong>
        <br />
        {generateAsciiBar('Swaps Completed', stats.completed, max)}
        {generateAsciiBar('Swaps Rejected', stats.rejected, max)}
        {generateAsciiBar('Total Swaps Actioned', total, max)}
        <br />
        <strong>MARKETPLACE (LIVE)</strong>
        <br />
        {generateAsciiBar('Open Marketplace Slots', marketSlots, max)}
      </pre>
      <br />
      <p>Report complete. Waiting for next command.</p>
    </div>
  );
};

export default AnalyticsDisplay;