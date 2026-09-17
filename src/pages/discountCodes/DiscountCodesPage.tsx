import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Tag,
  Tooltip,
  Modal,
  Space,
  Progress,
  Input,
  Select,
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
import { categoryService, courseService, discountCodeService } from '@/services';
import { Course } from '@/types/course.types';
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
  const [deleteTarget, setDeleteTarget] = useState<DiscountCode | null>(null);

  const { filters, handleTableChange } = useTableFilters();

  const { createDiscountCode, updateDiscountCode, deleteDiscountCode, isCreating, isUpdating, isDeleting } =
    useDiscountCodes();

  const { data: courses = [], isLoading: isLoadingCourses } = useTable<Course>({
    queryKey: 'discount-code-course-filter',
    fetchFn: courseService.getAll,
    initialPageSize: 1000,
    initialPageIndex: 1,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['discount-code-category-filter'],
    queryFn: () => categoryService.getAll(),
  });

  const valueFilterOptions = [
    ...courses.map((course) => ({
      value: course.id,
      label: `دوره: ${course.name}`,
    })),
    ...categories.map((category) => ({
      value: category.id,
      label: `دسته: ${category.name}`,
    })),
  ];

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
    setDeleteTarget(record);
  };

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteDiscountCode(deleteTarget.id);
    setDeleteTarget(null);
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
      title: 'نوع محدوده',
      dataIndex: 'valueIdType',
      key: 'valueIdType',
      width: 120,
      align: 'center',
      filters: [
        { text: 'دوره', value: PaymentDiscountValueIdType.Course },
        { text: 'دسته‌بندی', value: PaymentDiscountValueIdType.Category },
      ],
      filterMultiple: false,
      filteredValue:
        filters.ValueIdType != null ? [filters.ValueIdType as number] : null,
      render: (valueIdType: PaymentDiscountValueIdType) => (
        <Tag color="purple">{getValueIdTypeName(valueIdType)}</Tag>
      ),
    },
    {
      title: 'دوره / دسته',
      key: 'valueNames',
      width: 260,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8, width: 260 }}>
          <Select
            showSearch
            allowClear
            placeholder="انتخاب دوره یا دسته"
            style={{ width: '100%', marginBottom: 8 }}
            value={selectedKeys[0]}
            loading={isLoadingCourses || isLoadingCategories}
            onChange={(value) => setSelectedKeys(value ? [value] : [])}
            filterOption={(input, option) =>
              (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={valueFilterOptions}
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
      filteredValue: filters.ValueId ? [filters.ValueId as string] : null,
      render: (_: unknown, record: DiscountCode) =>
        record.values.length > 0 ? (
          <div className="flex flex-col gap-1.5 py-1">
            {record.values.slice(0, 2).map((v) => {
              const label = v.name ?? '(حذف شده)';
              return (
                <Tooltip key={v.id} title={label}>
                  <span className="text-sm leading-relaxed text-gray-700">{label}</span>
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
                <span className="cursor-pointer text-xs text-primary">
                  +{record.values.length - 2} مورد دیگر
                </span>
              </Tooltip>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">همه</span>
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
            valueIdType: 'ValueIdType',
            valueNames: 'ValueId',
          }),
          scroll: { x: 1450 },
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

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Trash2 size={20} className="text-red-500" />
            <span className="text-xl font-bold">حذف کد تخفیف</span>
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
          <p className="mb-4 text-gray-600">
            آیا از حذف این کد تخفیف اطمینان دارید؟
          </p>
          {deleteTarget && (
            <div className="rounded-lg bg-gray-50 p-4">
              <span className="text-sm font-semibold text-gray-700">کد تخفیف:</span>
              <p
                className="mt-1 font-mono text-base font-semibold text-gray-900"
                style={{ direction: 'ltr' }}
              >
                {deleteTarget.code}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
