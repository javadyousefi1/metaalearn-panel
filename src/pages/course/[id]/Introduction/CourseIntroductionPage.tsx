import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Input, Button, message, Skeleton } from 'antd';
import { BookOpen, Save } from 'lucide-react';
import { useGetCourseById, useCourses } from "@/hooks";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const CourseIntroductionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [fullTextValue, setFullTextValue] = useState('');

  const { data: courseData, isLoading, refetch } = useGetCourseById(id || '');
  const { updateCourse, isUpdating } = useCourses();

  // Initialize form values when course data is loaded
  useEffect(() => {
    if (courseData) {
      form.setFieldsValue({
        shortText: courseData.shortText || '',
      });
      setFullTextValue(courseData.fullText || '');
    }
  }, [courseData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!courseData || !id) {
        message.error('اطلاعات دوره یافت نشد');
        return;
      }

      await updateCourse({
        id: courseData.id,
        shortText: values.shortText,
        fullText: fullTextValue,
      });

      message.success('معرفی دوره با موفقیت به‌روزرسانی شد');
      await refetch();
    } catch (error) {
      message.error('خطا در به‌روزرسانی معرفی دوره');
      console.error('Update error:', error);
    }
  };

  // Quill editor modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      [{ 'direction': 'rtl' }], // RTL support
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'color', 'background',
    'link', 'image',
    'direction'
  ];

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <Skeleton active />
      </Card>
    );
  }

  return (
    <div>
      <Card
        className="shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-blue-500" />
            <span>معرفی دوره</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<Save size={18} />}
            onClick={handleSubmit}
            loading={isUpdating}
            className="shadow-md hover:shadow-lg transition-all"
          >
            ذخیره تغییرات
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          size="large"
          disabled={isUpdating}
        >
          {/* Short Text - Simple Input */}
          <Form.Item
            name="shortText"
            label="متن کوتاه (خلاصه)"
            rules={[
              { required: true, message: 'لطفاً متن کوتاه را وارد کنید' },
              { min: 10, message: 'متن کوتاه باید حداقل ۱۰ کاراکتر باشد' },
              { max: 500, message: 'متن کوتاه نباید بیش از ۵۰۰ کاراکتر باشد' },
            ]}
            extra="این متن به عنوان خلاصه‌ای از دوره نمایش داده می‌شود"
          >
            <Input.TextArea
              rows={3}
              placeholder="خلاصه‌ای از دوره را در این قسمت وارد کنید"
              showCount
              maxLength={500}
            />
          </Form.Item>

          {/* Full Text - Rich Text Editor */}
          <Form.Item
            label="متن کامل (توضیحات جامع)"
            required
          >
            <div className="rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={fullTextValue}
                onChange={setFullTextValue}
                modules={modules}
                formats={formats}
                placeholder="توضیحات کامل دوره را در این قسمت وارد کنید..."
                style={{ minHeight: '300px', direction: 'rtl' }}
              />
            </div>
            {!fullTextValue && (
              <div className="text-red-500 text-sm mt-1">
                لطفاً متن کامل را وارد کنید
              </div>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
