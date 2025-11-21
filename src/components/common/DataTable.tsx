import React from 'react';
import { Table, Button, Space } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

interface PaginationState {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  setPageIndex: (page: number) => void;
  setPageSize: (size: number) => void;
  prevPage: () => void;
  nextPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

interface DataTableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  rowKey: string | ((record: T) => string);
  loading?: boolean;
  totalCount: number;
  pagination: PaginationState;
  scroll?: { x?: number | string; y?: number | string };
  emptyText?: string;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  pageSizeOptions?: string[];
  showExtraControls?: boolean;
  itemName?: string;
  tableProps?: Omit<TableProps<T>, 'columns' | 'dataSource' | 'rowKey' | 'loading' | 'pagination' | 'scroll' | 'locale'>;
}

export function DataTable<T extends object>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  totalCount,
  pagination,
  scroll,
  emptyText = 'هیچ موردی یافت نشد',
  showTotal,
  pageSizeOptions = ['5', '10', '20', '50', '100'],
  showExtraControls = false,
  itemName = 'مورد',
  tableProps,
}: DataTableProps<T>) {
  const defaultShowTotal = (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} از ${total} ${itemName}`;

  // Default scroll for mobile responsiveness
  const defaultScroll = { x: 'max-content' as const };
  const tableScroll = scroll ?? defaultScroll;

  return (
    <div className="min-h-[400px] overflow-x-auto">
      <Table<T>
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={loading}
        scroll={tableScroll}
        pagination={{
          current: pagination.pageIndex,
          pageSize: pagination.pageSize,
          total: totalCount,
          showSizeChanger: true,
          showTotal: showTotal || defaultShowTotal,
          pageSizeOptions,
          onChange: (page, pageSize) => {
            if (pageSize !== pagination.pageSize) {
              pagination.setPageSize(pageSize);
            } else {
              pagination.setPageIndex(page);
            }
          },
          position: ['bottomCenter'],
          locale: {
            items_per_page: '',
          },
        }}
        locale={{
          emptyText,
        }}
        {...tableProps}
      />

      {/* Additional Pagination Controls */}
      {showExtraControls && (
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <Space>
            <Button
              onClick={pagination.prevPage}
              disabled={!pagination.hasPrevPage || loading}
            >
              صفحه قبل
            </Button>
            <Button
              onClick={pagination.nextPage}
              disabled={!pagination.hasNextPage || loading}
            >
              صفحه بعد
            </Button>
          </Space>

          <div className="text-sm text-gray-600">
            صفحه {pagination.pageIndex} از {pagination.totalPages} (
            {totalCount.toLocaleString('fa-IR')} {itemName})
          </div>

          <Space>
            <Button
              onClick={pagination.goToFirstPage}
              disabled={pagination.pageIndex === 1 || loading}
            >
              اولین صفحه
            </Button>
            <Button
              onClick={pagination.goToLastPage}
              disabled={pagination.pageIndex === pagination.totalPages || loading}
            >
              آخرین صفحه
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
}
