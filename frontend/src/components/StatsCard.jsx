import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="stats-card" style={{ borderBottomColor: `var(--${color})` }}>
      <div className="stats-card-info">
        <span className="stats-value">{value}</span>
        <span className="stats-title">{title}</span>
      </div>
      <div className="stats-icon-wrapper" style={{ backgroundColor: `var(--${color})` }}>
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;