import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Empty, Button, Collapse, Popconfirm, Space, Tag, Descriptions } from 'antd';
import { Calendar, Plus, Trash2, Edit, Clock, FileText, Video, Link as LinkIcon } from 'lucide-react';
import { useGetAllSessions, useCourseSessions } from '@/hooks';
import { CourseSessionModal } from './CourseSessionModal';
import type { CourseSession } from '@/types/session.types';
import dayjs from 'dayjs';
import { formatDate } from '@/utils';

export const CourseSessionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<CourseSession | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const { data: allSessions = [], refetch, isLoading } = useGetAllSessions(true,id);
  const { createSession, updateSession, deleteSession, isCreating, isUpdating, isDeleting } = useCourseSessions();

  // API already filters sessions for current course and provides subSessions nested
  const parentSessions = useMemo(() => {
    // Sort by index (API returns only sessions for this course)
    return (allSessions as CourseSession[]).sort((a: CourseSession, b: CourseSession) => a.index - b.index);
  }, [allSessions]);

  const handleAddParentSession = () => {
    setEditingSession(null);
    setSelectedParentId(null);
    setModalOpen(true);
  };

  const handleAddChildSession = (parentId: string) => {
    setEditingSession(null);
    setSelectedParentId(parentId);
    setModalOpen(true);
  };

  const handleEditSession = (session: CourseSession) => {
    setEditingSession(session);
    setSelectedParentId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSession(null);
    setSelectedParentId(null);
  };

  const handleSubmitSession = async (values: Partial<CourseSession>) => {
    if (!id) return;

    if (editingSession) {
      // Update existing session
      await updateSession({
        id: editingSession.id,
        courseId: id,
        name: values.name!,
        description: values.description!,
        index: values.index ?? editingSession.index,
        occurrenceTime: values.occurrenceTime!,
        practiceDueTime: values.practiceDueTime!,
        videoUrl: values.videoUrl || '',
        fileUrl: values.fileUrl || '',
        onlineMeetingUrl: values.onlineMeetingUrl || '',
        parentId: editingSession.parentId,
        isPracticeAvailable: values.isPracticeAvailable ?? false,
      });
    } else {
      // Create new session
      // If selectedParentId is set, this is a child session; otherwise, it's a parent session
      const targetParentId = selectedParentId || null;

      // Calculate next index
      let nextIndex = 0;
      if (selectedParentId) {
        // Find parent session and count its children
        const parentSession = parentSessions.find(p => p.id === selectedParentId);
        nextIndex = parentSession?.subSessions?.length || 0;
      } else {
        // Count parent sessions
        nextIndex = parentSessions.length;
      }

      await createSession({
        courseId: id,
        name: values.name!,
        description: values.description!,
        index: nextIndex,
        occurrenceTime: values.occurrenceTime!,
        practiceDueTime: values.practiceDueTime!,
        videoUrl: values.videoUrl || '',
        fileUrl: values.fileUrl || '',
        onlineMeetingUrl: values.onlineMeetingUrl || '',
        parentId: targetParentId,
        isPracticeAvailable: values.isPracticeAvailable ?? false,
      });
    }

    await refetch();
    handleModalClose();
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    await refetch();
  };

  // Render session details
  const renderSessionDetails = (session: CourseSession, isChild: boolean = false) => (
    <div className="space-y-4">
      <Descriptions column={1} size="small">
        <Descriptions.Item label="توضیحات">
          {session.description}
        </Descriptions.Item>
        <Descriptions.Item label="زمان برگزاری">
          <Space>
            <Clock size={16} />
            {formatDate(session.occurrenceTime)}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="مهلت تمرین">
          <Space>
            <Clock size={16} />
            {formatDate(session.practiceDueTime)}
          </Space>
        </Descriptions.Item>
        {session.videoUrl && (
          <Descriptions.Item label="ویدیو">
            <a href={session.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              <Space>
                <Video size={16} />
                مشاهده ویدیو
              </Space>
            </a>
          </Descriptions.Item>
        )}
        {session.fileUrl && (
          <Descriptions.Item label="فایل">
            <a href={session.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              <Space>
                <FileText size={16} />
                دانلود فایل
              </Space>
            </a>
          </Descriptions.Item>
        )}
        {session.onlineMeetingUrl && (
          <Descriptions.Item label="جلسه آنلاین">
            <a href={session.onlineMeetingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              <Space>
                <LinkIcon size={16} />
                ورود به جلسه
              </Space>
            </a>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="وضعیت تمرین">
          {session.isPracticeAvailable ? (
            <Tag color="green">در دسترس</Tag>
          ) : (
            <Tag color="default">غیرفعال</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>

      <div className="flex justify-between items-center pt-2 border-t">
        <div>
          {!isChild && (
            <Button
              type="dashed"
              icon={<Plus size={16} />}
              onClick={() => handleAddChildSession(session.id)}
              loading={isCreating}
            >
              افزودن زیر-جلسه
            </Button>
          )}
        </div>
        <Space>
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => handleEditSession(session)}
            loading={isUpdating}
          >
            ویرایش
          </Button>
          <Popconfirm
            title="حذف جلسه"
            description="آیا از حذف این جلسه اطمینان دارید؟"
            onConfirm={() => handleDeleteSession(session.id)}
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

  // Create collapse items for parent sessions with nested children
  const collapseItems = parentSessions.map((parent: CourseSession) => {
    const children = parent.subSessions || [];

    return {
      key: parent.id,
      label: (
        <div className="flex items-center justify-between w-full pr-2">
          <Space>
            <span className="font-medium text-lg">{parent.name}</span>
            {children.length > 0 && (
              <Tag color="blue">{children.length} زیر-جلسه</Tag>
            )}
          </Space>
        </div>
      ),
      children: (
        <div className="space-y-4">
          {renderSessionDetails(parent, false)}

          {/* Child sessions */}
          {children.length > 0 && (
            <div className="mt-6 border-r-4 border-primary-300 pr-4">
              <h4 className="font-semibold text-gray-700 mb-4">زیر-جلسات:</h4>
              <Collapse
                items={children.map((child: CourseSession) => ({
                  key: child.id,
                  label: (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{child.name}</span>
                      <Tag color="cyan" className="text-xs">زیر-جلسه</Tag>
                    </div>
                  ),
                  children: renderSessionDetails(child, true),
                }))}
                size="small"
              />
            </div>
          )}
        </div>
      ),
    };
  });

  return (
    <div>
      <Card
        className="shadow-sm"
        extra={
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={handleAddParentSession}
            className="shadow-md hover:shadow-lg transition-all"
            loading={isCreating}
          >
            افزودن جلسه جدید
          </Button>
        }
        title={
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            <span>جلسات دوره</span>
          </div>
        }
        loading={isLoading}
      >
        {parentSessions.length > 0 ? (
          <Collapse
            items={collapseItems}
            defaultActiveKey={[parentSessions[0]?.id]}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar size={64} className="text-gray-400 mb-4" />
            <Empty
              description={
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    جلسات دوره
                  </p>
                  <p className="text-gray-500">
                    شناسه دوره: {id}
                  </p>
                  <p className="text-gray-400 mt-2">
                    در حال حاضر جلسه‌ای ثبت نشده است
                  </p>
                </div>
              }
            />
          </div>
        )}
      </Card>

      <CourseSessionModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmitSession}
        loading={isCreating || isUpdating}
        session={editingSession}
        parentId={selectedParentId}
        nextIndex={
          selectedParentId
            ? (parentSessions.find(p => p.id === selectedParentId)?.subSessions?.length || 0)
            : parentSessions.length
        }
      />
    </div>
  );
};
