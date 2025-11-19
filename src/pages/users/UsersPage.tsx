import React, { useState } from 'react';
import {Tag, Avatar, Tooltip, Input, Button} from 'antd';
import { Home, UserCircle, ShieldCheck, UserCog } from 'lucide-react';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable, useTableFilters } from '@/hooks';
import { userService } from '@/services';
import { UserListItem, getIdentityStatusName, getIdentityStatusColor, IdentityStatusType, RoleType, getRoleTypeName } from '@/types/user.types';
import { UserIdentityModal } from './UserIdentityModal';
import { RoleManagementModal } from './RoleManagementModal';
import { formatDate } from "@/utils";

/**
 * UsersPage Component - Display all users in a table
 */
export const UsersPage: React.FC = () => {
  const [identityModalOpen, setIdentityModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; roles?: string[] } | null>(null);

  // Initialize filters
  const {
    filters,
    setFilter,
    clearFilters,
  } = useTableFilters();

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
      IncludeProfile: true,
      IncludeIdentity: true,
      IdentityStatus: params.IdentityStatus,
      PhoneNumber: params.PhoneNumber,
      FullNameFa: params.FullNameFa,
      Role: params.Role,
    }),
    initialPageSize: 10,
    initialPageIndex: 1,
    filters, // Pass filters to the hook
  });

  const handleOpenIdentityModal = (user: UserListItem) => {
    setSelectedUser({ id: user.id, name: user.fullNameFa || 'بدون نام', roles: user.roles });
    setIdentityModalOpen(true);
  };

  const handleCloseIdentityModal = () => {
    setIdentityModalOpen(false);
    setSelectedUser(null);
  };

  const handleOpenRoleModal = (user: UserListItem) => {
    setSelectedUser({ id: user.id, name: user.fullNameFa || 'بدون نام', roles: user.roles });
    setRoleModalOpen(true);
  };

  const handleCloseRoleModal = () => {
    setRoleModalOpen(false);
    setSelectedUser(null);
  };

  const columns: ColumnsType<UserListItem> = [
    {
      title: 'کاربر',
      key: 'user',
      width: 250,
      // Text search filter
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="جستجوی نام یا شماره تلفن"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
              جستجو
            </Button>
            <Button onClick={() => clearFilters && clearFilters()} size="small" style={{ width: 90 }}>
              پاک کردن
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#4B26AD' : undefined }} />,
      filteredValue: filters.FullNameFa ? [filters.FullNameFa as string] : null,
      render: (_: any, record: UserListItem) => (
        <div className="flex items-center gap-3">
          {record.imageUrl ? (
            <Avatar size={40} src={record.imageUrl} />
          ) : (
            <Avatar size={40} icon={<UserCircle />} style={{ backgroundColor: '#4B26AD' }} />
          )}
          <div>
            <div className="font-semibold">{record.fullNameFa || 'بدون نام'}</div>
            <div className="text-xs text-gray-500">{record.phoneNumber}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'نقش‌ها',
      dataIndex: 'roles',
      key: 'roles',
      // Select filter
      filters: [
        { text: getRoleTypeName(RoleType.SuperAdmin), value: RoleType.SuperAdmin },
        { text: getRoleTypeName(RoleType.Instructor), value: RoleType.Instructor },
        { text: getRoleTypeName(RoleType.Student), value: RoleType.Student },
        { text: getRoleTypeName(RoleType.Operator), value: RoleType.Operator },
        { text: getRoleTypeName(RoleType.OperatorAdmin), value: RoleType.OperatorAdmin },
      ],
      filteredValue: filters.Role !== null && filters.Role !== undefined ? [filters.Role as number] : null,
      render: (roles: string[]) =>{
        if (roles?.length === 5) return <Tag>تمام نقش‌ها</Tag>
        return <div className="flex flex-wrap gap-2">
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
      },
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
      title: 'وضعیت هویت',
      dataIndex: 'identity',
      key: 'identity',
      align: 'center',
      // Select filter
      filters: [
        { text: getIdentityStatusName(IdentityStatusType.None), value: IdentityStatusType.None },
        { text: getIdentityStatusName(IdentityStatusType.Requested), value: IdentityStatusType.Requested },
        { text: getIdentityStatusName(IdentityStatusType.Pending), value: IdentityStatusType.Pending },
        { text: getIdentityStatusName(IdentityStatusType.Verified), value: IdentityStatusType.Verified },
        { text: getIdentityStatusName(IdentityStatusType.Rejected), value: IdentityStatusType.Rejected },
        { text: getIdentityStatusName(IdentityStatusType.Revoked), value: IdentityStatusType.Revoked },
      ],
      filteredValue: filters.IdentityStatus !== null && filters.IdentityStatus !== undefined ? [filters.IdentityStatus as number] : null,
      render: (identity: any) => {
        const statusType = identity?.statusType ?? IdentityStatusType.None;
        return (
          <Tag color={getIdentityStatusColor(statusType)}>
            {getIdentityStatusName(statusType)}
          </Tag>
        );
      },
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (createdTime: string) => (
        <span className="text-sm">{formatDate(createdTime)}</span>
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_: any, record: UserListItem) => (
        <div className="flex items-center justify-center gap-3">
          <Tooltip title="احراز هویت">
            <button
              onClick={() => handleOpenIdentityModal(record)}
              className="hover:text-blue-600 transition-colors"
            >
              <ShieldCheck size={20} />
            </button>
          </Tooltip>
          <Tooltip title="مدیریت نقش‌ها">
            <button
              onClick={() => handleOpenRoleModal(record)}
              className="hover:text-purple-600 transition-colors"
            >
              <UserCog size={20} />
            </button>
          </Tooltip>
        </div>
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
        tableProps={{
          onChange: (_, tableFilters) => {
            // Sync table filters with state
            setFilter('FullNameFa', tableFilters.user?.[0] || null);
            setFilter('Role', tableFilters.roles?.[0] || null);
            setFilter('IdentityStatus', tableFilters.identity?.[0] || null);
          },
        }}
      />

      {selectedUser && (
        <>
          <UserIdentityModal
            open={identityModalOpen}
            onClose={handleCloseIdentityModal}
            userId={selectedUser.id}
            userName={selectedUser.name}
          />
          <RoleManagementModal
            open={roleModalOpen}
            onClose={handleCloseRoleModal}
            userId={selectedUser.id}
            userName={selectedUser.name}
            currentRoles={selectedUser.roles || []}
          />
        </>
      )}
    </div>
  );
};
