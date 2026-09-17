import React, { useState } from 'react';
import {
  Button,
  Tag,
  Tooltip,
  Modal,
  Space,
  Progress,
  Input,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  Home,
  Plus,
  Edit2,
  Trash2,
  Tag as TagIcon,
  Wallet,
} from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable, useTableFilters, useDiscountCodes } from '@/hooks';
import { discountCodeService } from '@/services';
import { formatDate } from '@/utils';
import {
  DiscountCode,
  PaymentDiscountType,
  PaymentDiscountValueIdType,
  CreateDiscountCodePayload,
  UpdateDiscountCodePayload,
  getDiscountTypeName,
  getDiscountTypeColor,
  getValueIdTypeName,
} from '@/types/discountCode.types';
import { DiscountCodeModal } from './DiscountCodeModal';

export const DiscountCodesPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);

  const { filters, handleTableChange } = useTableFilters();

  const { createDiscountCode, updateDiscountCode, deleteDiscountCode, isCreating, isUpdating, isDeleting } =
    useDiscountCodes();

  const {
    data: discountCodes,
    totalCount,
    isLoading,
    pagination,
  } = useTable<DiscountCode>({
    queryKey: ['discountCodes'],
    fetchFn: (params) => discountCodeService.getAll(params),
    initialPageSize: 10,
    initialPageIndex: 1,
    filters,
  });

  const handleOpenCreate = () => {
    setSelectedCode(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (record: DiscountCode) => {
    setSelectedCode(record);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCode(null);
  };

  const handleDelete = (record: DiscountCode) => {
    Modal.confirm({
      title: 'حذف کد تخفیف',
      content: (
        <div>
          <p>آیا از حذف این کد تخفیف اطمینان دارید؟</p>
          <div className="mt-2 p-3 bg-gray-50 rounded font-mono text-sm" style={{ direction: 'ltr' }}>
            {record.code}
          </div>
        </div>
      ),
      okText: 'بله، حذف شود',
      okType: 'danger',
      cancelText: 'انصراف',
      onOk: async () => {
        await deleteDiscountCode(record.id);
      },
    });
  };

  const columns: ColumnsType<DiscountCode> = [
    {
      title: 'کد تخفیف',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="جستجو بر اساس کد..."
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
              جستجو
            </Button>
            <Button
              onClick={() => {
                clearFilters?.();
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              پاک کردن
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#4B26AD' : undefined }} />
      ),
      filteredValue: filters.Code ? [filters.Code as string] : null,
      render: (code: string) => (
        <span
          className="font-mono text-sm bg-gray-100 px-3 py-1 rounded"
          style={{ direction: 'ltr', display: 'inline-block' }}
        >
          {code}
        </span>
      ),
    },
    {
      title: 'نوع / مقدار',
      key: 'typeValue',
      width: 160,
      render: (_: unknown, record: DiscountCode) => (
        <div className="flex flex-col gap-1">
          <Tag color={getDiscountTypeColor(record.type)}>
            {getDiscountTypeName(record.type)}
          </Tag>
          <span className="font-semibold text-sm">
            {record.type === PaymentDiscountType.Percentage
              ? `${record.value}٪`
              : `${record.value.toLocaleString('fa-IR')} تومان`}
          </span>
        </div>
      ),
    },
    {
      title: 'استفاده شده',
      key: 'usage',
      width: 140,
      render: (_: unknown, record: DiscountCode) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">
            {record.usageCount} / {record.maxUsageCount}
          </span>
          <Progress
            percent={Math.round((record.usageCount / Math.max(record.maxUsageCount, 1)) * 100)}
            size="small"
            status={record.usageCount >= record.maxUsageCount ? 'exception' : 'active'}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      align: 'center',
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      filters: [
        { text: 'فعال', value: true },
        { text: 'غیرفعال', value: false },
      ],
      filterMultiple: false,
      filteredValue:
        filters.IsActive != null ? [filters.IsActive as boolean] : null,
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="green">فعال</Tag>
        ) : (
          <Tag color="default">غیرفعال</Tag>
        ),
    },
    {
      title: 'بازه اعتبار',
      key: 'validity',
      width: 200,
      render: (_: unknown, record: DiscountCode) => {
        if (!record.validStartTime && !record.validEndTime) {
          return <span className="text-gray-400 text-xs">بدون محدودیت</span>;
        }
        return (
          <div className="flex flex-col gap-0.5 text-xs text-gray-600">
            {record.validStartTime && (
              <span>از: {formatDate(record.validStartTime)}</span>
            )}
            {record.validEndTime && (
              <span>تا: {formatDate(record.validEndTime)}</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'محدوده اعمال',
      key: 'scope',
      width: 280,
      render: (_: unknown, record: DiscountCode) => (
        <div className="flex flex-col gap-2 py-1">
          <Tag color="purple" style={{ width: 'fit-content' }}>
            {getValueIdTypeName(record.valueIdType)}
          </Tag>
          {record.values.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {record.values.slice(0, 2).map((v) => {
                const label = v.name ?? '(حذف شده)';
                return (
                  <Tooltip key={v.id} title={label}>
                    <Tag
                      className="m-0 text-xs leading-relaxed"
                      style={{ whiteSpace: 'normal', maxWidth: '100%', height: 'auto' }}
                    >
                      {label}
                    </Tag>
                  </Tooltip>
                );
              })}
              {record.values.length > 2 && (
                <Tooltip
                  title={record.values
                    .slice(2)
                    .map((v) => v.name ?? '(حذف شده)')
                    .join('، ')}
                >
                  <Tag className="w-fit cursor-pointer text-xs">+{record.values.length - 2} مورد دیگر</Tag>
                </Tooltip>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">همه</span>
          )}
        </div>
      ),
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 130,
      render: (date: string | null) =>
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
      render: (_: unknown, record: DiscountCode) => (
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
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="کدهای تخفیف"
        description="مدیریت کدهای تخفیف برای پرداخت"
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
                <Wallet size={16} />
                مالی
              </span>
            ),
          },
          {
            title: 'کدهای تخفیف',
          },
        ]}
        actions={
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={handleOpenCreate}
            size="large"
          >
            کد تخفیف جدید
          </Button>
        }
      />

      <DataTable<DiscountCode>
        columns={columns}
        dataSource={discountCodes}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ کد تخفیفی یافت نشد"
        itemName="کد"
        tableProps={{
          onChange: handleTableChange({
            code: 'Code',
            isActive: 'IsActive',
          }),
          scroll: { x: 1300 },
        }}
      />

      <DiscountCodeModal
        open={modalOpen}
        discountCode={selectedCode}
        onClose={handleCloseModal}
        onCreate={createDiscountCode}
        onUpdate={updateDiscountCode}
        loading={isCreating || isUpdating}
      />
    </div>
  );
};
