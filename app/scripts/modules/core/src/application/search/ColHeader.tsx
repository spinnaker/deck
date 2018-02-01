import * as React from 'react';

export interface IColHeaderProps {
  column: string;
  width?: string;
  label: string;
  currentSort: string;
  toggleSort: (column: string) => void;
}

export const ColHeader = ({ toggleSort, currentSort, column, width, label }: IColHeaderProps) => {
  const ascMatch = currentSort === `+${column}`;
  const descMatch = currentSort === `-${column}`;

  const sortClass = `glyphicon glyphicon-${descMatch ? 'Up' : 'Down'}-triangle`;
  const spanClass = `sort-toggle clickable ${!ascMatch && !descMatch ? 'inactive-sort-key' : ''}`;
  return (
    <th style={{ width }}>
          <span className={spanClass} onClick={() => toggleSort(column)}>
            {label} <a><span className={sortClass}/></a>
          </span>
    </th>
  );
};
