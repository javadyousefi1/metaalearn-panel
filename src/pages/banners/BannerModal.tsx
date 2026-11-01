import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Alert,
  Image,
  Button,
  Divider,
  Tag,
} from 'antd';
import { Upload as UploadIcon, PanelTop } from 'lucide-react';
import type { UploadFile } from 'antd';
import { BannerBackgroundColorField } from '@/components/banners/BannerBackgroundColorField';
import { BannerPublishSwitch } from '@/components/banners/BannerPublishSwitch';
import { BannerStripPreview } from '@/components/banners/BannerStripPreview';
import { bannerService } from '@/services';
import { parseBannerBackgroundColor } from '@/utils/banner.utils';
import {
  Banner,
  BannerType,
  CreateBannerPayload,
  UpdateBannerPayload,
  DEFAULT_BANNER_BACKGROUND_COLOR,
  getBannerTypeColor,
  getBannerTypeLabel,
} from '@/types/banner.types';

interface BannerModalProps {
  open: boolean;
  banner: Banner | null;
  onClose: () => void;
  onCreate: (payload: CreateBannerPayload) => Promise<void>;
  onUpdate: (payload: UpdateBannerPayload) => Promise<void>;
  loading: boolean;
}

export const BannerModal: React.FC<BannerModalProps> = ({
  open,
  banner,
  onClose,
  onCreate,
  onUpdate,
  loading,
}) => {
  const [form] = Form.useForm();
  const isEditMode = !!banner;
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const bannerType = Form.useWatch('type', form) as BannerType | undefined;
  const linkUrl = Form.useWatch('linkUrl', form) as string | undefined;
  const isDraft = Form.useWatch('isDraft', form) as boolean | undefined;
  const backgroundColor =
    (Form.useWatch('backgroundColor', form) as string | undefined) ??
    DEFAULT_BANNER_BACKGROUND_COLOR;
  const previewText = Form.useWatch('text', form) as string | undefined;
  const previewLinkText = Form.useWatch('linkText', form) as string | undefined;

  useEffect(() => {
    if (open && banner) {
      form.setFieldsValue({
        type: banner.type,
        text: banner.text,
        linkUrl: banner.linkUrl ?? undefined,
        linkText: banner.linkText ?? undefined,
        isDraft: banner.isDraft ?? true,
        backgroundColor: banner.backgroundColor || DEFAULT_BANNER_BACKGROUND_COLOR,
      });
      setImageUrl(banner.imageUrl ?? null);
      setFileList([]);
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({
        type: BannerType.Promotional,
        isDraft: true,
        backgroundColor: DEFAULT_BANNER_BACKGROUND_COLOR,
      });
      setImageUrl(null);
      setFileList([]);
    }
  }, [open, banner, form]);

  const handleUpload = async (file: File) => {
    const type = form.getFieldValue('type') as BannerType;
    if (!type) {
      return false;
    }

    setUploading(true);
    try {
      const result = await bannerService.uploadImage(file, type);
      setImageUrl(result.imageUrl);
      setFileList([
        {
          uid: '-1',
          name: file.name,
          status: 'done',
        },
      ]);
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setFileList([]);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const linkUrlValue = values.linkUrl?.trim() || null;
      const linkTextValue = values.linkText?.trim() || null;
      const bgColor = parseBannerBackgroundColor(values.backgroundColor);

      if (isEditMode && banner) {
        const payload: UpdateBannerPayload = {
          id: banner.id,
          type: values.type,
          text: values.text?.trim(),
          linkUrl: linkUrlValue,
          linkText: linkTextValue,
          isDraft: values.isDraft ?? true,
          backgroundColor: bgColor,
        };

        if (imageUrl !== (banner.imageUrl ?? null)) {
          if (imageUrl) {
            payload.imageUrl = imageUrl;
          } else {
            payload.clearImageUrl = true;
          }
        }

        await onUpdate(payload);
      } else {
        await onCreate({
          type: values.type,
          imageUrl: imageUrl ?? null,
          backgroundColor: bgColor,
          text: values.text.trim(),
          linkUrl: linkUrlValue,
          linkText: linkTextValue,
        });
      }

      onClose();
    } catch {
      // validation or API error
    }
  };

  const previewLink =
    linkUrl?.trim() && previewLinkText?.trim() ? previewLinkText.trim() : undefined;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <PanelTop size={20} style={{ color: '#4B26AD' }} />
          <span>{isEditMode ? 'ویرایش بنر' : 'ایجاد بنر جدید'}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEditMode ? 'ذخیره تغییرات' : 'ایجاد'}
      cancelText="انصراف"
      confirmLoading={loading || uploading}
      width={640}
      centered
      destroyOnClose
      className="banner-form-modal"
      styles={{
        body: {
          paddingTop: 8,
          paddingBottom: 8,
          overflow: 'visible',
        },
      }}
    >
      <div className="min-w-0 overflow-x-hidden">
        <Form form={form} layout="vertical" size="middle" requiredMark="optional">
          {!isEditMode && (
            <Alert
              type="info"
              showIcon
              className="mb-4"
              message="بنر جدید به‌صورت پیش‌نویس ذخیره می‌شود. پس از ایجاد، برای نمایش در سایت آن را منتشر کنید."
            />
          )}

          {isEditMode && banner && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Tag color={getBannerTypeColor(banner.type)}>{getBannerTypeLabel(banner.type)}</Tag>
              <Tag color={banner.isDraft ? 'default' : 'success'}>
                {banner.isDraft ? 'پیش‌نویس' : 'منتشر شده'}
              </Tag>
            </div>
          )}

          <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50/60 p-3">
            <BannerStripPreview
              backgroundColor={backgroundColor}
              imageUrl={imageUrl}
              text={previewText?.trim() || 'متن بنر در اینجا نمایش داده می‌شود'}
              linkText={previewLink}
              className="mb-0"
            />
          </div>

          <Divider plain className="!my-3 !text-xs !text-gray-500">
            محتوا
          </Divider>

          <Form.Item
            name="text"
            label="متن بنر"
            rules={[
              { required: true, message: 'متن بنر الزامی است' },
              { max: 2000, message: 'حداکثر ۲۰۰۰ کاراکتر' },
            ]}
          >
            <Input.TextArea
              rows={2}
              showCount
              maxLength={2000}
              placeholder="متن نمایش‌داده‌شده روی نوار بالای سایت"
            />
          </Form.Item>

          <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-5">
            <Form.Item
              className="mb-3 sm:col-span-3"
              name="linkUrl"
              label="آدرس لینک"
              rules={[{ max: 2000 }]}
            >
              <Input placeholder="https://..." dir="ltr" className="font-mono text-sm" />
            </Form.Item>
            <Form.Item
              className="mb-3 sm:col-span-2"
              name="linkText"
              label="متن دکمه"
              rules={[
                { max: 500 },
                {
                  validator: async (_, value) => {
                    if (linkUrl?.trim() && !value?.trim()) {
                      throw new Error('با تعیین لینک، متن دکمه الزامی است');
                    }
                  },
                },
              ]}
            >
              <Input placeholder="مثال: مشاهده" disabled={!linkUrl?.trim()} />
            </Form.Item>
          </div>

          <Divider plain className="!my-3 !text-xs !text-gray-500">
            ظاهر
          </Divider>

          <Form.Item
            className="mb-3 sm:max-w-[280px]"
            name="type"
            label="نوع بنر"
            rules={[{ required: true, message: 'نوع بنر را انتخاب کنید' }]}
          >
            <Select
              options={[
                {
                  value: BannerType.Promotional,
                  label: getBannerTypeLabel(BannerType.Promotional),
                },
                {
                  value: BannerType.Announcement,
                  label: getBannerTypeLabel(BannerType.Announcement),
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="backgroundColor"
            label="رنگ پس‌زمینه"
            rules={[{ required: true, message: 'رنگ پس‌زمینه را انتخاب کنید' }]}
          >
            <BannerBackgroundColorField />
          </Form.Item>

          <Form.Item label="تصویر پس‌زمینه" className="!mb-2">
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <Upload
                    accept="image/*"
                    maxCount={1}
                    fileList={fileList}
                    beforeUpload={handleUpload}
                    onRemove={() => {
                      handleRemoveImage();
                    }}
                    disabled={!bannerType || uploading}
                  >
                    <Button
                      icon={<UploadIcon size={16} />}
                      loading={uploading}
                      disabled={!bannerType}
                    >
                      آپلود تصویر
                    </Button>
                  </Upload>
                  {imageUrl && (
                    <Button type="link" danger onClick={handleRemoveImage} className="px-1">
                      حذف تصویر
                    </Button>
                  )}
                </div>
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt="پیش‌نمایش تصویر بنر"
                    className="max-h-24 max-w-full rounded-lg object-cover sm:max-w-[200px]"
                  />
                )}
              </div>
              <p className="mb-0 mt-2 text-xs text-gray-500">
                اختیاری — روی رنگ پس‌زمینه (پیشنهاد: ۱۹۲۰×۱۲۰).
              </p>
            </div>
          </Form.Item>

          {isEditMode && (
            <>
              <Divider plain className="!my-3 !text-xs !text-gray-500">
                انتشار
              </Divider>

              <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-0 font-medium text-gray-800">نمایش در سایت</p>
                  <p className="mb-0 text-xs text-gray-500">
                    فقط یک بنر می‌تواند هم‌زمان منتشر باشد.
                  </p>
                </div>
                <Form.Item name="isDraft" noStyle>
                  <BannerPublishSwitch />
                </Form.Item>
              </div>

              {!isDraft && (
                <Alert
                  type="warning"
                  showIcon
                  className="!mt-2 !py-2"
                  message="بنر منتشرشدهٔ قبلی (در صورت وجود) باید به پیش‌نویس برگردد."
                />
              )}
            </>
          )}
        </Form>
      </div>
    </Modal>
  );
};
