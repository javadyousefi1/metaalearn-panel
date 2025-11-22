import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Select, Switch, Space } from 'antd';
import { BookOpen, Save } from 'lucide-react';
import { useGetBlogById, useBlogs, useGetAllBlogCategories } from '@/hooks';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import moment from 'moment-jalaali';
import DatePicker from '@/components/datePicker/DatePicker';

export const BlogInfoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fullTextValue, setFullTextValue] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const quillRef = useRef<ReactQuill>(null);

  const { data: blogData, isLoading: isBlogLoading, refetch } = useGetBlogById(id || '', !!id);
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetAllBlogCategories();
  const { createBlog, updateBlog, isCreating, isUpdating } = useBlogs();

  const isEditMode = !!id;
  const isLoading = isCategoriesLoading || isBlogLoading;
  const isSaving = isCreating || isUpdating;

  // Initialize form values when blog data is loaded
  useEffect(() => {
    if (blogData && isEditMode) {
      form.setFieldsValue({
        name: blogData.name || '',
        description: blogData.description || '',
        categoryId: blogData.categoryId || undefined,
        shortUrl: blogData.shortUrl || '',
        shortText: blogData.shortText || '',
        publishTime: blogData.publishTime
          ? moment(blogData.publishTime).format('YYYY-MM-DD HH:mm')
          : null,
        isDraft: blogData.isDraft ?? true,
        isActive: blogData.isActive ?? false,
      });
      setFullTextValue(blogData.fullText || '');
      setKeywords(blogData.keywords || []);
    }
  }, [blogData, form, isEditMode]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        shortUrl: values.shortUrl,
        shortText: values.shortText,
        fullText: fullTextValue,
        publishTime: values.publishTime
          ? moment(values.publishTime, 'YYYY-MM-DD HH:mm').toISOString()
          : moment().toISOString(),
        keywords: keywords,
      };

      if (isEditMode && id) {
        await updateBlog({
          id,
          ...payload,
          isDraft: values.isDraft ?? true,
          isActive: values.isActive ?? false,
        });
        await refetch();
      } else {
        await createBlog(payload);
        navigate('/blogs');
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // Quill editor modules configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        [{ 'direction': 'rtl' }],
        ['clean']
      ],
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
      <Card className="shadow-sm" loading>
        <div className="h-[400px]" />
      </Card>
    );
  }

  return (
    <Card
      className="shadow-sm"
      title={
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-primary" />
          <span>{isEditMode ? 'ویرایش اطلاعات مقاله' : 'اطلاعات مقاله جدید'}</span>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        size="large"
        requiredMark={false}
        disabled={isSaving}
      >
        <Form.Item
          name="name"
          label="عنوان مقاله"
          rules={[
            { required: true, message: 'لطفاً عنوان مقاله را وارد کنید' },
            { min: 3, message: 'عنوان باید حداقل ۳ کاراکتر باشد' },
          ]}
        >
          <Input placeholder="عنوان مقاله را وارد کنید" />
        </Form.Item>

        <Form.Item
          name="description"
          label="توضیحات"
          rules={[
            { required: true, message: 'لطفاً توضیحات را وارد کنید' },
            { min: 10, message: 'توضیحات باید حداقل ۱۰ کاراکتر باشد' },
          ]}
        >
          <Input.TextArea rows={3} placeholder="توضیحات مقاله" />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="دسته‌بندی"
          rules={[{ required: true, message: 'لطفاً دسته‌بندی را انتخاب کنید' }]}
        >
          <Select
            placeholder="انتخاب دسته‌بندی"
            showSearch
            optionFilterProp="children"
            loading={isCategoriesLoading}
          >
            {categories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="shortUrl"
          label="URL کوتاه"
          rules={[{ required: true, message: 'لطفاً URL کوتاه را وارد کنید' }]}
        >
          <Input placeholder="short-url" />
        </Form.Item>

        <Form.Item
          name="shortText"
          label="متن کوتاه (خلاصه)"
          rules={[
            { required: true, message: 'لطفاً متن کوتاه را وارد کنید' },
            { min: 20, message: 'متن کوتاه باید حداقل ۲۰ کاراکتر باشد' },
          ]}
        >
          <Input.TextArea rows={4} placeholder="خلاصه‌ای از مقاله..." />
        </Form.Item>

        <Form.Item label="کلمات کلیدی">
          <Select
            mode="tags"
            placeholder="کلمات کلیدی را وارد کرده و Enter بزنید"
            value={keywords}
            onChange={setKeywords}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <DatePicker
          showTime
          className="w-full"
          placeholder="زمان انتشار را انتخاب کنید"
          format="jYYYY/jMM/jDD HH:mm"
          label="زمان انتشار"
          isFormItem
          name="publishTime"
          isRequired
        />

        {isEditMode && (
          <Space size="large" className="mb-6">
            <Form.Item
              name="isDraft"
              label="پیش‌نویس"
              valuePropName="checked"
              className="mb-0"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="فعال"
              valuePropName="checked"
              className="mb-0"
            >
              <Switch />
            </Form.Item>
          </Space>
        )}

        <Form.Item label="متن کامل">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={fullTextValue}
            onChange={setFullTextValue}
            modules={modules}
            formats={formats}
            placeholder="متن کامل مقاله را اینجا بنویسید..."
            style={{ height: '400px', marginBottom: '50px' }}
          />
        </Form.Item>

        <div className="flex justify-end gap-3">
          <Button size="large" onClick={() => navigate('/blogs')}>
            انصراف
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<Save size={20} />}
            onClick={handleSubmit}
            loading={isSaving}
          >
            {isEditMode ? 'ذخیره تغییرات' : 'ایجاد مقاله'}
          </Button>
        </div>
      </Form>
    </Card>
  );
};
