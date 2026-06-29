import React, { useState } from 'react';
import { Tag, Avatar, Input } from 'antd';
import { Home } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable } from '@/hooks';
import { subscriptionService } from '@/services';
import { formatDate, formatPriceWithCurrency } from '@/utils';
import { PurchasedSubscription } from '@/types/subscription.types';

export const PurchasedSubscriptionsPage: React.FC = () => {
  const { id: subscriptionId } = useParams<{ id: string }>();
  const [nameFilter, setNameFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');

  const {
    data: purchased,
    totalCount,
    isLoading,
    pagination,
  } = useTable<PurchasedSubscription>({
    queryKey: ['purchased-subscriptions', subscriptionId ?? '', nameFilter, phoneFilter],
    fetchFn: (params) =>
      subscriptionService.getAllPurchased({
        ...params,
        SubscriptionId: subscriptionId,
        UserFullName: nameFilter || undefined,
        UserPhoneNumber: phoneFilter || undefined,
      }),
    initialPageSize: 10,
    initialPageIndex: 1,
  });

  const columns: ColumnsType<PurchasedSubscription> = [
    {
      title: 'کاربر',
      key: 'user',
      render: (_: unknown, record: PurchasedSubscription) => (
        <div className="flex items-center gap-2">
          {record.userInfo?.imageUrl ? (
            <Avatar size={32} src={record.userInfo.imageUrl} />
          ) : (
            <Avatar size={32} style={{ backgroundColor: '#4B26AD' }}>
              {record.userInfo?.fullNameFa?.charAt(0) ?? '?'}
            </Avatar>
          )}
          <span className="font-medium">{record.userInfo?.fullNameFa || 'بدون نام'}</span>
        </div>
      ),
    },
    {
      title: 'اشتراک',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-semibold">{name}</span>,
    },
    {
      title: 'دوره‌ها',
      key: 'courses',
      render: (_: unknown, record: PurchasedSubscription) => (
        <div className="flex flex-wrap gap-1">
          {(record.courses ?? []).map((c) => (
            <Tag key={c.id} className="text-xs">{c.name}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'مبلغ پرداختی',
      key: 'price',
      align: 'right',
      render: (_: unknown, record: PurchasedSubscription) =>
        formatPriceWithCurrency(record.invoice.price),
    },
    {
      title: 'وضعیت پرداخت',
      key: 'isSettled',
      align: 'center',
      render: (_: unknown, record: PurchasedSubscription) => (
        <Tag color={record.invoice.isSettled ? 'green' : 'red'}>
          {record.invoice.isSettled ? 'تسویه شده' : 'تسویه نشده'}
        </Tag>
      ),
    },
    {
      title: 'دسترسی',
      key: 'hasAccess',
      align: 'center',
      render: (_: unknown, record: PurchasedSubscription) => (
        <Tag color={record.invoice.hasAccess ? 'blue' : 'default'}>
          {record.invoice.hasAccess ? 'دارد' : 'ندارد'}
        </Tag>
      ),
    },
    {
      title: 'بازه دسترسی',
      key: 'accessWindow',
      render: (_: unknown, record: PurchasedSubscription) => {
        const { accessStartTime, accessEndTime } = record.invoice;
        if (!accessStartTime) return <span className="text-gray-400 text-xs">—</span>;
        return (
          <div className="flex flex-col gap-0.5 text-xs text-gray-600">
            <span>از: {formatDate(accessStartTime)}</span>
            {accessEndTime && <span>تا: {formatDate(accessEndTime)}</span>}
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="خریداران اشتراک"
        description="لیست کاربرانی که این اشتراک را خریداری کرده‌اند"
        breadcrumbItems={[
          {
            title: (
              <span className="flex items-center gap-2">
                <Home size={16} />
                خانه
              </span>
            ),
          },
          { title: 'اشتراک‌های ویژه', href: '/subscriptions' },
          { title: 'خریداران' },
        ]}
      />

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Input
          placeholder="جستجو بر اساس نام کاربر..."
          allowClear
          style={{ width: 220 }}
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <Input
          placeholder="جستجو بر اساس شماره موبایل..."
          allowClear
          style={{ width: 200 }}
          value={phoneFilter}
          onChange={(e) => setPhoneFilter(e.target.value)}
        />
      </div>

      <DataTable<PurchasedSubscription>
        columns={columns}
        dataSource={purchased}
        rowKey={(r) => r.invoice.id}
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ خریداری یافت نشد"
        itemName="خریدار"
        scroll={{ x: 1000 }}
      />
    </div>
  );
};
