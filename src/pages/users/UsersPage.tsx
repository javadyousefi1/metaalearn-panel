import { Button, Table, Space, Tag } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PageHeader, PermissionGuard } from '@/components/common';
import { Permission, UserRole } from '@/types';
import { ROUTES } from '@/constants';
import { useNavigate } from 'react-router-dom';

/**
 * UsersPage Component
 */
export const UsersPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const mockUsers = [
    {
      id: '1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.ADMIN,
      status: 'active',
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.TEACHER,
      status: 'active',
    },
  ];

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: unknown, record: typeof mockUsers[0]) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => {
        const colors: Record<UserRole, string> = {
          [UserRole.SUPER_ADMIN]: 'red',
          [UserRole.ADMIN]: 'blue',
          [UserRole.TEACHER]: 'green',
          [UserRole.STUDENT]: 'default',
          [UserRole.MODERATOR]: 'orange',
        };
        return <Tag color={colors[role]}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: typeof mockUsers[0]) => (
        <Space>
          <PermissionGuard permissions={Permission.USER_UPDATE}>
            <Button
              type="link"
              icon={<Edit size={16} />}
              onClick={() => navigate(ROUTES.USERS.EDIT.replace(':id', record.id))}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions={Permission.USER_DELETE}>
            <Button type="link" danger icon={<Trash2 size={16} />}>
              Delete
            </Button>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users Management"
        extra={
          <PermissionGuard permissions={Permission.USER_CREATE}>
            <Button
              type="primary"
              icon={<Plus size={18} />}
              onClick={() => navigate(ROUTES.USERS.CREATE)}
            >
              Add User
            </Button>
          </PermissionGuard>
        }
      />

      <Table columns={columns} dataSource={mockUsers} rowKey="id" />
    </div>
  );
};
