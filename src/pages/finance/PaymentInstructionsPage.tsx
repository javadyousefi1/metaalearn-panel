import React, { useState } from 'react';
import { Tag, Button, Tooltip, Modal, Space } from 'antd';
import { Home, Plus, Edit2, Trash2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable, useTableFilters } from '@/hooks';
import { usePaymentInstructions } from '@/hooks/usePaymentInstructions';
import { paymentInstructionService } from '@/services/paymentInstruction.service';
import { formatDate } from '@/utils';
import type { PaymentInstruction } from '@/types/paymentInstruction.types';
import { formatCardNumber, formatShaba } from '@/types/paymentInstruction.types';
import { PaymentInstructionModal } from './PaymentInstructionModal';

/**
 * PaymentInstructionsPage Component - Display and manage payment cards
 */
export const PaymentInstructionsPage: React.FC = () => {
  const { filters, handleTableChange } = useTableFilters();
  const { deletePaymentInstruction, isDeleting } = usePaymentInstructions();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<PaymentInstruction | null>(null);

  const {
    data: instructions,
    totalCount,
    isLoading,
    pagination,
  } = useTable<PaymentInstruction>({
    queryKey: ['paymentInstructions'],
    fetchFn: (params) =>
      paymentInstructionService.getAll({
        PageIndex: params.PageIndex,
        PageSize: params.PageSize,
      }),
    initialPageSize: 10,
    initialPageIndex: 1,
    filters,
  });

  const handleOpenCreateModal = () => {
    setSelectedInstruction(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (instruction: PaymentInstruction) => {
    setSelectedInstruction(instruction);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInstruction(null);
  };

  const handleDelete = (instruction: PaymentInstruction) => {
    Modal.confirm({
      title: 'حذف کارت',
      content: (
        <div style={{ fontFamily: 'IRANYekanX!important' }}>
          <p>آیا از حذف این کارت اطمینان دارید؟</p>
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <div className="text-sm">
              <div className="mb-1">
                <strong>صاحب کارت:</strong> {instruction.ownerName}
              </div>
              <div className="mb-1">
                <strong>بانک:</strong> {instruction.bankName}
              </div>
              <div>
                <strong>شماره کارت:</strong> {formatCardNumber(instruction.cardNumber)}
              </div>
            </div>
          </div>
        </div>
      ),
      okText: 'بله، حذف شود',
      okType: 'danger',
      cancelText: 'انصراف',
      onOk: async () => {
        await deletePaymentInstruction({ id: instruction.id });
      },
    });
  };

  const columns: ColumnsType<PaymentInstruction> = [
    {
      title: 'صاحب کارت',
      dataIndex: 'ownerName',
      key: 'ownerName',
      width: 150,
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-gray-400" />
          <span className="font-medium text-sm">{name}</span>
        </div>
      ),
    },
    {
      title: 'نام بانک',
      dataIndex: 'bankName',
      key: 'bankName',
      width: 120,
      align: 'center',
      render: (bankName: string) => (
        <Tag color="blue" className="text-sm">
          {bankName}
        </Tag>
      ),
    },
    {
      title: 'شماره کارت',
      dataIndex: 'cardNumber',
      key: 'cardNumber',
      width: 200,
      render: (cardNumber: string) => (
        <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded whitespace-nowrap " dir={"ltr"}>
          {(cardNumber)}
        </span>
      ),
    },
    {
      title: 'شماره شبا',
      dataIndex: 'shaba',
      key: 'shaba',
      width: 280,
      render: (shaba: string) => (
        <span className="font-mono text-xs bg-gray-100 px-3 py-1 rounded whitespace-nowrap " dir={"ltr"}>
          {(shaba)}
        </span>
      ),
    },
    {
      title: 'تاریخ انقضا',
      dataIndex: 'cardExpireTime',
      key: 'cardExpireTime',
      width: 150,
      render: (date: string | null) => {
        if (!date) return <span className="text-gray-400 text-xs">-</span>;
        return <div className="text-sm text-gray-600">{formatDate(date)}</div>;
      },
    },
    {
      title: 'وضعیت',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive?: boolean) => {
        // Default to true if undefined
        const active = isActive ?? true;
        return active ? (
          <Tag color="green">
            فعال
          </Tag>
        ) : (
          <Tag color="default">
            غیرفعال
          </Tag>
        );
      },
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 150,
      render: (date: string | null) => {
        if (!date) return <span className="text-gray-400 text-xs">-</span>;
        return <div className="text-sm text-gray-600">{formatDate(date)}</div>;
      },
    },
    {
      title: 'عملیات',
      key: 'actions',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_: any, instruction: PaymentInstruction) => (
        <Space size="small">
          <Tooltip title="ویرایش">
            <Button
              type="text"
              icon={<Edit2 size={16} />}
              onClick={() => handleOpenEditModal(instruction)}
              className="hover:text-blue-600"
            />
          </Tooltip>
          <Tooltip title="حذف">
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              onClick={() => handleDelete(instruction)}
              loading={isDeleting}
              className="hover:text-red-600"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="کارت ها"
        description="مدیریت کارت‌های بانکی برای دریافت پرداخت"
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
            title: 'کارت ها',
          },
        ]}
        actions={
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={handleOpenCreateModal}
            size="large"
          >
            افزودن کارت جدید
          </Button>
        }
      />

      <DataTable
        columns={columns}
        dataSource={instructions}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ کارتی یافت نشد"
        itemName="کارت"
        tableProps={{
          onChange: handleTableChange({}),
        }}
      />

      <PaymentInstructionModal
        open={modalOpen}
        paymentInstruction={selectedInstruction}
        onClose={handleCloseModal}
      />
    </div>
  );
};
