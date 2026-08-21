import React, { useEffect, useMemo, useState } from 'react';
import { Select, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { courseService, courseSessionService } from '@/services';
import { queryKeys } from '@/config';
import type { CourseSession } from '@/types/session.types';

interface LinkExistingSessionVideoProps {
  targetSessionId: string;
  disabled?: boolean;
  loading?: boolean;
  onSourceSessionChange?: (sourceSessionId: string | null) => void;
}

const flattenSessions = (sessions: CourseSession[]): CourseSession[] => {
  const flat: CourseSession[] = [];
  sessions.forEach((parent) => {
    flat.push(parent);
    parent.subSessions?.forEach((child) => {
      flat.push(child);
      if (child.subSessions) {
        flat.push(...child.subSessions);
      }
    });
  });
  return flat;
};

/**
 * Course → session picker for reusing an already-transcoded video.
 * Rendered inside the shared media card (upload vs reuse mode).
 */
export const LinkExistingSessionVideo: React.FC<LinkExistingSessionVideoProps> = ({
  targetSessionId,
  disabled = false,
  loading = false,
  onSourceSessionChange,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedSourceSessionId, setSelectedSourceSessionId] = useState<string | null>(null);

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: [...queryKeys.courses.lists(), { page: 1, size: 500, forSharedVideo: true }],
    queryFn: () => courseService.getAll({ PageIndex: 1, PageSize: 500 }),
  });

  const { data: sourceSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: [...queryKeys.sessions.lists(), { courseId: selectedCourseId, forSharedVideo: true }],
    queryFn: async () => {
      const response = await courseSessionService.getAll({
        courseId: selectedCourseId,
        PageIndex: 1,
        PageSize: 500,
      });
      return flattenSessions(response.items ?? []);
    },
    enabled: !!selectedCourseId,
  });

  useEffect(() => {
    setSelectedSourceSessionId(null);
    onSourceSessionChange?.(null);
    // Only reset when the course changes — not when the parent callback identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  const courseOptions = useMemo(
    () =>
      (coursesData?.items ?? []).map((course) => ({
        value: course.id,
        label: course.name,
      })),
    [coursesData]
  );

  const sessionOptions = useMemo(
    () =>
      sourceSessions
        // Backend rejects linking to a session that itself reuses another video
        // (CannotLinkToLinkedVideo) — only offer sessions that own their HLS files.
        .filter(
          (s) =>
            s.hasVideo &&
            s.id !== targetSessionId &&
            !s.isTopic &&
            !s.linkedVideoSource
        )
        .map((s) => ({
          value: s.id,
          label: s.parentName ? `${s.parentName} / ${s.name}` : s.name,
        })),
    [sourceSessions, targetSessionId]
  );

  const handleSourceChange = (value: string | null) => {
    setSelectedSourceSessionId(value);
    onSourceSessionChange?.(value);
  };

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-sm text-gray-700">انتخاب دوره</label>
        <Select
          showSearch
          allowClear
          className="w-full"
          size="large"
          placeholder="دوره را جستجو یا انتخاب کنید"
          optionFilterProp="label"
          loading={coursesLoading}
          disabled={disabled || loading}
          value={selectedCourseId}
          options={courseOptions}
          onChange={(value) => setSelectedCourseId(value ?? null)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-gray-700">انتخاب جلسه (ویدیو دار)</label>
        {sessionsLoading && selectedCourseId ? (
          <div className="flex justify-center py-3">
            <Spin size="small" />
          </div>
        ) : (
          <Select
            showSearch
            allowClear
            className="w-full"
            size="large"
            placeholder={
              selectedCourseId
                ? 'جلسه مبدأ را انتخاب کنید'
                : 'ابتدا دوره را انتخاب کنید'
            }
            optionFilterProp="label"
            disabled={disabled || loading || !selectedCourseId}
            value={selectedSourceSessionId}
            options={sessionOptions}
            onChange={(value) => handleSourceChange(value ?? null)}
            notFoundContent={
              selectedCourseId ? 'جلسه‌ای با ویدیو در این دوره یافت نشد' : null
            }
          />
        )}
      </div>
    </>
  );
};
