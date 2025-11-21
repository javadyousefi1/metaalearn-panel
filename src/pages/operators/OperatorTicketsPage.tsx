import React from "react";
import { Tag, Avatar, Input, Button } from "antd";
import { Home, UserCircle, Ticket, MessageSquare } from "lucide-react";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { PageHeader, DataTable } from "@/components/common";
import { useTable, useTableFilters } from "@/hooks";
import { courseTicketService } from "@/services";
import {
  CourseTicketListItem,
  CourseTicketStatus,
  getCourseTicketStatusName,
  getCourseTicketStatusColor,
} from "@/types/courseTicket.types";
import { formatDate } from "@/utils";

/**
 * OperatorTicketsPage Component - Display all course tickets in a table
 */
export const OperatorTicketsPage: React.FC = () => {
  const navigate = useNavigate();

  // Initialize filters
  const { filters, handleTableChange } = useTableFilters();

  const {
    data: tickets,
    totalCount,
    isLoading,
    pagination,
  } = useTable<CourseTicketListItem>({
    queryKey: "course-tickets",
    fetchFn: (params) =>
      courseTicketService.getAll({
        ...params,
      }),
    initialPageSize: 10,
    initialPageIndex: 1,
    filters,
  });

  const columns: ColumnsType<CourseTicketListItem> = [
    {
      title: "عنوان تیکت",
      dataIndex: "title",
      key: "title",
      width: 250,
      // Text search filter
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="جستجوی عنوان"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              جستجو
            </Button>
            <Button
              onClick={() => clearFilters && clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              پاک کردن
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#4B26AD" : undefined }} />
      ),
      filteredValue: filters.Title ? [filters.Title as string] : null,
      render: (title: string) => (
        <div className="flex items-center gap-2">
          <Ticket size={16} style={{ color: "#4B26AD" }} />
          <span className="font-medium">{title}</span>
        </div>
      ),
    },
    {
      title: "کاربر",
      dataIndex: "userInfo",
      key: "user",
      width: 200,
      render: (userInfo: CourseTicketListItem["userInfo"]) => (
        <div className="flex items-center gap-2">
          {userInfo.imageUrl ? (
            <Avatar size={32} src={userInfo.imageUrl} />
          ) : (
            <Avatar
              size={32}
              icon={<UserCircle />}
              style={{ backgroundColor: "#4B26AD" }}
            />
          )}
          <span className="font-medium">
            {userInfo.fullNameFa || "بدون نام"}
          </span>
        </div>
      ),
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: "center",
      // Select filter with radio buttons
      filters: [
        {
          text: getCourseTicketStatusName(CourseTicketStatus.Open),
          value: CourseTicketStatus.Open,
        },
        {
          text: getCourseTicketStatusName(CourseTicketStatus.InProgress),
          value: CourseTicketStatus.InProgress,
        },
        {
          text: getCourseTicketStatusName(CourseTicketStatus.Answered),
          value: CourseTicketStatus.Answered,
        },
        {
          text: getCourseTicketStatusName(CourseTicketStatus.Resolved),
          value: CourseTicketStatus.Resolved,
        },
        {
          text: getCourseTicketStatusName(CourseTicketStatus.Closed),
          value: CourseTicketStatus.Closed,
        },
      ],
      filterMultiple: false,
      filteredValue:
        filters.Status !== null && filters.Status !== undefined
          ? [filters.Status as number]
          : null,
      render: (status: string) => (
        <Tag color={getCourseTicketStatusColor(status)}>
          {getCourseTicketStatusName(status)}
        </Tag>
      ),
    },
    {
      title: "شناسه دوره",
      dataIndex: "courseId",
      key: "courseId",
      width: 150,
      render: (courseId: string) => (
        <span className="text-sm font-mono">{courseId.substring(0, 8)}...</span>
      ),
    },
    {
      title: "شناسه برنامه",
      dataIndex: "courseScheduleId",
      key: "courseScheduleId",
      width: 150,
      render: (courseScheduleId: string | null) => (
        <span className="text-sm font-mono">
          {courseScheduleId ? `${courseScheduleId.substring(0, 8)}...` : "-"}
        </span>
      ),
    },
    {
      title: "تاریخ ایجاد",
      dataIndex: "createdTime",
      key: "createdTime",
      width: 150,
      render: (createdTime: string) => (
        <span className="text-sm">{formatDate(createdTime)}</span>
      ),
    },
    {
      title: "عملیات",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record: CourseTicketListItem) => (
        <Button
          type="primary"
          size="small"
          icon={<MessageSquare size={16} />}
          onClick={() => navigate(`/operators/${record.id}`)}
        >
          مشاهده
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="اپراتورها"
        description="مشاهده و مدیریت تیکت‌های اپراتور"
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
            title: "اپراتورها",
          },
        ]}
      />

      <DataTable<CourseTicketListItem>
        columns={columns}
        dataSource={tickets}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ تیکتی یافت نشد"
        itemName="تیکت"
        tableProps={{
          onChange: handleTableChange({
            title: "Title",
            status: "Status",
          }),
        }}
      />
    </div>
  );
};
