import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Empty,
  Button,
  Collapse,
  Popconfirm,
  Space,
  Tag,
  Avatar,
  Descriptions,
  Modal,
  Select,
  Radio,
  Input,
  Switch,
} from 'antd';
import { Users, Plus, Trash2, Edit, Eye, EyeOff, Link, Ban } from 'lucide-react';
import { useGetAllSchedules, useCourseSchedules, useGetPurchasedCourseUsers, useManagement } from '@/hooks';
import { CourseScheduleStatus } from '@/enums';
import { CourseScheduleModal } from './CourseScheduleModal';
import type { CourseSchedule } from '@/types';

type SyncMode = 'all' | 'selected';

export const CourseSchedulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CourseSchedule | null>(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollSchedule, setEnrollSchedule] = useState<CourseSchedule | null>(null);
  const [syncMode, setSyncMode] = useState<SyncMode>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockSchedule, setBlockSchedule] = useState<CourseSchedule | null>(null);
  const [isRestrictedByAdmin, setIsRestrictedByAdmin] = useState(false);
  const [restrictedByAdminMessage, setRestrictedByAdminMessage] = useState('');

  const { data: schedules = [], refetch, isLoading } = useGetAllSchedules(
    id ? { CourseId: id, PageIndex: 1, PageSize: 100 } : undefined
  );
  const {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCourseSchedules();
  const { syncCourseSessionEnrollments, isSyncingCourseSessionEnrollments } = useManagement();

  const { data: purchasedStudents = [] } = useGetPurchasedCourseUsers(
    {
      CourseId: id || '',
      PageIndex: 1,
      PageSize: 10000,
    },
    !!id && enrollModalOpen && syncMode === 'selected'
  );

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setModalOpen(true);
  };

  const handleEditSchedule = (schedule: CourseSchedule) => {
    setEditingSchedule(schedule);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSchedule(null);
  };

  const handleOpenEnrollModal = (schedule: CourseSchedule) => {
    setEnrollSchedule(schedule);
    setSyncMode('all');
    setSelectedStudentIds([]);
    setEnrollModalOpen(true);
  };

  const handleCloseEnrollModal = () => {
    setEnrollModalOpen(false);
    setEnrollSchedule(null);
    setSyncMode('all');
    setSelectedStudentIds([]);
  };

  const handleOpenBlockModal = (schedule: CourseSchedule) => {
    setBlockSchedule(schedule);
    setIsRestrictedByAdmin(!!schedule.isRestrictedByAdmin);
    setRestrictedByAdminMessage(schedule.restrictedByAdminMessage || '');
    setBlockModalOpen(true);
  };

  const handleCloseBlockModal = () => {
    setBlockModalOpen(false);
    setBlockSchedule(null);
    setIsRestrictedByAdmin(false);
    setRestrictedByAdminMessage('');
  };

  const handleSaveVideoBlock = async () => {
    if (!id || !blockSchedule) return;
    if (isRestrictedByAdmin && !restrictedByAdminMessage.trim()) return;

    await updateSchedule({
      id: blockSchedule.id,
      courseId: id,
      isRestrictedByAdmin,
      restrictedByAdminMessage: isRestrictedByAdmin ? restrictedByAdminMessage.trim() : null,
    });

    await refetch();
    handleCloseBlockModal();
  };

  const handleSyncEnrollments = async () => {
    if (!enrollSchedule) return;
    if (syncMode === 'selected' && selectedStudentIds.length === 0) return;

    await syncCourseSessionEnrollments({
      scheduleId: enrollSchedule.id,
      syncAllStudents: syncMode === 'all',
      ...(syncMode === 'selected' ? { studentIds: selectedStudentIds } : {}),
    });

    await refetch();
    handleCloseEnrollModal();
  };

  const handleSubmitSchedule = async (values: any) => {
    if (!id) return;

    if (editingSchedule) {
      await updateSchedule({
        id: editingSchedule.id,
        courseId: id,
        name: values.name,
        description: values.description,
        onlineMeetingUrl: values.onlineMeetingUrl || null,
        isVisible: values.isVisible,
        status: values.status,
        instructorIds: values.instructorIds,
        operatorIds: values.operatorIds,
        studentIds: values.studentIds,
        ...(values.typeId === 1 ? {} : { typeId: values.typeId || null }),
      });
    } else {
      await createSchedule({
        courseId: id,
        name: values.name,
        description: values.description,
        onlineMeetingUrl: values.onlineMeetingUrl || null,
        isVisible: values.isVisible,
        status: values.status,
        typeId: values.typeId,
        instructorIds: values.instructorIds,
        operatorIds: values.operatorIds,
        studentIds: values.studentIds,
      });
    }

    await refetch();
    handleModalClose();
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    await deleteSchedule(scheduleId);
    await refetch();
  };

  const renderUserList = (users: any[], emptyText: string) => {
    if (!users || users.length === 0) {
      return <span className="text-gray-400 text-sm">{emptyText}</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1 border border-gray-200"
          >
            {user.imageUrl ? (
              <Avatar size="small" src={user.imageUrl} />
            ) : (
              <Avatar size="small" style={{ backgroundColor: '#4B26AD' }}>
                {user.fullNameFa?.charAt(0) || '؟'}
              </Avatar>
            )}
            <span className="text-sm">{user.fullNameFa}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderScheduleDetails = (schedule: CourseSchedule) => (
    <div className="space-y-4">
      <Descriptions column={1} size="small">
        <Descriptions.Item label="نام گروه‌بندی">
          <span className="font-semibold">{schedule.name}</span>
        </Descriptions.Item>
        <Descriptions.Item label="توضیحات">
          {schedule.description || 'بدون توضیحات'}
        </Descriptions.Item>
        {schedule.onlineMeetingUrl && (
          <Descriptions.Item label="لینک جلسه آنلاین">
            <a href={schedule.onlineMeetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              <Space>
                <Link size={16} />
                {schedule.onlineMeetingUrl}
              </Space>
            </a>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="شناسه نوع">
          <Tag color="purple">{schedule.typeId ?? 0}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="وضعیت">
          <Space direction="horizontal" size="small" wrap>
            {schedule.isVisible ? (
              <Tag icon={<Eye size={14} />} color="green">قابل مشاهده</Tag>
            ) : (
              <Tag icon={<EyeOff size={14} />} color="default">مخفی</Tag>
            )}
            <Tag color={schedule.status === 0 ? 'blue' : schedule.status === 1 ? 'orange' : 'green'}>
              {CourseScheduleStatus[schedule.status as keyof typeof CourseScheduleStatus] || `وضعیت ${schedule.status}`}
            </Tag>
            {schedule.isRestrictedByAdmin && (
              <Tag icon={<Ban size={14} />} color="red">ویدیو مسدود</Tag>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="مدیریت گروه‌بندی">
          <Space size="small">
            {/* tmp: همگام‌سازی disabled until this flow is re-enabled */}
            <Button
              size="small"
              disabled
              className="select-none"
              onClick={() => handleOpenEnrollModal(schedule)}
            >
              همگام‌سازی
            </Button>
            <Button
              size="small"
              danger={!!schedule.isRestrictedByAdmin}
              onClick={() => handleOpenBlockModal(schedule)}
            >
              مسدودسازی
            </Button>
          </Space>
        </Descriptions.Item>
      </Descriptions>

      <div className="space-y-3 pt-4 border-t">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Users size={16} className="text-primary" />
            اساتید ({schedule.instructors?.length || 0})
          </h4>
          {renderUserList(schedule.instructors, 'استادی تعیین نشده است')}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Users size={16} className="text-green-500" />
            اپراتورها ({schedule.operators?.length || 0})
          </h4>
          {renderUserList(schedule.operators, 'اپراتوری تعیین نشده است')}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Users size={16} className="text-purple-500" />
            دانشجویان ({schedule.students?.length || 0})
          </h4>
          {renderUserList(schedule.students, 'دانشجویی ثبت نشده است')}
        </div>
      </div>

      <div className="flex justify-end items-center pt-4 border-t">
        <Space>
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => handleEditSchedule(schedule)}
            loading={isUpdating}
          >
            ویرایش
          </Button>
          <Popconfirm
            title="حذف گروه‌بندی"
            description="آیا از حذف این گروه‌بندی اطمینان دارید؟"
            onConfirm={() => handleDeleteSchedule(schedule.id)}
            okText="بله، حذف شود"
            cancelText="انصراف"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              loading={isDeleting}
            >
              حذف
            </Button>
          </Popconfirm>
        </Space>
      </div>
    </div>
  );

  const collapseItems = schedules.map((schedule: CourseSchedule) => ({
    key: schedule.id,
    label: (
      <div className="flex items-center justify-between w-full pr-2">
        <Space>
          <span className="font-medium text-lg">{schedule.name}</span>
          <Tag color="blue">
            {(schedule.instructors?.length || 0) + (schedule.operators?.length || 0) + (schedule.students?.length || 0)} نفر
          </Tag>
          {!schedule.isVisible && (
            <Tag icon={<EyeOff size={12} />} color="default">مخفی</Tag>
          )}
          {schedule.isRestrictedByAdmin && (
            <Tag icon={<Ban size={12} />} color="red">ویدیو مسدود</Tag>
          )}
        </Space>
      </div>
    ),
    children: renderScheduleDetails(schedule),
  }));

  const studentSelectOptions = purchasedStudents.map((student: any) => ({
    label: student.fullNameFa,
    value: student.id,
  }));

  const canSubmit =
    syncMode === 'all'
      ? (enrollSchedule?.students?.length || 0) > 0
      : selectedStudentIds.length > 0;

  return (
    <div>
      <Card
        className="shadow-sm"
        extra={
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={handleAddSchedule}
            className="shadow-md hover:shadow-lg transition-all"
            loading={isCreating}
          >
            افزودن گروه‌بندی جدید
          </Button>
        }
        title={"گروه بندی دوره"}
        loading={isLoading}
      >
        {schedules.length > 0 ? (
          <Collapse
            items={collapseItems}
            defaultActiveKey={[schedules[0]?.id]}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Empty
              description={
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    گروه‌بندی دوره
                  </p>
                  <p className="text-gray-500">
                    شناسه دوره: {id}
                  </p>
                  <p className="text-gray-400 mt-2">
                    در حال حاضر گروه‌بندی ثبت نشده است
                  </p>
                </div>
              }
            />
          </div>
        )}
      </Card>

      <CourseScheduleModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmitSchedule}
        loading={isCreating || isUpdating}
        schedule={editingSchedule}
        courseId={id || ''}
      />

      <Modal
        title={
          enrollSchedule
            ? `همگام‌سازی — ${enrollSchedule.name}`
            : 'همگام‌سازی'
        }
        open={enrollModalOpen}
        onCancel={handleCloseEnrollModal}
        centered
        destroyOnClose
        footer={
          <div className="flex justify-center items-center gap-3">
            <Button
              type="primary"
              className="min-w-[148px]"
              onClick={handleSyncEnrollments}
              loading={isSyncingCourseSessionEnrollments}
              disabled={!canSubmit}
            >
              همگام‌سازی
            </Button>
            <Button
              className="min-w-[148px]"
              onClick={handleCloseEnrollModal}
              disabled={isSyncingCourseSessionEnrollments}
            >
              انصراف
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            مشارکت جلسات را برای همه دانشجویان گروه یا فقط افراد انتخاب‌شده همگام‌سازی کنید.
          </p>

          <Radio.Group
            value={syncMode}
            onChange={(e) => {
              setSyncMode(e.target.value);
              setSelectedStudentIds([]);
            }}
            className="flex flex-col gap-2"
          >
            <Radio value="all">
              همه دانشجویان گروه ({enrollSchedule?.students?.length || 0} نفر)
            </Radio>
            <Radio value="selected">انتخاب برخی از دانشجویان</Radio>
          </Radio.Group>

          {syncMode === 'selected' && (
            <Select
              mode="multiple"
              className="w-full"
              placeholder="انتخاب دانشجو"
              showSearch
              optionFilterProp="label"
              value={selectedStudentIds}
              onChange={setSelectedStudentIds}
              options={studentSelectOptions}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          )}
        </div>
      </Modal>

      <Modal
        title={
          blockSchedule
            ? `مسدودسازی — ${blockSchedule.name}`
            : 'مسدودسازی'
        }
        open={blockModalOpen}
        onCancel={handleCloseBlockModal}
        centered
        destroyOnClose
        footer={
          <div className="flex justify-center items-center gap-3">
            <Button
              type="primary"
              className="min-w-[148px]"
              onClick={handleSaveVideoBlock}
              loading={isUpdating}
              disabled={isRestrictedByAdmin && !restrictedByAdminMessage.trim()}
            >
              ذخیره
            </Button>
            <Button
              className="min-w-[148px]"
              onClick={handleCloseBlockModal}
              disabled={isUpdating}
            >
              انصراف
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            اگر مسدودسازی فعال باشد، دانشجویان این گروه ویدیوها را نمی‌بینند و پیام زیر به آن‌ها نمایش داده می‌شود.
          </p>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-sm font-medium text-gray-700">مسدودسازی</span>
            <Switch checked={isRestrictedByAdmin} onChange={setIsRestrictedByAdmin} />
          </div>
          {isRestrictedByAdmin && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">پیام</span>
              <Input.TextArea
                rows={4}
                maxLength={2000}
                value={restrictedByAdminMessage}
                onChange={(e) => setRestrictedByAdminMessage(e.target.value)}
                placeholder="پیامی که دانشجو به جای ویدیو می‌بیند"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
