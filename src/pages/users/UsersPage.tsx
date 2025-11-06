import React from 'react';
import { Tag, Avatar } from 'antd';
import { Home, UserCircle } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable } from '@/hooks';
import { userService } from '@/services';
import { UserListItem } from '@/types/user.types';
import dayjs from 'dayjs';

/**
 * UsersPage Component - Display all users in a table
 */
export const UsersPage: React.FC = () => {
  const {
    data: users,
    totalCount,
    isLoading,
    pagination,
  } = useTable<UserListItem>({
    queryKey: 'users',
    fetchFn: (params) => userService.getAll({
      PageIndex: params.PageIndex,
      PageSize: params.PageSize,
      IncludeProfile: false,
      IncludeIdentity: false,
    }),
    initialPageSize: 10,
    initialPageIndex: 1,
  });

  const columns: ColumnsType<UserListItem> = [
    {
      title: 'کاربر',
      key: 'user',
      width: 250,
      render: (_: any, record: UserListItem) => (
        <div className="flex items-center gap-3">
          {record.imageUrl ? (
            <Avatar size={40} src={record.imageUrl} />
          ) : (
            <Avatar size={40} icon={<UserCircle />} style={{ backgroundColor: '#1890ff' }} />
          )}
          <div>
            <div className="font-semibold">{record.fullNameFa || 'بدون نام'}</div>
            <div className="text-xs text-gray-500">{record.phoneNumber}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'نام کاربری',
      dataIndex: 'username',
      key: 'username',
      render: (username: string | null) => username || <span className="text-gray-400">-</span>,
    },
    {
      title: 'کد معرف',
      dataIndex: 'referralId',
      key: 'referralId',
      render: (referralId: string) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{referralId}</code>
      ),
    },
    {
      title: 'نقش‌ها',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <div className="flex flex-wrap gap-1">
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <Tag key={role} color="blue">
                {role}
              </Tag>
            ))
          ) : (
            <Tag>بدون نقش</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'فعال' : 'غیرفعال'}
        </Tag>
      ),
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (createdTime: string) => (
        <span className="text-sm">{dayjs(createdTime).format('YYYY/MM/DD')}</span>
      ),
    },
    {
      title: 'آخرین به‌روزرسانی',
      dataIndex: 'updatedTime',
      key: 'updatedTime',
      render: (updatedTime: string | null) =>
        updatedTime ? (
          <span className="text-sm">{dayjs(updatedTime).format('YYYY/MM/DD')}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="لیست کاربران"
        description="مشاهده تمام کاربران سیستم"
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
            title: 'لیست کاربران',
          },
        ]}
      />

      <DataTable<UserListItem>
        columns={columns}
        dataSource={users}
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
