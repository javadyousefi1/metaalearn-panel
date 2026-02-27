import React from 'react';
import { Tag, Button, Tooltip } from 'antd';
import { Home, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable } from '@/hooks';
import { courseService } from '@/services';
import { Course } from '@/types/course.types';
import { ROUTES } from '@/constants';

export const ExamCoursesPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: courses,
    totalCount,
    isLoading,
    pagination,
  } = useTable<Course>({
    queryKey: 'courses-exams',
    fetchFn: courseService.getAll,
    initialPageSize: 10,
    initialPageIndex: 1,
  });

  const columns: ColumnsType<Course> = [
    {
      title: 'نام دوره',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: 'دسته‌بندی',
      dataIndex: ['category', 'name'],
      key: 'categoryName',
      render: (cName: string) => <Tag>{cName || '—'}</Tag>,
    },
    {
      title: 'عملیات',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_: any, record: Course) => (
        <Tooltip title="مشاهده آزمون‌ها">
          <Button
            type="primary"
            ghost
            icon={<GraduationCap size={16} />}
            onClick={() => navigate(ROUTES.COURSES.EXAMS.DETAIL(record.id))}
            className="hover:shadow-md transition-all"
          >
            آزمون‌ها
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="آزمون‌ها"
        description="برای مشاهده و مدیریت آزمون‌های هر دوره، روی دوره مورد نظر کلیک کنید"
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
            title: 'آزمون‌ها',
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
        emptyText="هیچ دوره‌ای یافت نشد"
        itemName="دوره"
      />
    </div>
  );
};
