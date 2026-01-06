import React, { useState, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Table,
  Switch,
  InputNumber,
  message,
} from 'antd';
import { Plus, Trash2, Save } from 'lucide-react';
import { useManagement, useTable, useGetAllUsers } from '@/hooks';
import { courseService } from '@/services';
import { Course } from '@/types/course.types';
import { RegisterUserToCourseDto } from '@/types/management.types';
import type { ColumnsType } from 'antd/es/table';

interface UserRow extends RegisterUserToCourseDto {
  key: string;
  isExistingUser?: boolean;
  userId?: string;
}

interface ManualEnrollmentModalProps {
  open: boolean;
  courseId?: string;
  onClose: () => void;
}

export const ManualEnrollmentModal: React.FC<ManualEnrollmentModalProps> = ({
  open,
  courseId: initialCourseId,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { registerUsersToCourse, isRegistering } = useManagement();
  const [selectedCourseId] = useState<string | undefined>(initialCourseId);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<{
    courseId: string;
    users: RegisterUserToCourseDto[];
  } | null>(null);

  const {
    data: courses,
  } = useTable<Course>({
    queryKey: 'courses',
    fetchFn: courseService.getAll,
    initialPageSize: 1000,
    initialPageIndex: 1,
  });

  const { data: usersResponse } = useGetAllUsers(
    {
      PageIndex: 1,
      PageSize: 10000,
      IncludeProfile: false,
      IncludeIdentity: false,
    },
    true
  );

  const allUsers = usersResponse?.items || [];

  const filteredUsers = useMemo(
    () =>
      allUsers.filter(
        (user) =>
          user.phoneNumber?.includes(searchValue) ||
          user.fullNameFa?.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [allUsers, searchValue]
  );

  const getPaymentDefaults = () => {
    if (!selectedCourseId) {
      return { isFullyPayment: false, paidInstallmentSteps: undefined };
    }

    const selectedCourse = courses?.find((c) => c.id === selectedCourseId);
    if (!selectedCourse) {
      return { isFullyPayment: false, paidInstallmentSteps: undefined };
    }

    const supportsInstallment = 
      selectedCourse.supportsInstallment === true && 
      selectedCourse.installmentType !== undefined && 
      selectedCourse.installmentType !== 0;

    if (supportsInstallment) {
      return {
        isFullyPayment: false,
        paidInstallmentSteps: selectedCourse.minimumInstallmentToPay || 0,
      };
    } else {
      return {
        isFullyPayment: true,
        paidInstallmentSteps: undefined,
      };
    }
  };

  const handleAddExistingUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;

    if (users.some((u) => u.userId === userId)) {
      return;
    }

    const paymentDefaults = getPaymentDefaults();

    const newUser: UserRow = {
      key: `existing-${userId}`,
      phoneNumber: user.phoneNumber || '',
      firstNameFa: user.fullNameFa?.split(' ')[0] || '',
      lastNameFa: user.fullNameFa?.split(' ').slice(1).join(' ') || '',
      isFullyPayment: paymentDefaults.isFullyPayment,
      paidInstallmentSteps: paymentDefaults.paidInstallmentSteps,
      isExistingUser: true,
      userId: userId,
    };

    setUsers([...users, newUser]);
    setSearchValue('');
  };

  const handleAddNewUser = () => {
    const paymentDefaults = getPaymentDefaults();

    const newUser: UserRow = {
      key: `new-${Date.now()}`,
      phoneNumber: '',
      firstNameFa: '',
      lastNameFa: '',
      isFullyPayment: paymentDefaults.isFullyPayment,
      paidInstallmentSteps: paymentDefaults.paidInstallmentSteps,
      isExistingUser: false,
    };

    setUsers([...users, newUser]);
  };

  const handleRemoveUser = (key: string) => {
    setUsers(users.filter((u) => u.key !== key));
  };

  const handleUserFieldChange = (key: string, field: keyof UserRow, value: unknown) => {
    setUsers(
      users.map((u) => {
        if (u.key === key) {
          const updated = { ...u, [field]: value };
          if (field === 'isFullyPayment' && value === true) {
            updated.paidInstallmentSteps = undefined;
          }
          return updated;
        }
        return u;
      })
    );
  };

  const validateUsers = (): string | null => {
    if (!selectedCourseId) {
      return 'لطفاً دوره را انتخاب کنید';
    }

    if (users.length === 0) {
      return 'لطفاً حداقل یک کاربر اضافه کنید';
    }

    const invalidUsers = users.filter(
      (u) => !u.phoneNumber || !u.firstNameFa || !u.lastNameFa
    );

    if (invalidUsers.length > 0) {
      return 'لطفاً اطلاعات کامل تمام کاربران را وارد کنید';
    }

    const invalidPayment = users.filter(
      (u) =>
        u.isFullyPayment === false &&
        (u.paidInstallmentSteps === undefined || u.paidInstallmentSteps < 0)
    );

    if (invalidPayment.length > 0) {
      return 'برای کاربرانی که پرداخت کامل نیست، تعداد مراحل پرداخت را مشخص کنید';
    }

    return null;
  };

  const prepareUsersData = (): RegisterUserToCourseDto[] => {
    return users.map((u) => {
      const userData: RegisterUserToCourseDto = {
        phoneNumber: u.phoneNumber,
        firstNameFa: u.firstNameFa,
        lastNameFa: u.lastNameFa,
        isFullyPayment: u.isFullyPayment || undefined,
      };

      if (u.isFullyPayment === false && u.paidInstallmentSteps !== undefined) {
        userData.paidInstallmentSteps = u.paidInstallmentSteps;
      }

      return userData;
    });
  };

  const handleSubmit = async () => {
    const validationError = validateUsers();
    if (validationError) {
      message.error(validationError);
      return;
    }

    const usersData = prepareUsersData();
    setFormValues({
      courseId: selectedCourseId!,
      users: usersData,
    });
    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!formValues) return;

    try {
      await registerUsersToCourse({
        courseId: formValues.courseId,
        users: formValues.users,
      });

      setUsers([]);
      setFormValues(null);
      form.resetFields();
      setConfirmModalOpen(false);
      onClose();
    } catch (error) {
      console.error('Error registering users:', error);
    }
  };

  const getCourseName = (courseId?: string) => {
    if (!courseId) return '-';
    return courses?.find((c) => c.id === courseId)?.name || '-';
  };

  const handleClose = () => {
    setUsers([]);
    setSearchValue('');
    setFormValues(null);
    form.resetFields();
    setConfirmModalOpen(false);
    onClose();
  };

  const columns: ColumnsType<UserRow> = [
    {
      title: 'شماره تماس',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 150,
      render: (_: unknown, record: UserRow) => (
        <Input
          value={record.phoneNumber}
          onChange={(e) =>
            handleUserFieldChange(record.key, 'phoneNumber', e.target.value)
          }
          placeholder="شماره تماس"
        />
      ),
    },
    {
      title: 'نام',
      dataIndex: 'firstNameFa',
      key: 'firstNameFa',
      width: 150,
      render: (_: unknown, record: UserRow) => (
        <Input
          value={record.firstNameFa}
          onChange={(e) =>
            handleUserFieldChange(record.key, 'firstNameFa', e.target.value)
          }
          placeholder="نام"
        />
      ),
    },
    {
      title: 'نام خانوادگی',
      dataIndex: 'lastNameFa',
      key: 'lastNameFa',
      width: 150,
      render: (_: unknown, record: UserRow) => (
        <Input
          value={record.lastNameFa}
          onChange={(e) =>
            handleUserFieldChange(record.key, 'lastNameFa', e.target.value)
          }
          placeholder="نام خانوادگی"
        />
      ),
    },
    {
      title: 'پرداخت کامل',
      dataIndex: 'isFullyPayment',
      key: 'isFullyPayment',
      width: 120,
      render: (_: unknown, record: UserRow) => (
        <Switch
          checked={record.isFullyPayment || false}
          onChange={(checked) =>
            handleUserFieldChange(record.key, 'isFullyPayment', checked)
          }
          checkedChildren="بله"
          unCheckedChildren="خیر"
        />
      ),
    },
    {
      title: 'مراحل پرداخت شده',
      dataIndex: 'paidInstallmentSteps',
      key: 'paidInstallmentSteps',
      width: 150,
      render: (_: unknown, record: UserRow) => (
        <InputNumber
          value={record.paidInstallmentSteps}
          onChange={(value) =>
            handleUserFieldChange(record.key, 'paidInstallmentSteps', value || undefined)
          }
          placeholder="تعداد مراحل"
          min={0}
          disabled={record.isFullyPayment === true}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'عملیات',
      key: 'action',
      width: 100,
      render: (_: unknown, record: UserRow) => (
        <Button
          type="text"
          danger
          icon={<Trash2 size={16} />}
          onClick={() => handleRemoveUser(record.key)}
        />
      ),
    },
  ];

  return (
    <>
      <Modal
        title="ثبت نام دستی"
        open={open}
        onCancel={handleClose}
        width={1200}
        footer={null}
        destroyOnClose
      >
        <div className="min-h-[60vh]">
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">جستجو و افزودن کاربر</span>
                <Space.Compact style={{ width: 400 }}>
                  <Select
                    showSearch
                    placeholder="جستجو کاربر (شماره تماس یا نام)"
                    value={undefined}
                    searchValue={searchValue}
                    onSearch={setSearchValue}
                    onChange={handleAddExistingUser}
                    filterOption={false}
                    size="large"
                    style={{ width: '100%' }}
                    className="shadow-sm"
                    allowClear
                    open={searchValue.length > 0 || undefined}
                    options={filteredUsers.slice(0, 10).map((user) => ({
                      label: `${user.fullNameFa || 'بدون نام'} - ${user.phoneNumber || 'بدون شماره'}`,
                      value: user.id,
                    }))}
                    dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                    notFoundContent={
                      searchValue ? (
                        <div className="p-4 text-center">
                          <p>کاربری یافت نشد</p>
                          <Button
                            type="link"
                            icon={<Plus size={16} />}
                            onClick={handleAddNewUser}
                          >
                            افزودن کاربر جدید
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-400">
                          برای جستجو شروع به تایپ کنید
                        </div>
                      )
                    }
                  />
                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={handleAddNewUser}
                    size="large"
                    style={{ flexShrink: 0 }}
                  >
                    افزودن
                  </Button>
                </Space.Compact>
              </div>
            </div>
          </div>

          <Form form={form} layout="vertical" size="large" requiredMark={false}>
            <Form.Item label="لیست کاربران">
              <Table
                dataSource={users}
                columns={columns}
                pagination={false}
                scroll={{ x: 800 }}
                size="small"
                locale={{
                  emptyText: 'هیچ کاربری اضافه نشده است. از بالا کاربران را اضافه کنید.',
                }}
              />
            </Form.Item>

            <Form.Item>
              <div className="flex justify-end">
                <Button
                  type="primary"
                  size="large"
                  icon={<Save size={18} />}
                  onClick={handleSubmit}
                  loading={isRegistering}
                >
                  ثبت‌نام کاربران
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Modal
        title="تأیید ثبت‌نام"
        open={confirmModalOpen}
        onOk={handleConfirm}
        onCancel={() => setConfirmModalOpen(false)}
        okText="تأیید و ثبت‌نام"
        cancelText="انصراف"
        confirmLoading={isRegistering}
        width={600}
        centered
      >
        <div className="py-4">
          <p className="mb-4 text-gray-600">
            لطفاً اطلاعات ثبت‌نام را بررسی کنید و سپس تأیید نمایید:
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-semibold text-gray-700">دوره:</span>
                <p className="text-gray-900 mt-1">{getCourseName(formValues?.courseId)}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">تعداد کاربران:</span>
                <p className="text-gray-900 mt-1">{formValues?.users.length || 0} کاربر</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
