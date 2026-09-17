import React, { useState } from 'react';
import { Avatar, Button, Input, Select, Tag, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Home, Award, UserCircle, Settings2 } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable, useTableFilters, useCertificates } from '@/hooks';
import { certificateService, courseService } from '@/services';
import { Course } from '@/types/course.types';
import {
  CertificateListItem,
  CertificateStatusType,
  CertificateTemplateType,
  UpdateCertificatePayload,
  getCertificateStatusName,
  getCertificateStatusColor,
  getCertificateTemplateName,
} from '@/types/certificate.types';
import { formatDate } from '@/utils';
import { CertificateUpdateModal } from './CertificateUpdateModal';

export const CertificatesPage: React.FC = () => {
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateListItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { updateCertificate, isUpdating } = useCertificates();
  const { filters, handleTableChange } = useTableFilters({});

  const { data: courses = [], isLoading: isLoadingCourses } = useTable<Course>({
    queryKey: 'certificate-course-filter',
    fetchFn: courseService.getAll,
    initialPageSize: 1000,
    initialPageIndex: 1,
  });

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
      key: 'fullName',
      width: 200,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="جستجوی نام کاربر"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
              جستجو
            </Button>
            <Button
              onClick={() => {
                clearFilters?.();
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              پاک کردن
            </Button>
          </div>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#4B26AD' : undefined }} />
      ),
      filteredValue: filters.FullName ? [filters.FullName as string] : null,
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
      key: 'courseId',
      width: 200,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8, width: 240 }}>
          <Select
            showSearch
            allowClear
            placeholder="انتخاب دوره"
            style={{ width: '100%', marginBottom: 8 }}
            value={selectedKeys[0]}
            loading={isLoadingCourses}
            onChange={(value) => setSelectedKeys(value ? [value] : [])}
            filterOption={(input, option) =>
              (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={courses.map((course) => ({
              value: course.id,
              label: course.name,
            }))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
              جستجو
            </Button>
            <Button
              onClick={() => {
                clearFilters?.();
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              پاک کردن
            </Button>
          </div>
        </div>
      ),
      filteredValue: filters.CourseId ? [filters.CourseId as string] : null,
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
      filters: [
        {
          text: getCertificateStatusName(CertificateStatusType.Requested),
          value: CertificateStatusType.Requested,
        },
        {
          text: getCertificateStatusName(CertificateStatusType.Verified),
          value: CertificateStatusType.Verified,
        },
        {
          text: getCertificateStatusName(CertificateStatusType.Rejected),
          value: CertificateStatusType.Rejected,
        },
        {
          text: getCertificateStatusName(CertificateStatusType.Revoked),
          value: CertificateStatusType.Revoked,
        },
      ],
      filterMultiple: false,
      filteredValue:
        filters.StatusType != null ? [filters.StatusType as number] : null,
      render: (statusType: number) => (
        <Tag color={getCertificateStatusColor(statusType)}>
          {getCertificateStatusName(statusType)}
        </Tag>
      ),
    },
    {
      title: 'قالب',
      dataIndex: 'templateType',
      key: 'templateType',
      width: 100,
      align: 'center',
      filters: [
        {
          text: getCertificateTemplateName(CertificateTemplateType.Package),
          value: CertificateTemplateType.Package,
        },
        {
          text: getCertificateTemplateName(CertificateTemplateType.Normal),
          value: CertificateTemplateType.Normal,
        },
      ],
      filterMultiple: false,
      filteredValue:
        filters.TemplateType != null ? [filters.TemplateType as number] : null,
      render: (templateType: number | undefined) =>
        templateType === CertificateTemplateType.Package ||
        templateType === CertificateTemplateType.Normal ? (
          <Tag color={templateType === CertificateTemplateType.Package ? 'purple' : 'default'}>
            {getCertificateTemplateName(templateType)}
          </Tag>
        ) : (
          <span className="text-gray-400">—</span>
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
          onChange: handleTableChange({
            fullName: 'FullName',
            courseId: 'CourseId',
            statusType: 'StatusType',
            templateType: 'TemplateType',
          }),
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
