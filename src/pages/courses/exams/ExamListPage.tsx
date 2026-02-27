import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tag, Tooltip, Popconfirm, Card, Table } from 'antd';
import { Home, Plus, Edit, Trash2, ArrowRight } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/common';
import { useGetAllExams, useExams } from '@/hooks';
import { CredentialExam } from '@/types/exam.types';
import { CredentialExamType } from '@/enums';
import { ROUTES } from '@/constants';
import { ExamModal } from './ExamModal';

const examTypeColorMap: Record<number, string> = {
  0: 'default',
  1: 'blue',
  2: 'red',
};

export const ExamListPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<CredentialExam | null>(null);

  const {
    data: exams = [],
    isLoading,
    refetch,
  } = useGetAllExams({ CourseId: courseId || '' }, !!courseId);

  const { createExam, updateExam, deleteExam, isCreating, isUpdating, isDeleting } = useExams();

  const handleAddExam = () => {
    setEditingExam(null);
    setModalOpen(true);
  };

  const handleEditExam = (exam: CredentialExam) => {
    setEditingExam(exam);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingExam(null);
  };

  const handleSubmit = async (values: any) => {
    if (!courseId) return;

    const questions = (values.questions || []).map((q: any, idx: number) => ({
      index: idx,
      questionText: q.questionText,
      answers: [q.answer0, q.answer1, q.answer2, q.answer3],
      correctAnswerIndex: q.correctAnswerIndex,
    }));

    const occurrenceStartTime = values.hasOccurrenceTimeWindow && values.occurrenceStartTime
      ? values.occurrenceStartTime.toISOString?.() || values.occurrenceStartTime
      : new Date().toISOString();

    const occurrenceEndTime = values.hasOccurrenceTimeWindow && values.occurrenceEndTime
      ? values.occurrenceEndTime.toISOString?.() || values.occurrenceEndTime
      : new Date().toISOString();

    if (editingExam) {
      await updateExam({
        id: editingExam.id,
        courseScheduleIds: values.courseScheduleIds || [],
        questions,
        isCountedInDegree: values.isCountedInDegree,
        timeWindowLimit: values.timeWindowLimit,
        hasOccurrenceTimeWindow: values.hasOccurrenceTimeWindow,
        occurrenceStartTime,
        occurrenceEndTime,
        examType: values.examType ?? null,
        description: values.description,
      });
    } else {
      await createExam({
        courseId,
        courseScheduleIds: values.courseScheduleIds || [],
        questions,
        isCountedInDegree: values.isCountedInDegree,
        timeWindowLimit: values.timeWindowLimit,
        hasOccurrenceTimeWindow: values.hasOccurrenceTimeWindow,
        occurrenceStartTime,
        occurrenceEndTime,
        examType: values.examType,
        description: values.description,
      });
    }

    await refetch();
    handleModalClose();
  };

  const handleDelete = async (id: string) => {
    await deleteExam(id);
    await refetch();
  };

  const columns: ColumnsType<CredentialExam> = [
    {
      title: 'عنوان آزمون',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <span className="font-medium">{text || '—'}</span>,
    },
    {
      title: 'نوع',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      render: (type: number) => (
        <Tag color={examTypeColorMap[type] || 'default'}>
          {CredentialExamType[type as keyof typeof CredentialExamType] || `نوع ${type}`}
        </Tag>
      ),
    },
    {
      title: 'گروه‌بندی‌ها',
      dataIndex: 'schedules',
      key: 'schedules',
      align: 'center',
      render: (schedules: any[]) => (
        <Tag color="purple">{schedules?.length || 0} گروه</Tag>
      ),
    },
    {
      title: 'تعداد سوالات',
      dataIndex: 'questions',
      key: 'questions',
      align: 'center',
      render: (questions: any[]) => (
        <Tag color="blue">{questions?.length || 0} سوال</Tag>
      ),
    },
    {
      title: 'در نمره',
      dataIndex: 'isCountedInDegree',
      key: 'isCountedInDegree',
      align: 'center',
      render: (value: boolean) =>
        value ? <Tag color="green">بله</Tag> : <Tag color="default">خیر</Tag>,
    },
    {
      title: 'عملیات',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_: any, record: CredentialExam) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip title="ویرایش">
            <Button
              type="text"
              icon={<Edit size={18} />}
              onClick={() => handleEditExam(record)}
              className="hover:bg-blue-50 hover:text-blue-600"
            />
          </Tooltip>
          <Tooltip title="حذف">
            <Popconfirm
              title="حذف آزمون"
              description="آیا از حذف این آزمون اطمینان دارید؟"
              onConfirm={() => handleDelete(record.id)}
              okText="بله، حذف شود"
              cancelText="انصراف"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<Trash2 size={18} />}
                loading={isDeleting}
                className="hover:bg-red-50"
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="آزمون‌های دوره"
        description="مشاهده و مدیریت آزمون‌های این دوره"
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
            title: 'دوره‌ها',
          },
          {
            title: (
              <span
                className="cursor-pointer hover:text-primary"
                onClick={() => navigate(ROUTES.COURSES.EXAMS.ROOT)}
              >
                آزمون‌ها
              </span>
            ),
          },
          {
            title: 'آزمون‌های دوره',
          },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowRight size={18} />}
              onClick={() => navigate(ROUTES.COURSES.EXAMS.ROOT)}
            >
              بازگشت
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<Plus size={20} />}
              onClick={handleAddExam}
              loading={isCreating}
              className="shadow-lg hover:shadow-xl transition-all"
            >
              افزودن آزمون
            </Button>
          </div>
        }
      />

      <Card className="shadow-sm">
        <Table<CredentialExam>
          columns={columns}
          dataSource={exams}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'هیچ آزمونی برای این دوره ثبت نشده است' }}
        />
      </Card>

      <ExamModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        loading={isCreating || isUpdating}
        exam={editingExam}
        courseId={courseId || ''}
      />
    </div>
  );
};
