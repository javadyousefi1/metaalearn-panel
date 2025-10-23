import React from 'react';
import {Button, Spin, Tag} from 'antd';
import { Home, RefreshCw } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable } from '@/hooks';
import { courseService } from '@/services';
import { Course } from '@/types/course.types';
import {CoursePaymentType, CourseStatus, CourseType} from "@/enums";

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
    },
    {
      title: 'دسته‌بندی',
      dataIndex: ['category', 'name'],
      key: 'categoryName',
      render :(cName:string) => <Tag>{cName}</Tag>
    },
    {
      title: 'نوع',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      render: (courseType:number) => CourseType[Number(courseType)]
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (courseStatus:number) => CourseStatus[Number(courseStatus)]
    },
    {
      title: 'روش پرداخت',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      align: 'center',
      render: (coursePaymentType:number) => CoursePaymentType[Number(coursePaymentType)]
    },
    {
      title: 'قیمت (تومان)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price: number) => price.toLocaleString('fa-IR'),
    },
    {
      title: 'گواهینامه',
      dataIndex: 'isCertificateAvailable',
      key: 'isCertificateAvailable',
      align: 'center',
      render: (value: boolean) => (value ? <Tag color={"blue"}>دارد</Tag> : <Tag color={"red"}>ندارد</Tag>),
    },
    {
      title: 'پیش‌نیازها',
      dataIndex: 'preRequisites',
      key: 'preRequisites',
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
