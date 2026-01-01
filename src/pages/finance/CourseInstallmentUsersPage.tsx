import React from 'react';
import { Tag, Avatar } from 'antd';
import { Home, UserCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable } from '@/hooks';
import { userService } from '@/services';
import { PurchasedCourseItem } from '@/types/user.types';
import { CoursePaymentType } from '@/enums';

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
      title: 'روش پرداخت',
      dataIndex: ['invoice', 'paymentType'],
      key: 'paymentType',
      align: 'center',
      render: (paymentType: number) => (
        <Tag color={getPaymentMethodColor(paymentType)}>
          {CoursePaymentType[paymentType as keyof typeof CoursePaymentType]}
        </Tag>
      ),
    },
    {
      title: 'مبلغ (تومان)',
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
    </div>
  );
};
