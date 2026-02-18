import React, { useState } from 'react';
import './Dashboard.css';
import MetricCard from './MetricCard';
import DataTable from '../shared/DataTable';
import Chart from './Chart';

function Dashboard() {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$1,250.00',
      change: '+12.6%',
      subtitle: 'Visitors for the last 8 months',
      trend: 'up'
    },
    {
      title: 'New Customers',
      value: '1,234',
      change: '-20%',
      subtitle: 'Down 20% this period',
      trend: 'down'
    },
    {
      title: 'Active Accounts',
      value: '45,678',
      change: '+12.5%',
      subtitle: 'Strong user retention',
      trend: 'up'
    },
    {
      title: 'Growth Rate',
      value: '4.5%',
      change: '+4.5%',
      subtitle: 'Steady performance increase',
      trend: 'up'
    }
  ];

  const tableData = [
    {
      id: 1,
      header: 'Cover page',
      sectionType: 'Cover page',
      status: 'In Progress',
      target: '18',
      limit: '5',
      reviewer: 'Eddie Lake'
    },
    {
      id: 2,
      header: 'Table of contents',
      sectionType: 'Table of contents',
      status: 'Done',
      target: '29',
      limit: '24',
      reviewer: 'Eddie Lake'
    },
    {
      id: 3,
      header: 'Executive summary',
      sectionType: 'Narrative',
      status: 'Done',
      target: '10',
      limit: '13',
      reviewer: 'Eddie Lake'
    }
  ];

  return (
    <div className="main-content">
        <header className="content-header">
          <h1>Documents</h1>
          <a href="#" className="github-link">GitHub</a>
        </header>

        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <div>
              <h2>Total Visitors</h2>
              <p className="chart-subtitle">Total for the last 3 months</p>
            </div>
            <div className="time-filters">
              <button className="time-filter">Last 3 months</button>
              <button className="time-filter">Last 30 days</button>
              <button className="time-filter active">Last 7 days</button>
            </div>
          </div>
          <Chart />
        </div>

        <div className="table-section">
          <div className="table-tabs">
            <button className="tab-button active">Outline</button>
            <button className="tab-button">
              Past Performance <span className="badge">3</span>
            </button>
            <button className="tab-button">
              Key Personnel <span className="badge">2</span>
            </button>
            <button className="tab-button">Focus Documents</button>
          </div>
          <DataTable data={tableData} />
        </div>
    </div>
  );
}

export default Dashboard;
