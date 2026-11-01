import React, { useState } from 'react';
import { Button, Tag, Tooltip, Modal, Space } from 'antd';
import { Home, Plus, Edit2, Trash2, PanelTop } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { BannerTablePreview } from '@/components/banners/BannerTablePreview';
import { TableCellCenter } from '@/components/banners/TableCellCenter';
import { PageHeader, DataTable } from '@/components/common';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useTable, useTableFilters, useBanners } from '@/hooks';
import { bannerService } from '@/services';
import { formatDate } from '@/utils';
import {
  Banner,
  BannerType,
  getBannerTypeColor,
  getBannerTypeLabel,
} from '@/types/banner.types';
import { BannerModal } from './BannerModal';

export const BannersPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const { filters, handleTableChange } = useTableFilters();

  const { createBanner, updateBanner, deleteBanner, isCreating, isUpdating, isDeleting } =
    useBanners();

  const {
    data: banners,
    totalCount,
    isLoading,
    pagination,
  } = useTable<Banner>({
    queryKey: QUERY_KEYS.BANNERS.ALL,
    fetchFn: (params) => bannerService.getAll(params),
    initialPageSize: 10,
    initialPageIndex: 1,
    filters,
  });

  const handleOpenCreate = () => {
    setSelectedBanner(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (record: Banner) => {
    setSelectedBanner(record);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBanner(null);
  };

  const handleDelete = (record: Banner) => {
    setDeleteTarget(record);
  };

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteBanner(deleteTarget.id);
    setDeleteTarget(null);
  };

  const centerCell = () =>
    ({
      className: 'banner-table-center-cell align-middle !py-2',
      style: { verticalAlign: 'middle', textAlign: 'center' },
    }) as const;

  const columns: ColumnsType<Banner> = [
    {
      title: 'پیش‌نمایش',
      key: 'preview',
      width: 200,
      align: 'center',
      onHeaderCell: () => ({ className: 'banner-table-center-cell !text-center' }),
      onCell: centerCell,
      render: (_: unknown, record: Banner) => (
        <TableCellCenter minHeight={52}>
          <BannerTablePreview banner={record} />
        </TableCellCenter>
      ),
    },
    {
      title: 'نوع',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      align: 'center',
      onHeaderCell: () => ({ className: 'banner-table-center-cell !text-center' }),
      onCell: centerCell,
      filters: [
        { text: getBannerTypeLabel(BannerType.Promotional), value: BannerType.Promotional },
        { text: getBannerTypeLabel(BannerType.Announcement), value: BannerType.Announcement },
      ],
      filterMultiple: false,
      filteredValue: filters.Type != null ? [filters.Type as number] : null,
      render: (type: BannerType) => (
        <TableCellCenter>
          <Tag color={getBannerTypeColor(type)}>{getBannerTypeLabel(type)}</Tag>
        </TableCellCenter>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'isDraft',
      key: 'isDraft',
      width: 130,
      align: 'center',
      onHeaderCell: () => ({
        className: 'banner-table-center-cell !text-center',
        style: { whiteSpace: 'nowrap' },
      }),
      filters: [
        { text: 'پیش‌نویس', value: true },
        { text: 'منتشر شده', value: false },
      ],
      filterMultiple: false,
      filteredValue: filters.IsDraft != null ? [filters.IsDraft as boolean] : null,
      onCell: centerCell,
      render: (isDraft: boolean | null | undefined) => (
        <TableCellCenter>
          {isDraft === false ? (
            <Tag color="green">منتشر شده</Tag>
          ) : (
            <Tag color="default">پیش‌نویس</Tag>
          )}
        </TableCellCenter>
      ),
    },
    {
      title: 'متن',
      dataIndex: 'text',
      key: 'text',
      ellipsis: true,
      render: (text: string) => <span className="text-sm text-gray-700">{text}</span>,
    },
    {
      title: 'لینک',
      key: 'link',
      width: 160,
      ellipsis: true,
      render: (_: unknown, record: Banner) =>
        record.linkUrl ? (
          <Tooltip title={record.linkUrl}>
            <span className="text-xs text-blue-600">{record.linkText || record.linkUrl}</span>
          </Tooltip>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 130,
      render: (date: string | null | undefined) =>
        date ? (
          <span className="text-sm text-gray-600">{formatDate(date)}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 100,
      align: 'center',
      fixed: 'right',
      onCell: centerCell,
      render: (_: unknown, record: Banner) => (
        <TableCellCenter>
          <Space size="small">
            <Tooltip title="ویرایش">
              <Button
                type="text"
                icon={<Edit2 size={16} />}
                onClick={() => handleOpenEdit(record)}
                className="hover:text-blue-600"
              />
            </Tooltip>
            <Tooltip title="حذف">
              <Button
                type="text"
                danger
                icon={<Trash2 size={16} />}
                onClick={() => handleDelete(record)}
                loading={isDeleting}
              />
            </Tooltip>
          </Space>
        </TableCellCenter>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="بنرهای سایت"
        description="مدیریت بنر تبلیغاتی و اطلاع‌رسانی صفحه اصلی"
        breadcrumbItems={[
          {
            title: (
              <span className="flex items-center gap-2">
                <Home size={16} />
                خانه
              </span>
            ),
          },
          {
            title: (
              <span className="flex items-center gap-2">
                <PanelTop size={16} />
                بنرها
              </span>
            ),
          },
        ]}
        actions={
          <Button type="primary" icon={<Plus size={18} />} onClick={handleOpenCreate} size="large">
            بنر جدید
          </Button>
        }
      />

      <DataTable<Banner>
        columns={columns}
        dataSource={banners}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ بنری یافت نشد"
        itemName="بنر"
        tableProps={{
          className: 'banners-data-table',
          onChange: handleTableChange({
            type: 'Type',
            isDraft: 'IsDraft',
          }),
          scroll: { x: 1020 },
        }}
      />

      <BannerModal
        open={modalOpen}
        banner={selectedBanner}
        onClose={handleCloseModal}
        onCreate={createBanner}
        onUpdate={updateBanner}
        loading={isCreating || isUpdating}
      />

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Trash2 size={20} className="text-red-500" />
            <span className="text-xl font-bold">حذف بنر</span>
          </div>
        }
        open={!!deleteTarget}
        onCancel={handleCloseDeleteModal}
        onOk={handleConfirmDelete}
        okText="بله، حذف شود"
        cancelText="انصراف"
        okButtonProps={{ danger: true }}
        confirmLoading={isDeleting}
        width={480}
        centered
        destroyOnClose
      >
        <div className="py-4">
          <p className="mb-4 text-gray-600">آیا از حذف این بنر اطمینان دارید؟</p>
          {deleteTarget && (
            <div className="rounded-lg bg-gray-50 p-4">
              <span className="text-sm font-semibold text-gray-700">متن بنر:</span>
              <p className="mt-1 text-sm text-gray-900">{deleteTarget.text}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
