import React from "react";
import { Tag, Avatar, Input, Button } from "antd";
import { Home, UserCircle, Ticket, MessageSquare } from "lucide-react";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { PageHeader, DataTable } from "@/components/common";
import { useTable, useTableFilters } from "@/hooks";
import { ticketService } from "@/services";
import {
  TicketListItem,
  TicketType,
  TicketStatus,
  getTicketTypeName,
  getTicketTypeColor,
  getTicketStatusName,
  getTicketStatusColor,
} from "@/types/ticket.types";
import { formatDate } from "@/utils";

/**
 * TicketsPage Component - Display all tickets in a table
 */
export const TicketsPage: React.FC = () => {
  const navigate = useNavigate();

  // Initialize filters
  const { filters, handleTableChange } = useTableFilters();

  const {
    data: tickets,
    totalCount,
    isLoading,
    pagination,
  } = useTable<TicketListItem>({
    queryKey: "tickets",
    fetchFn: (params) =>
      ticketService.getAll({
        ...params,
      }),
    initialPageSize: 10,
    initialPageIndex: 1,
    filters,
  });

  console.log(tickets, "tickets");

  const columns: ColumnsType<TicketListItem> = [
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
      render: (userInfo: TicketListItem["userInfo"]) => (
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
            {userInfo.fullNameFa || "بدون نام"} - {userInfo?.phoneNumber}
          </span>
        </div>
      ),
    },
    {
      title: "نوع تیکت",
      dataIndex: "type",
      key: "type",
      width: 120,
      // Select filter with radio buttons
      filters: [
        {
          text: getTicketTypeName(TicketType.General),
          value: TicketType.General,
        },
        {
          text: getTicketTypeName(TicketType.Financial),
          value: TicketType.Financial,
        },
        {
          text: getTicketTypeName(TicketType.Technical),
          value: TicketType.Technical,
        },
        {
          text: getTicketTypeName(TicketType.Purchase),
          value: TicketType.Purchase,
        },
      ],
      filterMultiple: false,
      filteredValue:
        filters.Type !== null && filters.Type !== undefined
          ? [filters.Type as number]
          : null,
      render: (type: string) => (
        <Tag color={getTicketTypeColor(type)}>{getTicketTypeName(type)}</Tag>
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
          text: getTicketStatusName(TicketStatus.Open),
          value: TicketStatus.Open,
        },
        {
          text: getTicketStatusName(TicketStatus.InProgress),
          value: TicketStatus.InProgress,
        },
        {
          text: getTicketStatusName(TicketStatus.Answered),
          value: TicketStatus.Answered,
        },
        {
          text: getTicketStatusName(TicketStatus.Resolved),
          value: TicketStatus.Resolved,
        },
        {
          text: getTicketStatusName(TicketStatus.Closed),
          value: TicketStatus.Closed,
        },
      ],
      filterMultiple: false,
      filteredValue:
        filters.Status !== null && filters.Status !== undefined
          ? [filters.Status as number]
          : null,
      render: (status: string) => (
        <Tag color={getTicketStatusColor(status)}>
          {getTicketStatusName(status)}
        </Tag>
      ),
    },
    {
      title: "امتیاز",
      dataIndex: "score",
      key: "score",
      width: 100,
      align: "center",
      render: (score: number | null) => (
        <span className="text-sm">{score !== null ? score : "-"}</span>
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
      render: (_, record: TicketListItem) => (
        <Button
          type="primary"
          size="small"
          icon={<MessageSquare size={16} />}
          onClick={() => navigate(`/tickets/${record.id}`)}
        >
          مشاهده
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="لیست تیکت‌ها"
        description="مشاهده و مدیریت تمام تیکت‌های سیستم"
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
            title: "تیکت‌ها",
          },
        ]}
      />

      <DataTable<TicketListItem>
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
            type: "Type",
            status: "Status",
          }),
        }}
      />
    </div>
  );
};
