import React, {useState} from 'react';
import {Avatar, Button, Image, Input, Tag, Tooltip} from 'antd';
import {CheckCircle, Eye, Home, RotateCcw, UserCircle} from 'lucide-react';
import {SearchOutlined} from '@ant-design/icons';
import type {ColumnsType} from 'antd/es/table';
import {CourseFilter, DataTable, PageHeader} from '@/components/common';
import {usePaymentVerification, usePaymentRefund, useTable, useTableFilters} from '@/hooks';
import {courseService, paymentService} from '@/services';
import {Course} from '@/types/course.types';
import {
    formatAmount,
    getPaymentMethodColor,
    getPaymentMethodName,
    getPaymentStatusColor,
    getPaymentStatusName,
    getPaymentTypeColor,
    getPaymentTypeName,
    PaymentListItem,
    PaymentMethod,
    PaymentStatus,
    PaymentType,
} from '@/types/payment.types';
import {formatDate} from '@/utils';
import {PaymentVerificationModal} from './PaymentVerificationModal';
import {RefundModal} from './RefundModal';

/**
 * TransactionsPage Component - Display payment transactions with verification
 */
export const TransactionsPage: React.FC = () => {
  const { filters, handleTableChange, setFilter } = useTableFilters({
    CourseId: null,
  });
  const { verifyPayment, rejectPayment, isProcessing } = usePaymentVerification();
  const { refundPayment, isRefunding } = usePaymentRefund();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentListItem | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedRefundPayment, setSelectedRefundPayment] = useState<PaymentListItem | null>(null);

  // Fetch courses for filter
  const {
    data: courses = [],
    isLoading: isLoadingCourses,
  } = useTable<Course>({
    queryKey: 'courses',
    fetchFn: courseService.getAll,
    initialPageSize: 1000,
    initialPageIndex: 1,
  });

  const {
    data: payments,
    totalCount,
    isLoading,
    pagination,
  } = useTable<PaymentListItem>({
    queryKey: ['payments', filters],
    fetchFn: (params) =>
      paymentService.getAll({
        ...params,
        Status: filters.Status as PaymentStatus | undefined,
        Method: filters.Method as PaymentMethod | undefined,
        Type: filters.Type as PaymentType | undefined,
        ReferralCode: filters.ReferralCode as string | undefined,
        UserPhoneNumber: filters.UserPhoneNumber as string | undefined,
        UserFullName: filters.UserFullName as string | undefined,
        valueId: filters.CourseId as string | undefined,
      }),
    initialPageSize: 10,
    initialPageIndex: 1,
    filters,
  });

  const handleOpenModal = (payment: PaymentListItem) => {
    setSelectedPayment(payment);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPayment(null);
  };

  const handleVerifyPayment = async (paymentId: string) => {
    await verifyPayment({ paymentId });
  };

  const handleRejectPayment = async (paymentId: string, reason: string) => {
    await rejectPayment({ paymentId, reason });
  };

  const handleOpenRefundModal = (payment: PaymentListItem) => {
    setSelectedRefundPayment(payment);
    setRefundModalOpen(true);
  };

  const handleCloseRefundModal = () => {
    setRefundModalOpen(false);
    setSelectedRefundPayment(null);
  };

  const handleRefundPayment = async (paymentId: string, refundedMessage: string) => {
    await refundPayment({ paymentId, refundedMessage });
  };

  const columns: ColumnsType<PaymentListItem> = [
    {
      title: 'نام کاربر',
      key: 'userFullName',
      width: 180,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="جستجوی نام کاربر"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
              جستجو
            </Button>
            <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
              پاک کردن
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#4B26AD' : undefined }} />,
      filteredValue: filters.UserFullName ? [filters.UserFullName as string] : null,
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
          <div className="font-medium text-sm">{payment.user.fullNameFa}</div>
        </div>
      ),
    },
    {
      title: 'شماره تماس',
      key: 'userPhoneNumber',
      width: 140,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="جستجوی شماره تماس"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
              جستجو
            </Button>
            <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
              پاک کردن
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#4B26AD' : undefined }} />,
      filteredValue: filters.UserPhoneNumber ? [filters.UserPhoneNumber as string] : null,
      render: (_: any, payment: PaymentListItem) => (
        <span className="text-sm text-gray-600">{payment.user.phoneNumber}</span>
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
          title: 'بابت',
          dataIndex: 'value',
          key: 'value',
          width: 150,
          render: (value: any) => {
              if (value?.courseInfo) {
                  return <div className="text-sm text-gray-600">خرید : {value?.courseInfo?.name}</div>
              }

              if (value?.installmentInfo) {
                  return <div className="text-sm text-gray-600">قسط : {value?.installmentInfo?.course?.name}</div>
              }
          },
      },
    {
      title: 'روش پرداخت',
      dataIndex: 'method',
      key: 'method',
      width: 130,
      align: 'center',
      filters: [
        { text: 'کیف پول', value: PaymentMethod.Wallet },
        { text: 'کارت به کارت', value: PaymentMethod.CardToCard },
        { text: 'پرداخت آنلاین', value: PaymentMethod.OnlinePayment },
      ],
      filterMultiple: false,
      filteredValue: filters.Method ? [filters.Method as number] : null,
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
      filters: [
        { text: 'هیچ', value: PaymentType.None },
        { text: 'رایگان', value: PaymentType.Free },
        { text: 'اقساطی', value: PaymentType.Installment },
        { text: 'پرداخت کامل', value: PaymentType.FullyPayment },
      ],
      filterMultiple: false,
      filteredValue: filters.Type ? [filters.Type as number] : null,
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
        { text: 'رد شده توسط ادمین', value: PaymentStatus.Rejected },
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
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="جستجوی کد رهگیری"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
              جستجو
            </Button>
            <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
              پاک کردن
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#4B26AD' : undefined }} />,
      filteredValue: filters.ReferralCode ? [filters.ReferralCode as string] : null,
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
        <div className="text-sm text-gray-600">{formatDate(date , true)}</div>
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_: any, payment: PaymentListItem) => {

        if (payment.method === PaymentMethod.CardToCard && (payment.status === PaymentStatus.Paid || payment.status === PaymentStatus.Rejected)) {
                return <div className={'flex gap-x-4 items-center'}>
                    <Image
                        src={payment.cardToCard.imageUrl}
                        alt="رسید کارت به کارت"
                        width={40}
                        height={40}
                        className="rounded object-cover"
                        preview={{
                            mask: <Eye size={18} />
                        }}
                    />
                    <Tooltip title="استرداد وجه">
                        <Button
                            type="text"
                            danger
                            icon={<RotateCcw size={18} />}
                            onClick={() => handleOpenRefundModal(payment)}
                        >
                            استرداد
                        </Button>
                    </Tooltip>
                </div>
        }
        // Refund button for paid payments
        if (payment.status === PaymentStatus.Paid) {
          return (
            <div className="flex items-center justify-center gap-2">
              <Tooltip title="استرداد وجه">
                <Button
                  type="text"
                  danger
                  icon={<RotateCcw size={18} />}
                  onClick={() => handleOpenRefundModal(payment)}
                >
                  استرداد
                </Button>
              </Tooltip>
            </div>
          );
        }

        // Only show verify button for card to card payments that are pending
        if (payment.method !== PaymentMethod.CardToCard || payment.status !== PaymentStatus.Pending)  {
          return <span className="text-gray-400 text-xs">-</span>;
        }

        return (
          <div className="flex items-center justify-center gap-3">
            <Tooltip title="بررسی پرداخت">
              <Button
                type="text"
                icon={<CheckCircle size={18} />}
                onClick={() => handleOpenModal(payment)}
                className="hover:text-green-600"
              >
                بررسی
              </Button>
            </Tooltip>
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

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4">
          <CourseFilter
            value={filters.CourseId as string}
            onChange={(value) => setFilter('CourseId', value)}
            courses={courses}
            loading={isLoadingCourses}
          />
        </div>
      </div>

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
            method: 'Method',
            type: 'Type',
            referralCode: 'ReferralCode',
            userPhoneNumber: 'UserPhoneNumber',
            userFullName: 'UserFullName',
          }),
        }}
      />

      <PaymentVerificationModal
        open={modalOpen}
        payment={selectedPayment}
        onClose={handleCloseModal}
        onVerify={handleVerifyPayment}
        onReject={handleRejectPayment}
        loading={isProcessing}
      />

      <RefundModal
        open={refundModalOpen}
        payment={selectedRefundPayment}
        onClose={handleCloseRefundModal}
        onRefund={handleRefundPayment}
        loading={isRefunding}
      />
    </div>
  );
};
