import React from 'react';

interface TableCellCenterProps {
  children: React.ReactNode;
  minHeight?: number;
}

/** Centers content in Ant Design table cells (RTL + fixed columns). */
export const TableCellCenter: React.FC<TableCellCenterProps> = ({
  children,
  minHeight = 48,
}) => (
  <div
    className="flex w-full items-center justify-center"
    style={{ minHeight }}
  >
    {children}
  </div>
);
