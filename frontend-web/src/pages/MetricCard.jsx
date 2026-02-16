import React from 'react';
import './MetricCard.css';

function MetricCard({ title, value, change, subtitle, trend }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        <span className={`metric-change ${trend}`}>
          {trend === 'up' ? '↗' : '↘'} {change}
        </span>
      </div>
      <div className="metric-value">{value}</div>
      <p className="metric-subtitle">{subtitle}</p>
      {trend === 'up' && (
        <div className="metric-icon positive">
          <span>📈</span>
        </div>
      )}
      {trend === 'down' && (
        <div className="metric-icon negative">
          <span>📉</span>
        </div>
      )}
    </div>
  );
}

export default MetricCard;
