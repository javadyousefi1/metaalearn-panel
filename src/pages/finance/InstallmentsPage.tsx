import React from 'react';
import {Button, Tag, Tooltip} from 'antd';
import { Home, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable } from '@/hooks';
import { courseService } from '@/services';
import { Course } from '@/types/course.types';
import {CoursePaymentType, CourseStatus, CourseType} from "@/enums";
import { ROUTES } from '@/constants';

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

export const InstallmentsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: courses,
    totalCount,
    isLoading,
    pagination,
    refresh,
  } = useTable<Course>({
    queryKey: 'courses',
    fetchFn: (params) => courseService.getAll({...params,
        paymentType: 2
    }),
    initialPageSize: 10,
    initialPageIndex: 1,
  });

  const handleDetailsClick = (courseId: string) => {
    navigate(ROUTES.FINANCE.INSTALLMENT_DETAIL(courseId));
  };

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
          {CourseType[courseType as keyof typeof CourseType]}
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
          {CourseStatus[courseStatus as keyof typeof CourseStatus]}
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
      title: 'جزئیات',
      key: 'details',
      align: 'center',
      width: 100,
      render: (_: any, record: Course) => (
        <Tooltip title="مشاهده کاربران">
          <Button
            type="text"
            icon={<Eye size={18} />}
            onClick={() => handleDetailsClick(record.id)}
            className="hover:bg-green-50 hover:text-green-600"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="مدیریت اقساط"
        description="مشاهده و مدیریت اقساط"
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
        ]}
      />

      <DataTable<Course>
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ داده‌ای یافت نشد"
        itemName="آیتم"
      />
    </div>
  );
};
