import React, { useState } from 'react';
import { Button, Tag, Tooltip, Modal, Space, Input, Select } from 'antd';
import { Home, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable, useSubscriptions } from '@/hooks';
import { subscriptionService } from '@/services';
import { formatDate, formatPriceWithCurrency } from '@/utils';
import { SubscriptionListItem } from '@/types/subscription.types';
import { SubscriptionModal } from './SubscriptionModal';
import { ROUTES } from '@/constants';

export const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionListItem | null>(null);
  const [nameFilter, setNameFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  const { createSubscription, updateSubscription, deleteSubscription, isCreating, isUpdating, isDeleting } =
    useSubscriptions();

  const {
    data: subscriptions,
    totalCount,
    isLoading,
    pagination,
  } = useTable<SubscriptionListItem>({
    queryKey: ['subscriptions', nameFilter, String(activeFilter)],
    fetchFn: (params) =>
      subscriptionService.getAll({
        ...params,
        Name: nameFilter || undefined,
        IsActive: activeFilter,
      }),
    initialPageSize: 10,
    initialPageIndex: 1,
  });

  const handleOpenCreate = () => {
    setSelectedSubscription(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (record: SubscriptionListItem) => {
    setSelectedSubscription(record);
    setModalOpen(true);
  };

  const handleDelete = (record: SubscriptionListItem) => {
    Modal.confirm({
      title: 'حذف اشتراک',
      content: (
        <div>
          <p>آیا از حذف اشتراک <strong>{record.name}</strong> اطمینان دارید؟</p>
        </div>
      ),
      okText: 'بله، حذف شود',
      okType: 'danger',
      cancelText: 'انصراف',
      onOk: () => deleteSubscription(record.id),
    });
  };

  const columns: ColumnsType<SubscriptionListItem> = [
    {
      title: 'نام اشتراک',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-semibold">{name}</span>,
    },
    {
      title: 'دوره‌های شامل',
      key: 'courses',
      render: (_: unknown, record: SubscriptionListItem) => {
        const courses = record.valueInfo?.courses ?? [];
        if (courses.length === 0) return <span className="text-gray-400 text-xs">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {courses.slice(0, 2).map((c) => (
              <Tag key={c.id} className="text-xs">{c.name}</Tag>
            ))}
            {courses.length > 2 && (
              <Tooltip title={courses.slice(2).map((c) => c.name).join('، ')}>
                <Tag className="text-xs cursor-pointer">+{courses.length - 2}</Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'قیمت (تومان)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price: number) => formatPriceWithCurrency(price),
    },
    {
      title: 'مدت اعتبار',
      dataIndex: 'periodDays',
      key: 'periodDays',
      align: 'center',
      render: (days: number) => <span>{days.toLocaleString('fa-IR')} روز</span>,
    },
    {
      title: 'وضعیت',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (isActive: boolean) =>
        isActive ? <Tag color="green">فعال</Tag> : <Tag color="default">غیرفعال</Tag>,
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (date: string | null) =>
        date ? <span className="text-sm text-gray-600">{formatDate(date)}</span> : <span className="text-gray-400">—</span>,
    },
    {
      title: 'عملیات',
      key: 'actions',
      align: 'center',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: SubscriptionListItem) => (
        <Space size="small">
          <Tooltip title="خریداران">
            <Button
              type="text"
              icon={<Users size={16} />}
              onClick={() => navigate(ROUTES.SUBSCRIPTIONS.PURCHASED(record.id))}
              className="hover:text-purple-600"
            />
          </Tooltip>
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
        title="اشتراک‌های ویژه"
        description="مدیریت پلن‌های اشتراک دسترسی به دوره‌ها"
        breadcrumbItems={[
          {
            title: (
              <span className="flex items-center gap-2">
                <Home size={16} />
                خانه
              </span>
            ),
          },
          { title: 'اشتراک‌های ویژه' },
        ]}
        actions={
          <Button type="primary" icon={<Plus size={18} />} onClick={handleOpenCreate} size="large">
            اشتراک جدید
          </Button>
        }
      />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Input
          placeholder="جستجو بر اساس نام..."
          allowClear
          style={{ width: 220 }}
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <Select
          placeholder="وضعیت"
          allowClear
          style={{ width: 140 }}
          value={activeFilter}
          onChange={(v) => setActiveFilter(v)}
          options={[
            { value: true, label: 'فعال' },
            { value: false, label: 'غیرفعال' },
          ]}
        />
      </div>

      <DataTable<SubscriptionListItem>
        columns={columns}
        dataSource={subscriptions}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ اشتراکی یافت نشد"
        itemName="اشتراک"
        scroll={{ x: 900 }}
      />

      <SubscriptionModal
        open={modalOpen}
        subscription={selectedSubscription}
        onClose={() => { setModalOpen(false); setSelectedSubscription(null); }}
        onCreate={createSubscription}
        onUpdate={updateSubscription}
        loading={isCreating || isUpdating}
      />
    </div>
  );
};
