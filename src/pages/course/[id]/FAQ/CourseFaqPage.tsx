import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Empty, Button, Collapse, Popconfirm, Space } from 'antd';
import { MessageCircleQuestion, Plus, Trash2 } from 'lucide-react';
import { useGetCourseById, useCourses } from "@/hooks";
import { CourseFaqModal } from './CourseFaqModal';
import type { CourseFaq } from '@/types/course.types';

export const CourseFaqPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: courseData, refetch } = useGetCourseById(id || '');
  const { updateCourse, isUpdating } = useCourses();

  const faqs = courseData?.faqs || [];

  const handleAddFaq = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleSubmitFaq = async (question: string, answer: string) => {
    if (!courseData || !id) return;

    // Create new FAQ with auto-calculated index
    const newFaq: CourseFaq = {
      index: faqs.length,
      question,
      answer,
    };

    // Merge with existing FAQs
    const updatedFaqs = [...faqs, newFaq];

    // Update course with new FAQs
    await updateCourse({
      id: courseData.id,
      faqs: updatedFaqs,
    });

    // Refresh course data
    await refetch();
    setModalOpen(false);
  };

  const handleDeleteFaq = async (indexToDelete: number) => {
    if (!courseData || !id) return;

    // Filter out the FAQ to delete
    const updatedFaqs = faqs
      .filter((faq) => faq.index !== indexToDelete)
      .map((faq, idx) => ({
        ...faq,
        index: idx, // Reindex remaining FAQs
      }));

    // Update course with filtered FAQs
    await updateCourse({
      id: courseData.id,
      faqs: updatedFaqs,
    });

    // Refresh course data
    await refetch();
  };

  // Create collapse items from FAQs
  const collapseItems = faqs.map((faq) => ({
    key: faq.index.toString(),
    label: (
      <div className="flex items-center justify-between w-full pr-2">
        <span className="font-medium">{faq.question}</span>
      </div>
    ),
    children: (
      <div>
        <p className="text-gray-700 mb-4">{faq.answer}</p>
        <div className="flex justify-end">
          <Popconfirm
            title="حذف سوال متداول"
            description="آیا از حذف این سوال متداول اطمینان دارید؟"
            onConfirm={() => handleDeleteFaq(faq.index)}
            okText="بله، حذف شود"
            cancelText="انصراف"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              loading={isUpdating}
            >
              حذف
            </Button>
          </Popconfirm>
        </div>
      </div>
    ),
  }));

  return (
    <div>
      <Card
        className="shadow-sm"
        extra={
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={handleAddFaq}
            className="shadow-md hover:shadow-lg transition-all"
            loading={isUpdating}
          >
            افزودن سوال جدید
          </Button>
        }
        title={
          <div className="flex items-center gap-2">
            <MessageCircleQuestion size={20} className="text-primary" />
            <span>سوالات متداول دوره</span>
          </div>
        }
      >
        {faqs.length > 0 ? (
          <Collapse
            items={collapseItems}
            defaultActiveKey={['0']}
            // className="bg-white"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageCircleQuestion size={64} className="text-gray-400 mb-4" />
            <Empty
              description={
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    سوالات متداول دوره
                  </p>
                  <p className="text-gray-500">
                    شناسه دوره: {id}
                  </p>
                  <p className="text-gray-400 mt-2">
                    در حال حاضر سوالات متداولی ثبت نشده است
                  </p>
                </div>
              }
            />
          </div>
        )}
      </Card>

      <CourseFaqModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmitFaq}
        loading={isUpdating}
      />
    </div>
  );
};
