import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Empty, Button, Collapse, Popconfirm, Space, Tag, Avatar, Descriptions } from 'antd';
import { Users, Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { useGetAllSchedules, useCourseSchedules } from '@/hooks';
import { CourseScheduleStatus } from '@/enums';
import { CourseScheduleModal } from './CourseScheduleModal';
import type { CourseSchedule } from '@/types';

export const CourseSchedulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CourseSchedule | null>(null);

  const { data: schedules = [], refetch, isLoading } = useGetAllSchedules(
    id ? { CourseId: id, PageIndex: 1, PageSize: 100 } : undefined
  );
  const { createSchedule, updateSchedule, deleteSchedule, isCreating, isUpdating, isDeleting } = useCourseSchedules();

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

  const handleSubmitSchedule = async (values: any) => {
    if (!id) return;

    if (editingSchedule) {
      // Update existing schedule
      await updateSchedule({
        id: editingSchedule.id,
        courseId: id,
        name: values.name,
        description: values.description,
        isVisible: values.isVisible,
        status: values.status,
        typeId: values.typeId,
        instructorIds: values.instructorIds,
        operatorIds: values.operatorIds,
        studentIds: values.studentIds,
      });
    } else {
      // Create new schedule
      await createSchedule({
        courseId: id,
        name: values.name,
        description: values.description,
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

  // Render user list with avatars
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

  // Render schedule details
  const renderScheduleDetails = (schedule: CourseSchedule) => (
    <div className="space-y-4">
      <Descriptions column={1} size="small">
        <Descriptions.Item label="نام گروه‌بندی">
          <span className="font-semibold">{schedule.name}</span>
        </Descriptions.Item>
        <Descriptions.Item label="توضیحات">
          {schedule.description || 'بدون توضیحات'}
        </Descriptions.Item>
        <Descriptions.Item label="شناسه نوع">
          <Tag color="purple">{schedule.typeId ?? 0}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="وضعیت">
          <Space direction="horizontal" size="small">
            {schedule.isVisible ? (
              <Tag icon={<Eye size={14} />} color="green">قابل مشاهده</Tag>
            ) : (
              <Tag icon={<EyeOff size={14} />} color="default">مخفی</Tag>
            )}
            <Tag color={schedule.status === 0 ? 'blue' : schedule.status === 1 ? 'orange' : 'green'}>
              {CourseScheduleStatus[schedule.status as keyof typeof CourseScheduleStatus] || `وضعیت ${schedule.status}`}
            </Tag>
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

  // Create collapse items from schedules
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
        </Space>
      </div>
    ),
    children: renderScheduleDetails(schedule),
  }));

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
    </div>
  );
};
