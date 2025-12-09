import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Input, Button, message, Skeleton, Modal } from 'antd';
import { BookOpen, Save } from 'lucide-react';
import { useGetCourseById, useCourses } from "@/hooks";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CourseGallerySelectModal } from './CourseGallerySelectModal';

export const CourseIntroductionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [fullTextValue, setFullTextValue] = useState('');
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [htmlInput, setHtmlInput] = useState('');
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

  // Custom image handler - Opens gallery modal
  const imageHandler = () => {
    setGalleryModalOpen(true);
  };

  // Insert selected image from gallery into editor
  const handleSelectImage = (imageUrl: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      const position = range ? range.index : 0;
      quill.insertEmbed(position, 'image', imageUrl);
      quill.setSelection(position + 1, 0);
      message.success('تصویر با موفقیت درج شد');
    }
  };

  // Custom HTML insertion handler
  const htmlHandler = () => {
    setHtmlModalOpen(true);
    setHtmlInput('');
  };

  // Insert HTML into editor
  const handleInsertHtml = () => {
    const quill = quillRef.current?.getEditor();
    if (quill && htmlInput.trim()) {
      try {
        const range = quill.getSelection();
        const position = range ? range.index : quill.getLength();

        // Use dangerouslyPasteHTML to insert HTML at cursor position
        quill.clipboard.dangerouslyPasteHTML(position, htmlInput);

        // Move cursor to end of inserted content
        quill.setSelection(position + 1, 0);

        message.success('HTML با موفقیت درج شد');
        setHtmlModalOpen(false);
        setHtmlInput('');
      } catch (error) {
        message.error('خطا در پردازش HTML');
        console.error('HTML insertion error:', error);
      }
    }
  };

  // Quill editor modules configuration with custom image handler
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        [{ 'direction': 'rtl' }], // RTL support
        ['clean']
      ],
      handlers: {
        image: imageHandler,
      }
    },
    clipboard: {
      // Allow pasted HTML content
      matchVisual: false,
    },
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'align',
    'link', 'image', 'video',
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
            <BookOpen size={20} className="text-primary" />
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
            label={
              <div className="flex items-center justify-between w-full">
                <span>متن کامل (توضیحات جامع)</span>
                <Button
                  type="link"
                  size="small"
                  onClick={htmlHandler}
                  className="text-blue-500"
                >
                  درج HTML
                </Button>
              </div>
            }
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

      {/* Gallery Selection Modal */}
      <CourseGallerySelectModal
        open={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        onSelect={handleSelectImage}
        courseId={id || ''}
      />

      {/* HTML Input Modal */}
      <Modal
        title="درج HTML"
        open={htmlModalOpen}
        onOk={handleInsertHtml}
        onCancel={() => {
          setHtmlModalOpen(false);
          setHtmlInput('');
        }}
        okText="درج"
        cancelText="انصراف"
        width={600}
      >
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            کد HTML خود را در زیر وارد کنید. این کد به فرمت مناسب تبدیل و در ویرایشگر درج خواهد شد.
          </p>
          <Input.TextArea
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder="<h1>عنوان</h1>&#10;<p>متن شما...</p>"
            rows={10}
            style={{ fontFamily: 'monospace' }}
          />
        </div>
      </Modal>
    </div>
  );
};
