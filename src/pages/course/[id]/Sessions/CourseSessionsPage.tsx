import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Empty, Button, Collapse, Popconfirm, Space, Tag, Descriptions } from 'antd';
import { Calendar, Plus, Trash2, Edit, Clock, FileText, Video } from 'lucide-react';
import { useGetAllSessions, useCourseSessions, useAuth } from '@/hooks';
import { VideoIntegrityResultModal } from '@/components/common';
import type { CheckVideoIntegrityResponse } from '@/types/session.types';
import { CourseSessionModal } from './CourseSessionModal';
import type { CourseSession } from '@/types/session.types';
import { formatDate, isSuperAdminUser } from '@/utils';

const getNextSessionIndex = (sessions: { index: number }[] | null | undefined): number => {
  if (!sessions?.length) {
    return 0;
  }

  return Math.max(...sessions.map(session => Number(session.index) || 0)) + 1;
};

const sortSessionsByIndex = <T extends { index: number }>(sessions: T[] | null | undefined): T[] =>
  [...(sessions ?? [])].sort((a, b) => a.index - b.index);

export const CourseSessionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<CourseSession | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedLevel1ParentId, setSelectedLevel1ParentId] = useState<string | null>(null);

  const { data: allSessions = [], refetch, isLoading } = useGetAllSessions(true, {courseId:id});
  const { user } = useAuth();
  const superAdmin = isSuperAdminUser(user ?? null);
  const [checkingSessionId, setCheckingSessionId] = useState<string | null>(null);
  const [renewingSessionId, setRenewingSessionId] = useState<string | null>(null);
  const [integrityResult, setIntegrityResult] = useState<CheckVideoIntegrityResponse | null>(null);

  const {
    createSession,
    updateSession,
    deleteSession,
    uploadFile,
    checkVideoIntegrity,
    renewVideo,
    attachSharedVideo,
    isCreating,
    isUpdating,
    isDeleting,
    isUploading,
    uploadProgress,
    isUploadSuccess,
    isUploadError,
    resetUploadState,
    videoProcessingStatus,
    resumeVideoProcessingIfNeeded,
    isAttachingSharedVideo,
  } = useCourseSessions(editingSession?.id ?? null);

  // Flatten all sessions for easier lookup
  const flatSessions = useMemo(() => {
    const flat: CourseSession[] = [];
    (allSessions as CourseSession[]).forEach(parent => {
      flat.push(parent);
      if (parent.subSessions) {
        parent.subSessions.forEach(child => {
          flat.push(child);
          if (child.subSessions) {
            flat.push(...child.subSessions);
          }
        });
      }
    });
    return flat;
  }, [allSessions]);

  // Once a background transcode reaches Ready/Failed, invalidateQueries (inside the hook) refetches
  // the session list, but editingSession is a separate local snapshot that wouldn't otherwise pick
  // up the fresh hasVideo/videoUrl - re-sync it here so the still-open modal reflects the outcome.
  useEffect(() => {
    if (!editingSession || videoProcessingStatus == null) {
      return;
    }

    if (videoProcessingStatus.status !== 'Ready' && videoProcessingStatus.status !== 'Failed') {
      return;
    }

    const fresh = flatSessions.find(s => s.id === editingSession.id);
    if (fresh && fresh !== editingSession) {
      setEditingSession(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoProcessingStatus?.status, flatSessions]);

  // API already filters sessions for current course and provides subSessions nested
  const parentSessions = useMemo(() => {
    return sortSessionsByIndex(allSessions as CourseSession[]);
  }, [allSessions]);

  const handleAddParentSession = () => {
    setEditingSession(null);
    setSelectedParentId(null);
    setSelectedLevel1ParentId(null);
    setModalOpen(true);
  };

  const handleAddChildSession = (parentId: string, level1ParentId?: string) => {
    setEditingSession(null);
    setSelectedParentId(parentId);
    setSelectedLevel1ParentId(level1ParentId || null);
    setModalOpen(true);
  };

  const handleEditSession = (session: CourseSession) => {
    setEditingSession(session);
    setSelectedParentId(null);
    setSelectedLevel1ParentId(null);
    resumeVideoProcessingIfNeeded(session);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSession(null);
    setSelectedParentId(null);
    setSelectedLevel1ParentId(null);
  };

  const handleSubmitSession = async (values: Partial<CourseSession>) => {
    if (!id) return;

    if (editingSession) {
      // Update existing session
      await updateSession({
        id: editingSession.id,
        courseId: id,
        name: values.name!,
        nameEn: values.nameEn || null,
        description: values.description!,
        index: values.index != null ? Number(values.index) : editingSession.index,
        occurrenceTime: values.occurrenceTime!,
        practiceDueTime: values.practiceDueTime!,
        onlineMeetingUrl: values.onlineMeetingUrl || null,
        courseScheduleIds: values.courseScheduleIds || null,
        parentId: editingSession.parentId,
        isPracticeAvailable: values.isPracticeAvailable ?? false,
        isTopic: values.isTopic ?? false,
        isUsedForCertificate: values.isUsedForCertificate ?? false,
      });
    } else {
      // Create new session
      const targetParentId = values.parentId || null;

      // Append after the highest existing index so a deleted middle slot (e.g. 42)
      // is not reused — the new session always goes to the end of its siblings.
      const siblings = targetParentId
        ? flatSessions.filter(s => s.parentId === targetParentId)
        : parentSessions;
      const nextIndex = getNextSessionIndex(siblings);

      // Create session
      await createSession({
        courseId: id,
        name: values.name!,
        nameEn: values.nameEn || null,
        description: values.description!,
        index: nextIndex,
        occurrenceTime: values.occurrenceTime!,
        practiceDueTime: values.practiceDueTime!,
        onlineMeetingUrl: values.onlineMeetingUrl || null,
        courseScheduleIds: values.courseScheduleIds || null,
        parentId: targetParentId,
        isPracticeAvailable: values.isPracticeAvailable ?? false,
        isTopic: values.isTopic ?? false,
        isUsedForCertificate: values.isUsedForCertificate ?? false,
      });
    }

    await refetch();
    handleModalClose();
  };

  const handleUploadMedia = async (sessionId: string, file: File, uploadType: number) => {
    if (!id) return;
    console.log(file ,"file")
    // Upload file
    await uploadFile(file, sessionId, uploadType);

    // Refetch to get updated session data
    const result = await refetch();

    // Update editingSession with fresh data from refetch
    if (editingSession && result.data) {
      // Flatten the fresh data to find the updated session
      const freshSessions: CourseSession[] = [];
      (result.data as CourseSession[]).forEach(parent => {
        freshSessions.push(parent);
        if (parent.subSessions) {
          parent.subSessions.forEach(child => {
            freshSessions.push(child);
            if (child.subSessions) {
              freshSessions.push(...child.subSessions);
            }
          });
        }
      });

      const updatedSession = freshSessions.find(s => s.id === sessionId);
      if (updatedSession) {
        setEditingSession(updatedSession);
      }
    }
  };

  const handleAttachSharedVideo = async (sourceSessionId: string) => {
    if (!editingSession) return;

    await attachSharedVideo(editingSession.id, sourceSessionId);
    const result = await refetch();

    if (result.data) {
      const freshSessions: CourseSession[] = [];
      (result.data as CourseSession[]).forEach(parent => {
        freshSessions.push(parent);
        parent.subSessions?.forEach(child => {
          freshSessions.push(child);
          if (child.subSessions) {
            freshSessions.push(...child.subSessions);
          }
        });
      });

      const updatedSession = freshSessions.find(s => s.id === editingSession.id);
      if (updatedSession) {
        setEditingSession(updatedSession);
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    await refetch();
  };

  const handleCheckVideoIntegrity = async (sessionId: string) => {
    if (!superAdmin) return;

    setCheckingSessionId(sessionId);
    try {
      const result = await checkVideoIntegrity(sessionId);

      setIntegrityResult(result);
    } catch {
      // errors are already surfaced via the mutation's onError toast
    } finally {
      setCheckingSessionId(null);
    }
  };

  const handleRenewVideo = async (sessionId: string) => {
    if (!superAdmin) return;

    setRenewingSessionId(sessionId);
    try {
      await renewVideo(sessionId);
      // renew runs as a background job - nothing to refetch yet, the video
      // url only changes once the job finishes
    } catch {
      // errors are already surfaced via the mutation's onError toast
    } finally {
      setRenewingSessionId(null);
    }
  };

  // Render session details
  const renderSessionDetails = (session: CourseSession, level: 1 | 2 | 3, level1ParentId?: string) => (
    <div className="space-y-4">
      <Descriptions column={1} size="small">
        <Descriptions.Item label="زمان برگزاری">
          <Space>
            <Clock size={16} />
            {session.occurrenceTime ? formatDate(session.occurrenceTime) : "ثبت نشده"}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="مهلت تمرین">
          <Space>
            <Clock size={16} />
            {session.practiceDueTime ? formatDate(session.practiceDueTime) : "ثبت نشده"}
          </Space>
        </Descriptions.Item>
        {session.hasVideo && (
          <Descriptions.Item label="ویدیو">
            <a href={`https://metaalearn.com/course/${id}/session?sessionId=${session.id}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              <Space>
                <Video size={16} />
                مشاهده ویدیو
              </Space>
            </a>
          </Descriptions.Item>
        )}
        {session.fileUrl && (
          <Descriptions.Item label="فایل">
            <a href={session.fileUrl.replace("http",'https')} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              <Space>
                <FileText size={16} />
                دانلود فایل
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
        <Descriptions.Item label="موضوع (Topic)">
          {session.isTopic ? (
            <Tag color="blue">بله</Tag>
          ) : (
            <Tag color="default">خیر</Tag>
          )}
        </Descriptions.Item>
          <Descriptions.Item label="گروه بندی">
              {session.schedules?.length ===0 && "ندارد"} {session.schedules?.map(item => `${item.name} `)}
          </Descriptions.Item>
      </Descriptions>

      <div className="flex justify-between items-center pt-2 border-t">
        <Space>
          {level === 1 && (
            <Button
              type="dashed"
              icon={<Plus size={16} />}
              onClick={() => handleAddChildSession(session.id)}
              loading={isCreating}
            >
              افزودن زیر فصل
            </Button>
          )}
          {level === 2 && (
            <Button
              type="dashed"
              icon={<Plus size={16} />}
              onClick={() => handleAddChildSession(session.id, level1ParentId)}
              loading={isCreating}
            >
              افزودن مبحث
            </Button>
          )}
        </Space>
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
  const collapseItems = parentSessions.map((level1: CourseSession) => {
    const level2Sessions = sortSessionsByIndex(level1.subSessions);

    return {
      key: level1.id,
      label: (
        <div className="flex items-center justify-between w-full pr-2">
          <Space>
            <Tag color="purple">فصل</Tag>
            <span className="font-medium text-lg">{level1.name}</span>
            {level2Sessions.length > 0 && (
              <Tag color="blue">{level2Sessions.length} زیر فصل</Tag>
            )}
          </Space>
        </div>
      ),
      children: (
        <div className="space-y-4">
          {renderSessionDetails(level1, 1)}

          {/* Level 2 sessions (زیر فصل) */}
          {level2Sessions.length > 0 && (
            <div className="mt-6 border-r-4 border-blue-300 pr-4">
              <h4 className="font-semibold text-gray-700 mb-4">زیر فصل‌ها:</h4>
              <Collapse
                items={level2Sessions.map((level2: CourseSession) => {
                  const level3Sessions = sortSessionsByIndex(level2.subSessions);

                  return {
                    key: level2.id,
                    label: (
                      <div className="flex items-center gap-2">
                        <Tag color="cyan">زیر فصل</Tag>
                        <span className="font-medium">{level2.name}</span>
                        {level3Sessions.length > 0 && (
                          <Tag color="green" className="text-xs">{level3Sessions.length} مبحث</Tag>
                        )}
                      </div>
                    ),
                    children: (
                      <div className="space-y-4">
                        {renderSessionDetails(level2, 2, level1.id)}

                        {/* Level 3 sessions (مبحث) */}
                        {level3Sessions.length > 0 && (
                          <div className="mt-4 border-r-4 border-green-300 pr-4">
                            <h4 className="font-semibold text-gray-700 mb-3">مباحث:</h4>
                            <Collapse
                              items={level3Sessions.map((level3: CourseSession) => ({
                                key: level3.id,
                                label: (
                                  <div className="flex items-center gap-2">
                                    <Tag color="green" className="text-xs">مبحث</Tag>
                                    <span className="font-medium text-sm">{level3.name}</span>
                                  </div>
                                ),
                                children: renderSessionDetails(level3, 3),
                              }))}
                              size="small"
                            />
                          </div>
                        )}
                      </div>
                    ),
                  };
                })}
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
          <Space>
            <Button
              type="primary"
              icon={<Plus size={18} />}
              onClick={handleAddParentSession}
              className="shadow-md hover:shadow-lg transition-all"
              loading={isCreating}
            >
              افزودن فصل جدید
            </Button>
          </Space>
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
            // defaultActiveKey={[parentSessions[0]?.id]}
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
        onUploadMedia={handleUploadMedia}
        onAttachSharedVideo={handleAttachSharedVideo}
        loading={isCreating || isUpdating}
        uploadLoading={isUploading}
        uploadProgress={uploadProgress}
        isUploadSuccess={isUploadSuccess}
        isUploadError={isUploadError}
        videoProcessingStatus={videoProcessingStatus}
        onResetUploadState={resetUploadState}
        onCheckVideoIntegrity={handleCheckVideoIntegrity}
        onRenewVideo={handleRenewVideo}
        checkingVideoIntegrity={!!editingSession && checkingSessionId === editingSession.id}
        renewingVideo={!!editingSession && renewingSessionId === editingSession.id}
        attachingSharedVideo={isAttachingSharedVideo}
        session={editingSession}
        parentId={selectedParentId}
        level1ParentId={selectedLevel1ParentId}
        allSessions={flatSessions}
        nextIndex={getNextSessionIndex(
          selectedParentId
            ? flatSessions.filter(s => s.parentId === selectedParentId)
            : parentSessions
        )}
      />

      <VideoIntegrityResultModal
        open={integrityResult !== null}
        result={integrityResult}
        onClose={() => setIntegrityResult(null)}
      />
    </div>
  );
};
