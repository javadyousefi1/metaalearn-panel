import React, { useState } from 'react';
import { Avatar, Button, Tag, Tooltip } from 'antd';
import { Home, Award, UserCircle, Settings2 } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable, useTableFilters, useCertificates } from '@/hooks';
import { certificateService } from '@/services';
import {
  CertificateListItem,
  UpdateCertificatePayload,
  getCertificateStatusName,
  getCertificateStatusColor,
} from '@/types/certificate.types';
import { formatDate } from '@/utils';
import { CertificateUpdateModal } from './CertificateUpdateModal';

export const CertificatesPage: React.FC = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateListItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { updateCertificate, isUpdating } = useCertificates();
  const { filters, handleTableChange } = useTableFilters({});

  const {
    data: certificates,
    totalCount,
    isLoading,
    pagination,
  } = useTable<CertificateListItem>({
    queryKey: ['certificates', filters],
    fetchFn: (params) => certificateService.getAll(params),
    initialPageSize: 10,
    initialPageIndex: 1,
    filters,
  });

  const handleOpenModal = (record: CertificateListItem) => {
    setSelectedCertificate(record);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCertificate(null);
  };

  const handleSubmit = async (payload: UpdateCertificatePayload) => {
    await updateCertificate(payload);
  };

  const columns: ColumnsType<CertificateListItem> = [
    {
      title: 'کاربر',
      dataIndex: 'user',
      key: 'user',
      width: 200,
      render: (user: CertificateListItem['user']) => (
        <div className="flex items-center gap-2">
          {user.imageUrl ? (
            <Avatar size={32} src={user.imageUrl} />
          ) : (
            <Avatar size={32} icon={<UserCircle />} style={{ backgroundColor: '#4B26AD' }} />
          )}
          <div className="flex flex-col">
            <span className="font-medium">{user.fullNameFa || 'بدون نام'}</span>
            <span className="text-xs text-gray-400">{user.phoneNumber}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'دوره',
      dataIndex: 'course',
      key: 'course',
      width: 200,
      render: (course: CertificateListItem['course']) => (
        <div className="flex items-center gap-2">
          {course.imageUrl && (
            <Avatar size={32} src={course.imageUrl} shape="square" />
          )}
          <span>{course.name}</span>
        </div>
      ),
    },
    {
      title: 'وضعیت',
      dataIndex: 'statusType',
      key: 'statusType',
      width: 120,
      align: 'center',
      render: (statusType: number) => (
        <Tag color={getCertificateStatusColor(statusType)}>
          {getCertificateStatusName(statusType)}
        </Tag>
      ),
    },
    {
      title: 'تاریخ درخواست',
      dataIndex: 'requestedTime',
      key: 'requestedTime',
      width: 150,
      render: (requestedTime: string) => (
        <span className="text-sm">{formatDate(requestedTime)}</span>
      ),
    },
    {
      title: 'تاریخ تایید',
      dataIndex: 'verifiedTime',
      key: 'verifiedTime',
      width: 150,
      render: (verifiedTime: string | null) => (
        <span className="text-sm">{verifiedTime ? formatDate(verifiedTime) : '—'}</span>
      ),
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 150,
      render: (createdTime: string) => (
        <span className="text-sm">{formatDate(createdTime)}</span>
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 90,
      align: 'center',
      render: (_: unknown, record: CertificateListItem) => (
        <Tooltip title="بروزرسانی وضعیت">
          <Button
            type="text"
            icon={<Settings2 size={16} />}
            onClick={() => handleOpenModal(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="لیست درخواست‌های مدرک"
        description="مشاهده و مدیریت درخواست‌های مدرک کاربران"
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
            title: (
              <span className="flex items-center gap-2">
                <Award size={16} />
                مدرک
              </span>
            ),
          },
        ]}
      />

      <DataTable<CertificateListItem>
        columns={columns}
        dataSource={certificates}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ درخواست مدرکی یافت نشد"
        itemName="درخواست"
        tableProps={{
          onChange: handleTableChange({}),
        }}
      />

      <CertificateUpdateModal
        open={modalOpen}
        certificate={selectedCertificate}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        loading={isUpdating}
      />
    </div>
  );
};
