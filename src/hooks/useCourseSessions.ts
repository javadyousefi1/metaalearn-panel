import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useState, useCallback, useRef, useEffect } from 'react';
import { courseSessionService } from '@/services';
import { queryKeys } from '@/config';
import { CreateSessionPayload, UpdateSessionPayload, CourseSessionUploadType, VideoProcessingStatusResponse, CourseSessionVideoProcessing } from '@/types/session.types';

const VIDEO_STATUS_POLL_INTERVAL_MS = 10000;
const MAX_CONSECUTIVE_POLL_FAILURES = 5;

/**
 * Custom hook for course session management with React Query.
 * @param activeSessionId - id of the session currently open in the edit modal (or null). Used to
 * scope the video-processing status/flags below to that session only - a background poll for a
 * session the user has since navigated away from keeps running (so its Ready/Failed toast still
 * fires) but no longer reports itself through isProcessingVideo/isUploadSuccess/videoProcessingStatus
 * once a different session (or none) is open.
 */
export const useCourseSessions = (activeSessionId: string | null = null) => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [videoProcessingStatus, setVideoProcessingStatus] = useState<VideoProcessingStatusResponse | null>(null);
  const [pollingSessionId, setPollingSessionId] = useState<string | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollFailureCountRef = useRef(0);

  const stopPollingVideoStatus = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  // Video processing now runs in the background after upload returns, so the UI polls the regular
  // Get-by-id endpoint (which already embeds `videoProcessing` for backoffice callers - see
  // GetCourseSessionQueryHandler) until the job reaches Ready/Failed, instead of waiting on the
  // upload request itself or hitting a dedicated status endpoint.
  // `initialStatus` seeds state synchronously (before the first network round-trip) so callers
  // never see a stale/empty status in the render right after starting a poll.
  const pollVideoProcessingStatus = useCallback((courseSessionId: string, initialStatus?: VideoProcessingStatusResponse) => {
    stopPollingVideoStatus();
    pollFailureCountRef.current = 0;
    setPollingSessionId(courseSessionId);
    setVideoProcessingStatus(initialStatus ?? {
      type: 'Upload', status: 'Queued', stage: null, error: null, startTime: null, endTime: null, hasVideo: false,
    });

    const tick = async () => {
      try {
        const session = await courseSessionService.getById(courseSessionId);
        // This poll only ever tracks the Upload pipeline. videoProcessingLogs is only ever
        // empty/undefined for non-backoffice callers (see GetCourseSessionQueryHandler) - this hook
        // is only used from the backoffice, so an Upload entry should always be present here once
        // an upload has been queued; fall back defensively rather than getting stuck mid-poll.
        const uploadLog = session.videoProcessingLogs?.find(l => l.type === 'Upload');
        const status: VideoProcessingStatusResponse = uploadLog
          ? { ...uploadLog, hasVideo: session.hasVideo }
          : { type: 'Upload', status: 'None', stage: null, error: null, startTime: null, endTime: null, hasVideo: session.hasVideo };

        pollFailureCountRef.current = 0;
        setVideoProcessingStatus(status);

        if (status.status === 'Ready') {
          message.success('ویدیو با موفقیت پردازش شد و آماده پخش است');
          queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
          return;
        }

        if (status.status === 'Failed') {
          message.error(status.error || 'پردازش ویدیو با خطا مواجه شد');
          queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
          return;
        }

        pollTimeoutRef.current = setTimeout(tick, VIDEO_STATUS_POLL_INTERVAL_MS);
      } catch {
        pollFailureCountRef.current += 1;

        if (pollFailureCountRef.current >= MAX_CONSECUTIVE_POLL_FAILURES) {
          message.error('امکان دریافت وضعیت پردازش ویدیو وجود ندارد. لطفاً صفحه را تازه‌سازی کنید.');
          return;
        }

        // Transient network/API error while polling - keep trying rather than losing the
        // in-progress state the user is watching, up to MAX_CONSECUTIVE_POLL_FAILURES.
        pollTimeoutRef.current = setTimeout(tick, VIDEO_STATUS_POLL_INTERVAL_MS);
      }
    };

    void tick();
  }, [queryClient, stopPollingVideoStatus]);

  useEffect(() => stopPollingVideoStatus, [stopPollingVideoStatus]);

  // Create course session mutation
  const createMutation = useMutation({
    mutationFn: courseSessionService.create,
    onSuccess: () => {
      message.success('جلسه با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });

  // Update course session mutation
  const updateMutation = useMutation({
    mutationFn: courseSessionService.update,
    onSuccess: () => {
      message.success('جلسه با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: () => {
      message.error('خطا در به‌روزرسانی جلسه');
    },
  });

  // Delete course session mutation
  const deleteMutation = useMutation({
    mutationFn: courseSessionService.delete,
    onSuccess: () => {
      message.success('جلسه با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: () => {
      message.error('خطا در حذف جلسه');
    },
  });

  // Check video integrity mutation
  const checkVideoIntegrityMutation = useMutation({
    mutationFn: courseSessionService.checkVideoIntegrity,
    onError: () => {
      message.error('خطا در بررسی سلامت ویدیو');
    },
  });

  // Renew video mutation - runs as a background job, this only confirms it was queued
  const renewVideoMutation = useMutation({
    mutationFn: courseSessionService.renewVideo,
    onSuccess: () => {
      message.success('درخواست بازسازی ویدیو ثبت شد و در پس‌زمینه اجرا می‌شود');
    },
    onError: () => {
      message.error('خطا در ثبت درخواست بازسازی ویدیو');
    },
  });

  const attachSharedVideoMutation = useMutation({
    mutationFn: ({ targetSessionId, sourceSessionId }: { targetSessionId: string; sourceSessionId: string }) =>
      courseSessionService.update({
        id: targetSessionId,
        linkVideoFromSessionId: sourceSessionId,
      }),
    onSuccess: () => {
      message.success('ویدیوی جلسات با موفقیت به این جلسه متصل شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: () => {
      message.error('خطا در اتصال ویدیوی جلسات');
    },
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file, courseSessionId, uploadType, onProgress }: {
      file: File;
      courseSessionId: string;
      uploadType: number;
      onProgress?: (progress: number) => void;
    }) => {
      setUploadProgress(0);
      return courseSessionService.upload(file, courseSessionId, uploadType, (progress) => {
        setUploadProgress(progress);
        if (onProgress) {
          onProgress(progress);
        }
      });
    },
    onSuccess: (_, variables) => {
      if (variables.uploadType === CourseSessionUploadType.Video) {
        // Upload returning success only means the raw file was stored and queued - the HLS
        // transcode runs in the background, so start polling its status instead of declaring
        // success here.
        message.info('ویدیو آپلود شد؛ پردازش آن در پس‌زمینه در حال انجام است');
        pollVideoProcessingStatus(variables.courseSessionId);
      } else {
        message.success('فایل با موفقیت آپلود شد');
        queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      }
      setUploadProgress(0);
    },
    onError: () => {
      message.error('خطا در آپلود فایل');
      setUploadProgress(0);
    },
  });

  const uploadFile = useCallback(
    (file: File, courseSessionId: string, uploadType: number, onProgress?: (progress: number) => void) => {
      return uploadMutation.mutateAsync({ file, courseSessionId, uploadType, onProgress });
    },
    [uploadMutation]
  );

  const resumeVideoProcessingIfNeeded = useCallback((session: { id: string; hasVideo: boolean; videoProcessingLogs?: CourseSessionVideoProcessing[] }) => {
    const uploadLog = session.videoProcessingLogs?.find(l => l.type === 'Upload');
    if (uploadLog == null) {
      return;
    }

    if (uploadLog.status === 'Queued' || uploadLog.status === 'Processing') {
      pollVideoProcessingStatus(session.id, { ...uploadLog, hasVideo: session.hasVideo });
    }
  }, [pollVideoProcessingStatus]);

  // Only resets the upload mutation's own success/error flags (e.g. on modal cancel) - deliberately
  // does NOT stop the background poll or clear videoProcessingStatus/pollingSessionId, so a
  // still-running job keeps polling (and still shows its Ready/Failed toast) even after the modal
  // that started it closes. Session-scoping below (via activeSessionId) is what keeps that from
  // leaking into whichever session's modal is open when it happens.
  const resetUploadState = useCallback(() => {
    uploadMutation.reset();
  }, [uploadMutation]);

  const isVideoStatusForActiveSession = activeSessionId != null && pollingSessionId === activeSessionId;
  const scopedVideoProcessingStatus = isVideoStatusForActiveSession ? videoProcessingStatus : null;
  const isProcessingVideo = scopedVideoProcessingStatus != null
    && (scopedVideoProcessingStatus.status === 'Queued' || scopedVideoProcessingStatus.status === 'Processing');

  return {
    // Mutations
    createSession: (data: CreateSessionPayload) => createMutation.mutateAsync(data),
    updateSession: (data: UpdateSessionPayload) => updateMutation.mutateAsync(data),
    deleteSession: (id: string) => deleteMutation.mutateAsync(id),
    uploadFile,
    checkVideoIntegrity: (courseSessionId: string) => checkVideoIntegrityMutation.mutateAsync(courseSessionId),
    renewVideo: (courseSessionId: string) => renewVideoMutation.mutateAsync(courseSessionId),
    attachSharedVideo: (targetSessionId: string, sourceSessionId: string) =>
      attachSharedVideoMutation.mutateAsync({ targetSessionId, sourceSessionId }),

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUploading: uploadMutation.isPending || isProcessingVideo,
    isCheckingVideoIntegrity: checkVideoIntegrityMutation.isPending,
    isRenewingVideo: renewVideoMutation.isPending,
    isAttachingSharedVideo: attachSharedVideoMutation.isPending,
    uploadProgress,

    // Video background-processing status, polled after a Video upload is accepted or resumed -
    // scoped to activeSessionId, see isVideoStatusForActiveSession above.
    videoProcessingStatus: scopedVideoProcessingStatus,
    isProcessingVideo,
    pollingSessionId,

    // Upload states
    isUploadSuccess: uploadMutation.isSuccess && !isProcessingVideo
      && (scopedVideoProcessingStatus == null || scopedVideoProcessingStatus.status === 'Ready'),
    isUploadError: uploadMutation.isError || scopedVideoProcessingStatus?.status === 'Failed',
    uploadError: uploadMutation.error,
    resetUploadState,
    resumeVideoProcessingIfNeeded,
  };
};

/**
 * Custom hook for getting all course sessions
 * @param enabled - Whether the query should run (optional, defaults to true)
 */
export const useGetAllSessions = (enabled = true, params: {courseId:string,isPracticeAvailable:boolean}) => {
  return useQuery({
    queryKey: queryKeys.sessions.detail(params.courseId),
    queryFn: () => courseSessionService.getAll(params),
    enabled,
      select :(data) => data?.items
  });
};

/**
 * Custom hook for getting a course session by ID
 * @param id - Course Session ID
 * @param enabled - Whether the query should run (optional, defaults to true when id is provided)
 */
export const useGetSessionById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.sessions.detail(id),
    queryFn: () => courseSessionService.getById(id),
    enabled: !!id && enabled,
  });
};
