import React from 'react';
import {Button, Spin, Tag} from 'antd';
import { Home, RefreshCw } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable } from '@/hooks';
import { courseService } from '@/services';
import { Course } from '@/types/course.types';
import {CoursePaymentType, CourseStatus, CourseType} from "@/enums";

const getCourseTypeColor = (type: number): string => {
  const colorMap: Record<number, string> = {
    0: 'default',     // تعیین نشده
    1: 'blue',        // آنلاین
    2: 'purple',      // ویدیویی
    3: 'cyan',        // آنلاین و ویدیویی
  };
  return colorMap[type] || 'default';
};

const getCourseStatusColor = (status: number): string => {
  const colorMap: Record<number, string> = {
    0: 'default',     // تعیین نشده
    1: 'green',       // عادی
    2: 'red',         // تمام شده
    3: 'orange',      // پیش ثبت نام
    4: 'volcano',     // غیر فعال
    5: 'red',         // تمام شده
  };
  return colorMap[status] || 'default';
};


const getPaymentMethodColor = (method: number): string => {
  const colorMap: Record<number, string> = {
    0: 'default',     // تعیین نشده
    1: 'green',       // رایگان
    2: 'orange',      // قسطی
    3: 'blue',        // نقدی
  };
  return colorMap[method] || 'default';
};

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
      render: (courseType: number) => (
        <Tag color={getCourseTypeColor(courseType)}>
          {CourseType[Number(courseType)]}
        </Tag>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (courseStatus: number) => (
        <Tag color={getCourseStatusColor(courseStatus)}>
          {CourseStatus[Number(courseStatus)]}
        </Tag>
      ),
    },
    {
      title: 'روش پرداخت',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      align: 'center',
      render: (coursePaymentType: number) => (
        <Tag color={getPaymentMethodColor(coursePaymentType)}>
          {CoursePaymentType[Number(coursePaymentType)]}
        </Tag>
      ),
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
        emptyText="هیچ دوره‌ای یافت نشد"
        itemName="دوره"
      />
    </div>
  );
};
