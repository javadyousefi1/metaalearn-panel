import React from 'react';
import { Tag, Avatar, Tooltip, Popconfirm } from 'antd';
import { Home, UserCircle, CheckCircle } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable, useTableFilters, usePaymentVerification } from '@/hooks';
import { paymentService } from '@/services';
import {
    PaymentListItem,
    PaymentStatus,
    getPaymentMethodName,
    getPaymentMethodColor,
    getPaymentStatusName,
    getPaymentStatusColor,
    getPaymentTypeName,
    getPaymentTypeColor,
    formatAmount, PaymentType, PaymentMethod,
} from '@/types/payment.types';
import { formatDate } from '@/utils';

/**
 * TransactionsPage Component - Display payment transactions with verification
 */
export const TransactionsPage: React.FC = () => {
  const { filters, handleTableChange } = useTableFilters();
  const { verifyPayment, isVerifying } = usePaymentVerification();

  const {
    data: payments,
    totalCount,
    isLoading,
    pagination,
  } = useTable<PaymentListItem>({
    queryKey: ['payments'],
    fetchFn: (params) =>
      paymentService.getAll({
        ...params,
        Status: filters.Status as PaymentStatus | undefined,
      }),
    initialPageSize: 10,
    initialPageIndex: 1,
    filters,
  });

  const handleVerifyPayment = async (paymentId: string) => {
    try {
      await verifyPayment({ paymentId });
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const columns: ColumnsType<PaymentListItem> = [
    {
      title: 'کاربر',
      key: 'user',
      width: 220,
      render: (_: any, payment: PaymentListItem) => (
        <div className="flex items-center gap-3">
          {payment.user.imageUrl ? (
            <Avatar size={40} src={payment.user.imageUrl} />
          ) : (
            <Avatar
              size={40}
              icon={<UserCircle />}
              style={{ backgroundColor: '#4B26AD' }}
            />
          )}
          <div>
            <div className="font-medium text-sm">{payment.user.fullNameFa}</div>
            <div className="text-xs text-gray-500">{payment.user.phoneNumber}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'مبلغ',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'left',
      render: (amount: number) => (
        <span className="font-semibold text-sm">{formatAmount(amount)}</span>
      ),
    },
    {
      title: 'روش پرداخت',
      dataIndex: 'method',
      key: 'method',
      width: 130,
      align: 'center',
      render: (method: number) => (
        <Tag color={getPaymentMethodColor(method)}>
          {getPaymentMethodName(method)}
        </Tag>
      ),
    },
    {
      title: 'نوع پرداخت',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      align: 'center',
      render: (type: number) => (
        <Tag color={getPaymentTypeColor(type)}>
          {getPaymentTypeName(type)}
        </Tag>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      filters: [
        { text: 'در انتظار', value: PaymentStatus.Pending },
        { text: 'پرداخت شده', value: PaymentStatus.Paid },
        { text: 'ناموفق', value: PaymentStatus.Failed },
        { text: 'بازگشت داده شده', value: PaymentStatus.Refunded },
        { text: 'لغو شده', value: PaymentStatus.Cancelled },
      ],
      filterMultiple: false,
      filteredValue: filters.Status ? [filters.Status as number] : null,
      render: (status: number) => (
        <Tag color={getPaymentStatusColor(status)}>
          {getPaymentStatusName(status)}
        </Tag>
      ),
    },
    {
      title: 'کد رهگیری',
      dataIndex: 'referralCode',
      key: 'referralCode',
      width: 120,
      align: 'center',
      render: (code: string) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
          {code}
        </span>
      ),
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 150,
      render: (date: string) => (
        <div className="text-sm text-gray-600">{formatDate(date)}</div>
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_: any, payment: PaymentListItem) => {
        // Only show verify button for pending payments
          console.log(payment ,"payment")
        if (payment.method !== PaymentMethod.CardToCard || payment.status === PaymentStatus.Paid) {
          return <span className="text-gray-400 text-xs">-</span>;
        }

        return (
          <div className="flex items-center justify-center gap-3">
            <Popconfirm
              title="تایید پرداخت"
              description="آیا از تایید این پرداخت اطمینان دارید؟"
              onConfirm={() => handleVerifyPayment(payment.id)}
              okText="بله"
              cancelText="خیر"
              okButtonProps={{ loading: isVerifying }}
            >
              <Tooltip title="تایید پرداخت">
                <button className="hover:text-green-600 transition-colors">
                  <CheckCircle size={20} />
                </button>
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="تاریخچه تراکنش‌ها"
        description="مشاهده و مدیریت تراکنش‌های مالی"
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
            title: 'مالی',
          },
          {
            title: 'تاریخچه تراکنش‌ها',
          },
        ]}
      />

      <DataTable
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ تراکنشی یافت نشد"
        itemName="تراکنش"
        tableProps={{
          onChange: handleTableChange({
            status: 'Status',
          }),
        }}
      />
    </div>
  );
};
