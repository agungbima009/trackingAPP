import React from 'react';
import './Chart.css';

function Chart() {
  // Mock data for the chart visualization
  const dataPoints = [
    28, 32, 35, 38, 42, 45, 48, 52, 48, 55, 60, 58, 65, 62, 70, 75, 72, 80, 78, 85,
    82, 88, 92, 90, 95, 98, 92, 100, 95, 105, 102, 108, 112, 110, 115, 118, 120, 125,
    122, 130, 128, 135, 132, 138, 142, 140, 145, 148, 150, 145, 140, 135, 130, 125
  ];

  const maxValue = Math.max(...dataPoints);
  const chartHeight = 200;

  return (
    <div className="chart-container">
      <svg className="chart-svg" viewBox={`0 0 ${dataPoints.length * 15} ${chartHeight}`}>
        {/* Background grid lines */}
        <g className="grid-lines">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={chartHeight * ratio}
              x2={dataPoints.length * 15}
              y2={chartHeight * ratio}
              stroke="#e5e5ea"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Area chart fill */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0066cc" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0066cc" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Create area path */}
        <path
          d={`
            M 0 ${chartHeight}
            ${dataPoints
              .map(
                (value, index) =>
                  `L ${index * 15} ${chartHeight - (value / maxValue) * chartHeight * 0.8}`
              )
              .join(' ')}
            L ${(dataPoints.length - 1) * 15} ${chartHeight}
            Z
          `}
          fill="url(#chartGradient)"
        />

        {/* Line path */}
        <path
          d={`
            M 0 ${chartHeight - (dataPoints[0] / maxValue) * chartHeight * 0.8}
            ${dataPoints
              .slice(1)
              .map(
                (value, index) =>
                  `L ${(index + 1) * 15} ${chartHeight - (value / maxValue) * chartHeight * 0.8}`
              )
              .join(' ')}
          `}
          fill="none"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {dataPoints.map((value, index) => {
          if (index % 5 === 0) {
            return (
              <circle
                key={index}
                cx={index * 15}
                cy={chartHeight - (value / maxValue) * chartHeight * 0.8}
                r="3"
                fill="#000000"
                className="chart-dot"
              />
            );
          }
          return null;
        })}
      </svg>

      {/* X-axis labels */}
      <div className="chart-labels">
        <span>Apr 7</span>
        <span>Apr 19</span>
        <span>Apr 26</span>
        <span>May 2</span>
        <span>May 8</span>
        <span>May 14</span>
        <span>May 21</span>
        <span>May 28</span>
        <span>Jun 3</span>
        <span>Jun 9</span>
        <span>Jun 15</span>
        <span>Jun 22</span>
        <span>Jun 30</span>
      </div>
    </div>
  );
}

export default Chart;
