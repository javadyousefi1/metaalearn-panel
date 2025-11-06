import React, { useState, useEffect } from 'react';
import { Modal, Form, Upload, Select, Alert, message as antMessage } from 'antd';
import { Upload as UploadIcon, Image, Video } from 'lucide-react';
import type { UploadFile } from 'antd/es/upload/interface';
import { useCourseGallery } from '@/hooks';
import {
  CourseGalleryItem,
  GalleryCategory,
  GalleryType,
  UploadCourseGalleryRequestType,
  getGalleryCategoryName,
} from '@/types';

interface CourseGalleryUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  courseId: string;
  editingItem?: CourseGalleryItem | null;
}

export const CourseGalleryUploadModal: React.FC<CourseGalleryUploadModalProps> = ({
  open,
  onClose,
  onSuccess,
  courseId,
  editingItem,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [detectedType, setDetectedType] = useState<GalleryType | null>(null);

  const { uploadGallery, isUploading } = useCourseGallery(courseId);

  // Initialize form when editing
  useEffect(() => {
    if (editingItem && open) {
      form.setFieldsValue({
        category: editingItem.category,
      });
      setDetectedType(editingItem.type);
    } else {
      form.resetFields();
      setFileList([]);
      setDetectedType(null);
    }
  }, [editingItem, open, form]);

  // Auto-detect file type based on file extension
  const detectFileType = (file: File): GalleryType => {
    const fileName = file.name.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv'];

    if (imageExtensions.some(ext => fileName.endsWith(ext))) {
      return GalleryType.Image;
    } else if (videoExtensions.some(ext => fileName.endsWith(ext))) {
      return GalleryType.Video;
    }

    // Default to image if can't detect
    return GalleryType.Image;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (fileList.length === 0) {
        antMessage.error('لطفاً یک فایل انتخاب کنید');
        return;
      }

      const file = fileList[0].originFileObj as File;
      const type = detectedType ?? detectFileType(file);

      await uploadGallery({
        courseId,
        category: values.category,
        type,
        requestType: editingItem
          ? UploadCourseGalleryRequestType.Update
          : UploadCourseGalleryRequestType.Create,
        file,
      });

      await onSuccess();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setDetectedType(null);
    onClose();
  };

  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const file = newFileList[0].originFileObj as File;
      const type = detectFileType(file);
      setDetectedType(type);
    } else {
      setDetectedType(null);
    }
  };

  const beforeUpload = (file: File) => {
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      antMessage.error('حجم فایل نباید بیشتر از 50 مگابایت باشد!');
    }
    return false; // Prevent auto upload
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UploadIcon size={20} className="text-primary" />
          <span className="text-xl font-bold">
            {editingItem ? 'جایگزینی فایل' : 'افزودن فایل جدید'}
          </span>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={editingItem ? 'جایگزینی' : 'آپلود'}
      cancelText="انصراف"
      confirmLoading={isUploading}
      width={600}
      centered
      destroyOnClose
    >
      <div className="py-4">
        {editingItem && (
          <Alert
            message="حالت جایگزینی"
            description="فایل جدید جایگزین فایل فعلی خواهد شد"
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={isUploading}
        >
          {/* File Upload */}
          <Form.Item
            label="انتخاب فایل"
            required
            extra="فرمت‌های مجاز: تصویر (JPG, PNG, GIF, WEBP) یا ویدیو (MP4, WEBM, MOV) - حداکثر 50MB"
          >
            <Upload.Dragger
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              maxCount={1}
              accept="image/*,video/*"
            >
              <p className="ant-upload-drag-icon">
                <UploadIcon size={48} className="mx-auto text-primary" />
              </p>
              <p className="ant-upload-text">فایل را بکشید و اینجا رها کنید</p>
              <p className="ant-upload-hint">یا کلیک کنید تا فایل را انتخاب کنید</p>
            </Upload.Dragger>
          </Form.Item>

          {/* Auto-detected type display */}
          {detectedType !== null && (
            <Alert
              message={
                <div className="flex items-center gap-2">
                  {detectedType === GalleryType.Image ? (
                    <Image size={16} />
                  ) : (
                    <Video size={16} />
                  )}
                  <span>
                    نوع فایل تشخیص داده شده: {detectedType === GalleryType.Image ? 'تصویر' : 'ویدیو'}
                  </span>
                </div>
              }
              type="success"
              showIcon={false}
              className="mb-4"
            />
          )}

          {/* Category Selection */}
          <Form.Item
            name="category"
            label="دسته‌بندی"
            rules={[
              { required: true, message: 'لطفاً دسته‌بندی را انتخاب کنید' },
            ]}
            extra="انتخاب کنید که این فایل در کدام بخش استفاده شود"
          >
            <Select
              placeholder="انتخاب دسته‌بندی"
              options={[
                {
                  label: getGalleryCategoryName(GalleryCategory.Cover),
                  value: GalleryCategory.Cover,
                },
                {
                  label: getGalleryCategoryName(GalleryCategory.Content),
                  value: GalleryCategory.Content,
                },
                {
                  label: getGalleryCategoryName(GalleryCategory.Thumbnail),
                  value: GalleryCategory.Thumbnail,
                },
              ]}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
