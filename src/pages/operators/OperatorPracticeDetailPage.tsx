import React, { useState } from "react";
import {
  Tag,
  Avatar,
  Button,
  InputNumber,
  Modal,
  Space,
  message,
  Popconfirm,
  Input,
} from "antd";
import { Home, UserCircle, Download, Edit2, RotateCcw } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, DataTable, CourseSessionFilter } from "@/components/common";
import { useTable, useTableFilters } from "@/hooks";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { practiceService, courseService } from "@/services";
import { PracticeSubmission } from "@/types";
import { formatDate } from "@/utils";
import { ROUTES } from "@/constants";
import { useGetAllSessions } from "@/hooks/useCourseSessions";


/**
 * OperatorPracticeDetailPage Component - Display practice submissions for a course
 */
export const OperatorPracticeDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedPractice, setSelectedPractice] =
    useState<PracticeSubmission | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  // Table filters
  const { filters, setFilter, resetFilters } = useTableFilters({
    CourseSessionId: null,
  });

  // Fetch course details
  const { data: courseData } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getById(courseId!),
    enabled: !!courseId,
  });

  // Fetch course sessions for filter
  const { data: courseSessions = [], isLoading: isLoadingSessions } = useGetAllSessions(
    !!courseId,
      {courseId,isPracticeAvailable:true}
  );

  // Flatten nested subsessions (up to 2 levels deep) and filter by isPracticeAvailable and !isTopic
  const flatCourseSessionsHasParctive = React.useMemo(() => {
    const result: any[] = [];

    courseSessions.forEach(session => {
      // Check parent session
      if (!session.isTopic && session.isPracticeAvailable) {
        result.push(session);
      }

      // Check first level subsessions
      if (session.subSessions && Array.isArray(session.subSessions)) {
        session.subSessions.forEach(subSession => {
          if (!subSession.isTopic && subSession.isPracticeAvailable) {
            result.push(subSession);
          }

          // Check second level subsessions
          if (subSession.subSessions && Array.isArray(subSession.subSessions)) {
            subSession.subSessions.forEach(nestedSubSession => {
              if (!nestedSubSession.isTopic && nestedSubSession.isPracticeAvailable) {
                result.push(nestedSubSession);
              }
            });
          }
        });
      }
    });

    return result;
  }, [courseSessions]);

  // Fetch practice submissions using useTable
  const {
    data: practices,
    totalCount,
    isLoading,
    pagination,
  } = useTable<PracticeSubmission>({
    queryKey: ["practices", courseId, filters],
    fetchFn: (params) =>
      practiceService.getAll({
        CourseId: courseId!,
        ...filters,
        ...params,
      }),
    initialPageSize: 20,
    initialPageIndex: 1,
    enabled: !!courseId,
  });

  // Update grade mutation
  const updateGradeMutation = useMutation({
    mutationFn: practiceService.updateGrade,
    onSuccess: () => {
      message.success("نمره با موفقیت ثبت شد");
      queryClient.invalidateQueries({ queryKey: ["practices", courseId] });
      handleCloseModal();
    },
    onError: () => {
      message.error("خطا در ثبت نمره");
    },
  });

  // Reset grade mutation
  const resetGradeMutation = useMutation({
    mutationFn: practiceService.resetGrade,
    onSuccess: () => {
      message.success("نمره با موفقیت حذف شد");
      queryClient.invalidateQueries({ queryKey: ["practices", courseId] });
    },
    onError: () => {
      message.error("خطا در حذف نمره");
    },
  });

  const handleOpenGradeModal = (practice: PracticeSubmission) => {
    setSelectedPractice(practice);
    setGrade(practice.grade || null);
    setFeedback(practice.feedback || "");
    setGradeModalOpen(true);
  };

  const handleCloseModal = () => {
    setGradeModalOpen(false);
    setSelectedPractice(null);
    setGrade(null);
    setFeedback("");
  };

  const handleSubmitGrade = () => {
    if (!selectedPractice) return;

    if (grade === null || grade < 0 || grade > 100) {
      message.error("نمره باید بین 0 تا 100 باشد");
      return;
    }

    if (!feedback || feedback.trim() === "") {
      message.error("بازخورد الزامی است");
      return;
    }

    updateGradeMutation.mutate({
      id: selectedPractice.id,
      grade,
      feedback,
    });
  };

  const handleResetGrade = (practiceId: string) => {
    resetGradeMutation.mutate(practiceId);
  };

  const columns: ColumnsType<PracticeSubmission> = [
    {
      title: "دانشجو",
      dataIndex: "student",
      key: "user",
      render: (userInfo: PracticeSubmission["userInfo"]) => (
        <div className="flex items-center gap-2">
          {userInfo?.imageUrl ? (
            <Avatar size={32} src={userInfo.imageUrl} />
          ) : (
            <Avatar
              size={32}
              icon={<UserCircle />}
              style={{ backgroundColor: "#4B26AD" }}
            />
          )}
          <span className="font-medium">
            {userInfo?.fullNameFa || "بدون نام"}
          </span>
        </div>
      ),
    },
      {
          title: "نام جلسه",
          dataIndex: "courseSession",
          key: "courseSession",
          render: (courseSession: string | undefined) => <span>{courseSession?.name}</span>
      },
    {
      title: "فایل تمرین",
      dataIndex: "practiceFileUrl",
      key: "practiceFileUrl",
      align: "center",
      render: (practiceFileUrl: string | undefined) =>
        practiceFileUrl ? (
          <a
            href={practiceFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button type="link" icon={<Download size={16} />} size="small">
              دانلود
            </Button>
          </a>
        ) : (
          <span className="text-gray-400 text-sm">بدون فایل</span>
        ),
    },
    {
      title: "تاریخ آپلود",
      dataIndex: "uploadedTime",
      key: "uploadedTime",
      render: (uploadedTime: string | undefined) =>
        uploadedTime ? (
          <span className="text-sm">{formatDate(uploadedTime)}</span>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        ),
    },
    {
      title: "نمره",
      dataIndex: "grade",
      key: "grade",
      align: "center",
      render: (grade: number | null | undefined) =>
        grade !== null && grade !== undefined ? (
          <Tag color={grade >= 50 ? "green" : "red"} className="text-base">
            {grade}
          </Tag>
        ) : (
          <span className="text-gray-400 text-sm">بدون نمره</span>
        ),
    },
    {
      title: "بازخورد",
      dataIndex: "feedback",
      key: "feedback",
      render: (feedback: string | undefined) =>
        feedback ? (
          <span className="text-sm">{feedback}</span>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        ),
    },
      {
          title: "بازخورد",
          dataIndex: "notes",
          key: "notes",
          render: (notes: string | undefined) =>
              notes ? (
                  <span className="text-sm">{notes}</span>
              ) : (
                  <span className="text-gray-400 text-sm">-</span>
              ),
      },
    {
      title: "عملیات",
      key: "actions",
      align: "center",
      render: (_, record: PracticeSubmission) => (
        <Space>
          {record.grade === null || record.grade === undefined ? (
            <Button
              type="primary"
              size="small"
              icon={<Edit2 size={16} />}
              onClick={() => handleOpenGradeModal(record)}
            >
              ثبت نمره
            </Button>
          ) : (
            <Popconfirm
              title="حذف نمره"
              description="آیا از حذف نمره این تمرین اطمینان دارید؟"
              onConfirm={() => handleResetGrade(record.id)}
              okText="بله"
              cancelText="خیر"
            >
              <Button
                danger
                size="small"
                icon={<RotateCcw size={16} />}
                loading={resetGradeMutation.isPending}
              >
                حذف نمره
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title={`تمرین‌های ${courseData?.name || "دوره"}`}
        description="مشاهده و مدیریت تمرین‌های دانشجویان"
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
            title: "اپراتور",
          },
          {
            title: (
              <span
                className="cursor-pointer hover:text-purple-600"
                onClick={() => navigate(ROUTES.OPERATORS.PRACTICES)}
              >
                تمرین‌ها
              </span>
            ),
          },
          {
            title: courseData?.name || "دوره",
          },
        ]}
      />

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4">
          <CourseSessionFilter
            value={filters.CourseSessionId as string}
            onChange={(value) => setFilter('CourseSessionId', value)}
            sessions={flatCourseSessionsHasParctive}
            loading={isLoadingSessions}
          />
        </div>
      </div>

      <DataTable<PracticeSubmission>
        columns={columns}
        dataSource={practices}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ تمرینی برای این دوره یافت نشد"
        itemName="تمرین"
        tableProps={{
          scroll: { x: 1200 },
        }}
      />

      {/* Grade Modal */}
      <Modal
        title={`ثبت نمره - ${selectedPractice?.student?.fullNameFa}`}
        open={gradeModalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmitGrade}
        okText="ثبت نمره"
        cancelText="انصراف"
        confirmLoading={updateGradeMutation.isPending}
        width={600}
      >
        <div className="flex flex-col gap-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              نمره (0-100)
            </label>
            <InputNumber
              min={0}
              max={100}
              value={grade}
              onChange={(value) => setGrade(value)}
              className="w-full"
              placeholder="نمره را وارد کنید"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              بازخورد <span className="text-red-500">*</span>
            </label>
            <Input.TextArea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="بازخورد خود را وارد کنید"
              rows={4}
              required
            />
          </div>

          {selectedPractice?.practiceFileUrl && (
            <div className="mt-2">
              <a
                href={selectedPractice.practiceFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
              >
                <Download size={16} />
                دانلود فایل تمرین
              </a>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
