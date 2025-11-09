import React, { useState } from 'react';
import { Modal, Checkbox, Space, message, Button } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services';
import { RoleType, getRoleTypeName, getRoleTypeFromString } from '@/types/user.types';

interface RoleManagementModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentRoles: string[];
}

/**
 * RoleManagementModal Component
 * Modal for managing user roles (assign/unassign)
 */
export const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  open,
  onClose,
  userId,
  userName,
  currentRoles,
}) => {
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>(() => {
    // Initialize with current roles
    return currentRoles
      .map((role) => getRoleTypeFromString(role))
      .filter((role): role is RoleType => role !== null);
  });

  const { mutate: updateRole, isPending } = useMutation({
    mutationFn: userService.manageRole,
    onSuccess: () => {
      message.success('نقش کاربر با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'خطا در به‌روزرسانی نقش کاربر');
    },
  });

  const handleRoleChange = (roleType: RoleType, checked: boolean) => {
    // Update UI immediately
    if (checked) {
      setSelectedRoles([...selectedRoles, roleType]);
    } else {
      setSelectedRoles(selectedRoles.filter((r) => r !== roleType));
    }

    // Call API
    updateRole({
      userId,
      roleType,
      isAssign: checked,
    });
  };

  const handleClose = () => {
    onClose();
    // Reset to current roles when closing
    setTimeout(() => {
      const currentRoleTypes = currentRoles
        .map((role) => getRoleTypeFromString(role))
        .filter((role): role is RoleType => role !== null);
      setSelectedRoles(currentRoleTypes);
    }, 300);
  };

  const allRoles = [
    RoleType.SuperAdmin,
    RoleType.Instructor,
    RoleType.Student,
    RoleType.Operator,
    RoleType.OperatorAdmin,
  ];

  return (
    <Modal
      title={
        <div className="text-lg font-semibold">
          مدیریت نقش‌های {userName}
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          بستن
        </Button>,
      ]}
      width={500}
      centered
    >
      <div className="py-4">
        <p className="text-gray-600 mb-4">نقش‌های کاربر را انتخاب کنید:</p>
        <Space direction="vertical" size="middle" className="w-full">
          {allRoles.map((role) => (
            <div
              key={role}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-base">{getRoleTypeName(role)}</span>
              <Checkbox
                checked={selectedRoles.includes(role)}
                onChange={(e) => handleRoleChange(role, e.target.checked)}
                disabled={isPending}
              />
            </div>
          ))}
        </Space>
      </div>
    </Modal>
  );
};
