import React from 'react';
import './DataTable.css';

function DataTable({ data }) {
  return (
    <div className="data-table-container">
      <div className="table-actions">
        <button className="action-button">
          <span>⚙️</span> Customize Columns
        </button>
        <button className="action-button primary">
          <span>+</span> Add Section
        </button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th className="checkbox-col">
              <input type="checkbox" />
            </th>
            <th>#</th>
            <th>Header</th>
            <th>Section Type</th>
            <th>Status</th>
            <th>Target</th>
            <th>Limit</th>
            <th>Reviewer</th>
            <th className="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id}>
              <td className="checkbox-col">
                <input type="checkbox" />
              </td>
              <td className="row-number">{index + 1}</td>
              <td className="header-cell">{row.header}</td>
              <td className="section-type">{row.sectionType}</td>
              <td>
                <span className={`status-badge ${row.status === 'Done' ? 'done' : 'in-progress'}`}>
                  {row.status === 'Done' ? '✓' : '○'} {row.status}
                </span>
              </td>
              <td className="number-cell">{row.target}</td>
              <td className="number-cell">{row.limit}</td>
              <td className="reviewer-cell">{row.reviewer}</td>
              <td className="actions-col">
                <button className="row-action">⋮</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
