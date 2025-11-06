import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Input, Button, message, Skeleton, Modal } from 'antd';
import { BookOpen, Save, Image as ImageIcon } from 'lucide-react';
import { useGetCourseById, useCourses } from "@/hooks";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const CourseIntroductionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [fullTextValue, setFullTextValue] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const quillRef = useRef<ReactQuill>(null);

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

      await refetch();
    } catch (error) {
      message.error('خطا در به‌روزرسانی معرفی دوره');
      console.error('Update error:', error);
    }
  };

  // Custom image handler
  const imageHandler = () => {
    setImageUrl('');
    setImageModalOpen(true);
  };

  // Insert image into editor
  const handleInsertImage = () => {
    if (!imageUrl.trim()) {
      message.error('لطفاً آدرس تصویر را وارد کنید');
      return;
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      message.error('آدرس تصویر نامعتبر است');
      return;
    }

    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      const position = range ? range.index : 0;
      quill.insertEmbed(position, 'image', imageUrl);
      quill.setSelection(position + 1, 0);
    }

    setImageModalOpen(false);
    setImageUrl('');
    message.success('تصویر با موفقیت درج شد');
  };

  // Quill editor modules configuration with custom image handler
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        [{ 'direction': 'rtl' }], // RTL support
        ['clean']
      ],
      handlers: {
        image: imageHandler,
      }
    },
  }), []);

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
              { min: 10, message: 'متن کوتاه باید حداقل 10 کاراکتر باشد' },
              { max: 3000, message: 'متن کوتاه نباید بیش از 3000 کاراکتر باشد' },
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
                ref={quillRef}
                theme="snow"
                value={fullTextValue}
                onChange={setFullTextValue}
                modules={modules}
                formats={formats}
                placeholder="توضیحات کامل دوره را در این قسمت وارد کنید..."
                style={{ minHeight: '400px', direction: 'rtl' }}
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

      {/* Image URL Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ImageIcon size={20} className="text-blue-500" />
            <span>درج تصویر از لینک</span>
          </div>
        }
        open={imageModalOpen}
        onOk={handleInsertImage}
        onCancel={() => setImageModalOpen(false)}
        okText="درج تصویر"
        cancelText="انصراف"
        centered
        destroyOnClose
      >
        <div className="py-4">
          <Form.Item

            label="آدرس تصویر (URL)"
          >
            <Input
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onPressEnter={handleInsertImage}
              size="large"
              prefix={<ImageIcon size={16} className="text-gray-400" />}
            />
          </Form.Item>

          {imageUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">پیش‌نمایش:</p>
              <div className="border rounded-lg p-2 bg-gray-50">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full h-auto max-h-48 mx-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = 'block';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
