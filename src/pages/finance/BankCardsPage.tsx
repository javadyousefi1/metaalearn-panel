import React, { useState } from 'react';
import { Tag, Avatar, Tooltip, Badge } from 'antd';
import { Home, UserCircle, Eye } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable, useTableFilters } from '@/hooks';
import { userService } from '@/services';
import { UserListItem, CreditCardIdentityStatusType, getCreditCardStatusName, getCreditCardStatusColor } from '@/types/user.types';
import { formatDate } from "@/utils";
import { UserCreditCardsModal } from './UserCreditCardsModal';

/**
 * BankCardsPage Component - Display users with pending credit cards for admin approval
 */
export const BankCardsPage: React.FC = () => {
  const [cardsModalOpen, setCardsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  // Initialize filters
  const {
    filters,
    clearFilters,
    handleTableChange,
  } = useTableFilters();

  const {
    data: users,
    totalCount,
    isLoading,
    pagination,
  } = useTable<UserListItem>({
    queryKey: 'credit-cards',
    fetchFn: (params) => userService.getAll({
      ...params,
      IncludeProfile: true,
      IncludeCreditCards: true,
      CreditCardStatus: filters.CreditCardStatus as CreditCardIdentityStatusType || CreditCardIdentityStatusType.Pending,
    }),
    initialPageSize: 10,
    initialPageIndex: 1,
    filters,
  });

  const handleOpenCardsModal = (user: UserListItem) => {
    setSelectedUser(user);
    setCardsModalOpen(true);
  };

  const handleCloseCardsModal = () => {
    setCardsModalOpen(false);
    setSelectedUser(null);
  };

  // Filter users who have credit cards with the selected status
  const filteredUsers = React.useMemo(() => {
    const filterStatus = (filters.CreditCardStatus as CreditCardIdentityStatusType) ?? CreditCardIdentityStatusType.Pending;

    return users?.filter((user) => {
      if (!user.creditCards || user.creditCards.length === 0) return false;

      return user.creditCards.some((card) => card.identityStatusType === filterStatus);
    }) || [];
  }, [users, filters.CreditCardStatus]);

  // Helper to count cards by status for a user
  const getCardCountByStatus = (user: UserListItem, status: CreditCardIdentityStatusType): number => {
    if (!user.creditCards) return 0;
    return user.creditCards.filter((card) => card.identityStatusType === status).length;
  };

  const columns: ColumnsType<UserListItem> = [
    {
      title: 'کاربر',
      key: 'user',
      width: 250,
      render: (_: any, user: UserListItem) => (
        <div className="flex items-center gap-3">
          {user.imageUrl ? (
            <Avatar size={40} src={user.imageUrl} />
          ) : (
            <Avatar size={40} icon={<UserCircle />} style={{ backgroundColor: '#4B26AD' }} />
          )}
          <div>
            <div className="font-medium text-base">{user.fullNameFa || 'بدون نام'}</div>
            <div className="text-xs text-gray-500">{user.phoneNumber}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'تعداد کارت‌ها',
      key: 'cardCount',
      align: 'center',
      width: 150,
      render: (_: any, user: UserListItem) => {
        const filterStatus = (filters.CreditCardStatus as CreditCardIdentityStatusType) ?? CreditCardIdentityStatusType.Pending;
        const count = getCardCountByStatus(user, filterStatus);
        const statusName = getCreditCardStatusName(filterStatus);

        return (
          <Badge
            count={count}
            showZero
            color={getCreditCardStatusColor(filterStatus)}
            style={{ marginLeft: 8 }}
          >
            <span className="text-sm text-gray-600 ml-4">{statusName}</span>
          </Badge>
        );
      },
    },
    {
      title: 'وضعیت حساب',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'فعال' : 'غیرفعال'}
        </Tag>
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      align: 'center',
      width: 120,
      fixed: 'right',
      render: (_: any, user: UserListItem) => (
        <div className="flex items-center justify-center gap-3">
          <Tooltip title="مشاهده و تایید کارت‌ها">
            <button
              onClick={() => handleOpenCardsModal(user)}
              className="hover:text-primary transition-colors"
            >
              <Eye size={20} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="کارت‌های بانکی در انتظار تایید"
        description="مشاهده و مدیریت کارت‌های بانکی که منتظر تایید ادمین هستند"
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
            title: 'کارت‌های بانکی',
          },
        ]}
      />

      <DataTable
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={isLoading}
        totalCount={filteredUsers.length}
        pagination={pagination}
        emptyText="هیچ کاربری با کارت بانکی در این وضعیت یافت نشد"
        itemName="کاربر"
        tableProps={{
          onChange: handleTableChange({
            cardStatusFilter: 'CreditCardStatus',
          }),
        }}
      />

      {selectedUser && (
        <UserCreditCardsModal
          open={cardsModalOpen}
          onClose={handleCloseCardsModal}
          user={selectedUser}
        />
      )}
    </div>
  );
};
