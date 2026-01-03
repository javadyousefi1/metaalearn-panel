import React, { useState } from 'react';
import { Tag, Avatar, Modal, Button, Spin, Empty } from 'antd';
import { Home, UserCircle, Eye } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable } from '@/hooks';
import { useGetUserWithInvoices } from '@/hooks/useUsers';
import { userService } from '@/services';
import { PurchasedCourseItem } from '@/types/user.types';
import { CoursePaymentType } from '@/enums';
import { formatPriceWithCurrency } from '@/utils/format';

const getPaymentMethodColor = (method: number): string => {
  const colorMap: Record<number, string> = {
    0: 'default',     // تعیین نشده
    1: 'green',       // رایگان
    2: 'orange',      // قسطی
    3: 'blue',        // نقدی
  };
  return colorMap[method] || 'default';
};

export const CourseInstallmentUsersPage: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  const {
    data: purchasedCourses,
    totalCount,
    isLoading,
    pagination,
  } = useTable<PurchasedCourseItem>({
    queryKey: ['course-installment-users', courseId],
    fetchFn: async (params) => {
      const response = await userService.getAllPurchasedCourses({
        ...params,
        CourseId: courseId,
      });
      return {
        items: response.courses.items,
        totalCount: response.courses.totalCount,
      };
    },
    initialPageSize: 10,
    initialPageIndex: 1,
  });

  // Fetch user with invoices when modal is open
  const { data: userData, isLoading: isLoadingUserData } = useGetUserWithInvoices(
    selectedUserId,
    isModalOpen && !!selectedUserId
  );

  // Handle view installments
  const handleViewInstallments = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsModalOpen(true);
  };

  // Find the invoice for this course
  const invoice = userData?.invoices?.find((inv: any) => inv.valueInfo?.id === courseId);

  const columns: ColumnsType<PurchasedCourseItem> = [
    {
      title: 'کاربر',
      key: 'user',
      render: (_: any, record: PurchasedCourseItem) => (
      <div className="flex items-center gap-2">
          {record.userInfo.imageUrl ? (
              <Avatar size={32} src={record.userInfo.imageUrl} />
          ) : (
              <Avatar size={32} icon={<UserCircle />} style={{ backgroundColor: '#4B26AD' }} />
          )}
          <span className="font-medium">{record.userInfo.fullNameFa || 'بدون نام'}</span>
      </div>
      ),
    },
    {
      title: 'نام دوره',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'دسته‌بندی',
      dataIndex: ['category', 'name'],
      key: 'categoryName',
      render: (cName: string) => <Tag>{cName}</Tag>,
    },
    {
      title: 'جمع پرداختی (تومان)',
      dataIndex: ['invoice', 'price'],
      key: 'price',
      align: 'right',
      render: (price: number) => price.toLocaleString('fa-IR'),
    },
    {
      title: 'وضعیت پرداخت',
      dataIndex: ['invoice', 'isSettled'],
      key: 'isSettled',
      align: 'center',
      render: (isSettled: boolean) => (
        <Tag color={isSettled ? 'green' : 'red'}>
          {isSettled ? 'تسویه شده' : 'تسویه نشده'}
        </Tag>
      ),
    },
      {
          title: 'تعداد قسط پرداختی',
          dataIndex: ['invoice'],
          key: 'isSettled',
          align: 'center',
          render: (isSettled: any) => (
              <Tag color={isSettled ? 'green' : 'red'}>
                  {isSettled?.paidInstallmentCount} از {isSettled?.totalInstallmentCount}
              </Tag>
          ),
      },
    {
      title: 'دسترسی',
      dataIndex: ['invoice', 'hasAccess'],
      key: 'hasAccess',
      align: 'center',
      render: (hasAccess: boolean) => (
        <Tag color={hasAccess ? 'blue' : 'default'}>
          {hasAccess ? 'دارد' : 'ندارد'}
        </Tag>
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      align: 'center',
      render: (_: any, record: PurchasedCourseItem) => (
        <Button
          type="primary"
          icon={<Eye className="h-4 w-4" />}
          onClick={() => handleViewInstallments(record.userInfo.id, record.userInfo.fullNameFa || 'کاربر')}
        >
          مشاهده اقساط
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="کاربران دوره"
        description="مشاهده کاربران ثبت‌نام شده در دوره"
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
            title: 'مدیریت اقساط',
          },
          {
            title: 'جزئیات دوره',
          },
        ]}
      />

      <DataTable<PurchasedCourseItem>
        columns={columns}
        dataSource={purchasedCourses}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ کاربری یافت نشد"
        itemName="کاربر"
      />

      {/* Installment Status Modal */}
      <Modal
        title={`وضعیت اقساط - ${selectedUserName}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedUserId(null);
          setSelectedUserName('');
        }}
        footer={null}
        centered
        width={900}

      >
        {isLoadingUserData ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Spin size="large" />
          </div>
        ) : !invoice ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="فاکتور یافت نشد"
            className="py-12"
          />
        ) : (
          <div className="space-y-6 py-4 max-h-[85vh] overflow-y-auto">
            {/* Course Info */}
            <div>
              <p className="text-lg font-bold text-gray-800">
                {invoice.valueInfo?.name}
              </p>
            </div>

            {/* Info Boxes */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* مبلغ کل هزینه دوره */}
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-grade-two mb-2 text-sm">مبلغ کل هزینه دوره</p>
                <p className="text-dark text-sm font-bold">
                  {formatPriceWithCurrency(invoice.valuePrice)}
                </p>
              </div>

              {/* تعداد اقساط */}
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-grade-two mb-2 text-sm">تعداد اقساط</p>
                <p className="text-dark text-sm font-bold">
                  {invoice.valueInstallmentCount || 0}
                </p>
              </div>

              {/* مدت و دوره پرداخت */}
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-grade-two mb-2 text-sm">مدت و دوره پرداخت</p>
                <p className="text-dark text-sm font-bold">
                  {invoice.valueInstallmentCount || 0} قسط
                </p>
              </div>
            </div>

            {/* Installment Timeline */}
            <div className="bg-white p-6">
              <p className="text-dark mb-6 font-bold">وضعیت پرداخت اقساط</p>

              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: invoice.valueInstallmentCount || 0 }, (_, index) => {
                  const stepNumber = index + 1;
                  const transaction = invoice.transactions?.find(
                    (t: any) => t.installmentStep === stepNumber,
                  );
                  const isPaid = transaction?.isPaid || false;
                  const isPending = transaction?.isPaymentPending || false;
                  const paidTransactions = invoice.transactions?.filter((t: any) => t.isPaid) || [];
                  const unpaidTransactions = invoice.transactions?.filter((t: any) => !t.isPaid) || [];
                  const currentInstallmentStep =
                    unpaidTransactions.length > 0
                      ? unpaidTransactions[0].installmentStep || paidTransactions.length + 1
                      : invoice.valueInstallmentCount || 0;
                  const isCurrent = stepNumber === currentInstallmentStep;
                  const isFuture = stepNumber > currentInstallmentStep;

                  let circleColor = 'bg-[#F0F0F0] text-[#767676]'; // Future - gray
                  if (isPaid) {
                    circleColor = 'bg-[#E6FFE7] text-[#1C9121]'; // Paid - green
                  } else if (isPending) {
                    circleColor = 'bg-[#FFF4E6] text-[#FF8C00]'; // Pending - orange
                  } else if (isCurrent) {
                    circleColor = 'bg-[#F3EEFF] text-primary'; // Current - primary
                  }

                  return (
                    <div
                      key={stepNumber}
                      className="flex flex-col items-center gap-2"
                    >
                      {/* Circle */}
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${circleColor}`}
                      >
                        <span className="font-semibold">{stepNumber}</span>
                      </div>

                      {/* Label */}
                      <div className="text-center">
                        {transaction && (
                          <>
                            <p className="text-xs font-medium">
                              {formatPriceWithCurrency(transaction.amount)}
                            </p>
                            {transaction.dueDate && (
                              <p className="mt-1 text-xs text-gray-500">
                                {new Date(transaction.dueDate).toLocaleDateString(
                                  'fa-IR',
                                )}
                              </p>
                            )}
                          </>
                        )}
                        {isPaid && (
                          <p className="mt-1 text-xs text-green-600">پرداخت شده</p>
                        )}
                        {isPending && (
                          <p className="mt-1 text-xs text-[#FF8C00]">
                            در انتظار تایید
                          </p>
                        )}
                        {!isPaid &&
                          !isPending &&
                          isCurrent &&
                          invoice.valueInstallmentCount !== index + 1 && (
                            <p className="text-primary-500 mt-1 text-xs">
                              در انتظار پرداخت
                            </p>
                          )}
                        {isFuture && (
                          <p className="mt-1 text-center text-xs text-gray-500">
                            آینده
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
