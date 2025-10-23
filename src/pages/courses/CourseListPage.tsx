import React from 'react';
import {Button, Spin, Tag} from 'antd';
import { Home, RefreshCw } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable } from '@/hooks';
import { courseService } from '@/services';
import { Course } from '@/types/course.types';

/**
 * CourseListPage Component
 * Displays a paginated table of courses using the reusable useTable hook
 */
export const CourseListPage: React.FC = () => {
  const {
    data: courses,
    totalCount,
    isLoading,
    pagination,
    refresh,
  } = useTable<Course>({
    queryKey: 'courses',
    fetchFn: courseService.getAll,
    initialPageSize: 10,
    initialPageIndex: 1,
  });

  // Define table columns
  const columns: ColumnsType<Course> = [
    {
      title: 'نام دوره',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
    },
    {
      title: 'دسته‌بندی',
      dataIndex: ['category', 'name'],
      key: 'categoryName',
      width: 150,
      render :(cName:string) => <Tag>{cName}</Tag>
    },
    {
      title: 'نوع',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
    },
    {
      title: 'روش پرداخت',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      align: 'center',
    },
    {
      title: 'قیمت (تومان)',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      align: 'right',
      render: (price: number) => price.toLocaleString('fa-IR'),
    },
    {
      title: 'گواهینامه',
      dataIndex: 'isCertificateAvailable',
      key: 'isCertificateAvailable',
      width: 100,
      align: 'center',
      render: (value: boolean) => (value ? 'دارد' : 'ندارد'),
    },
    {
      title: 'پیش‌نیازها',
      dataIndex: 'preRequisites',
      key: 'preRequisites',
      width: 200,
      ellipsis: true,
    },
  ];

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="در حال بارگذاری..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="لیست دوره‌ها"
        description="مشاهده و مدیریت دوره‌های آموزشی"
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
            title: 'دوره‌ها',
          },
          {
            title: 'لیست دوره‌ها',
          },
        ]}
        actions={
          <Button
            type="default"
            size="large"
            icon={<RefreshCw size={18} />}
            onClick={() => refresh()}
            loading={isLoading}
            className="shadow-sm hover:shadow-md transition-all"
          >
            به‌روزرسانی
          </Button>
        }
      />

      <DataTable<Course>
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        scroll={{ x: 1200 }}
        emptyText="هیچ دوره‌ای یافت نشد"
        itemName="دوره"
      />
    </div>
  );
};
