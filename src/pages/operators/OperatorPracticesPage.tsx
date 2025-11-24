import React from "react";
import { Tag, Button } from "antd";
import { Home, BookOpen, ClipboardList, ArrowRight } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { PageHeader, DataTable } from "@/components/common";
import { useTable } from "@/hooks";
import { courseService } from "@/services";
import { Course } from "@/types";
import { ROUTES } from "@/constants";

/**
 * OperatorPracticesPage Component - Display all courses in a table
 */
export const OperatorPracticesPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: courses,
    totalCount,
    isLoading,
    pagination,
  } = useTable<Course>({
    queryKey: "courses-for-practices",
    fetchFn: (params) =>
      courseService.getAll({
        ...params,
      }),
    initialPageSize: 10,
    initialPageIndex: 1,
  });

  const columns: ColumnsType<Course> = [
    {
      title: "نام دوره",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (name: string, record: Course) => (
        <div className="flex items-center gap-2">
          {record.gallery && record.gallery.length > 0 ? (
            <img
              src={
                record.gallery.find((g) => g.type === 0)?.shareableUrl ||
                record.gallery[0]?.shareableUrl
              }
              alt={name}
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
          )}
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: "توضیحات",
      dataIndex: "shortText",
      key: "shortText",
      width: 300,
      render: (shortText: string) => (
        <span className="text-sm text-gray-600">{shortText || "-"}</span>
      ),
    },
    {
      title: "دسته‌بندی",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (category: Course["category"]) =>
        category ? <Tag color="blue">{category.name}</Tag> : <span>-</span>,
    },
    {
      title: "تعداد دانشجو",
      dataIndex: "enrollmentCount",
      key: "enrollmentCount",
      width: 120,
      align: "center",
      render: (enrollmentCount: number) => (
        <div className="flex items-center justify-center gap-1">
          <ClipboardList size={16} className="text-gray-500" />
          <span>{enrollmentCount || 0}</span>
        </div>
      ),
    },
    {
      title: "قیمت",
      dataIndex: "price",
      key: "price",
      width: 150,
      align: "center",
      render: (price: number) => (
        <span className="font-semibold text-purple-600">
          {price.toLocaleString("fa-IR")} تومان
        </span>
      ),
    },
    {
      title: "عملیات",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record: Course) => (
        <Button
          type="primary"
          size="small"
          icon={<ArrowRight size={16} />}
          onClick={() => navigate(ROUTES.OPERATORS.PRACTICE_DETAIL(record.id))}
        >
          مشاهده تمرین‌ها
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="تمرین‌ها"
        description="انتخاب دوره برای مشاهده تمرین‌های دانشجویان"
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
            title: "اپراتور",
          },
          {
            title: "تمرین‌ها",
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
