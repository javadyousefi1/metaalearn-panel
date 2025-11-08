import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Empty, Button, Tag, Popconfirm, Spin } from 'antd';
import { Image as ImageIcon, Video, Plus, Trash2 } from 'lucide-react';
import { useGetCourseGallery, useCourseGallery } from '@/hooks';
import { CourseGalleryUploadModal } from './CourseGalleryUploadModal';
import {
  CourseGalleryItem,
  GalleryType,
  getGalleryCategoryName,
  getGalleryCategoryColor,
  getGalleryTypeName,
} from '@/types';

export const CourseGalleryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseGalleryItem | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const { data: galleryItems = [], refetch, isLoading } = useGetCourseGallery(
    {
      CourseId: id || '',
      PageIndex: 1,
      PageSize: 99999, // Hardcoded large page size as requested
    }
  );

  const { deleteGallery, isDeleting } = useCourseGallery(id);

  const handleAddItem = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEditItem = (item: CourseGalleryItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSuccess = async () => {
    await refetch();
    handleModalClose();
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteGallery(itemId);
    await refetch();
  };

  // Handle image load error
  const handleImageError = (itemId: string) => {
    setFailedImages((prev) => new Set(prev).add(itemId));
  };

  // Render gallery item card
  const renderGalleryItem = (item: CourseGalleryItem) => (
    <div
      key={item.id}
      className="relative group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-200"
    >
      {/* Media Preview */}
      <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
        {item.type === GalleryType.Image ? (
          failedImages.has(item.id) ? (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={48} />
              <span className="text-xs mt-2">تصویر یافت نشد</span>
            </div>
          ) : (
            <img
              src={item.shareableUrl}
              alt="Gallery item"
              className="w-full h-full object-cover"
              onError={() => handleImageError(item.id)}
            />
          )
        ) : (
            <div className="relative w-full h-full">
              <video
                src={item.shareableUrl}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-2">
                <Video size={20} className="text-white" />
              </div>
            </div>
          )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <Button
            type="primary"
            size="small"
            onClick={() => handleEditItem(item)}
            className="shadow-lg"
          >
            جایگزینی
          </Button>
          <Popconfirm
            title="حذف فایل"
            description="آیا از حذف این فایل اطمینان دارید؟"
            onConfirm={() => handleDeleteItem(item.id)}
            okText="بله، حذف شود"
            cancelText="انصراف"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              size="small"
              icon={<Trash2 size={16} />}
              loading={isDeleting}
              className="shadow-lg"
            >
              حذف
            </Button>
          </Popconfirm>
        </div>
      </div>

      {/* Item Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <Tag
            color={getGalleryCategoryColor(item.category)}
            className="text-sm font-semibold"
          >
            {getGalleryCategoryName(item.category)}
          </Tag>
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            {item.type === GalleryType.Image ? (
              <ImageIcon size={16} />
            ) : (
              <Video size={16} />
            )}
            <span>{getGalleryTypeName(item.type)}</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 break-all line-clamp-1" title={item.shareableUrl}>
          {item.shareableUrl}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Card
        className="shadow-sm"
        extra={
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={handleAddItem}
            className="shadow-md hover:shadow-lg transition-all"
          >
            افزودن فایل جدید
          </Button>
        }
        title={
          <div className="flex items-center gap-2">
            <ImageIcon size={20} className="text-primary" />
            <span>گالری دوره</span>
          </div>
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : galleryItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map(renderGalleryItem)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Empty
              description={
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    گالری دوره
                  </p>
                  <p className="text-gray-500">شناسه دوره: {id}</p>
                  <p className="text-gray-400 mt-2">
                    در حال حاضر فایلی در گالری ثبت نشده است
                  </p>
                </div>
              }
            />
          </div>
        )}
      </Card>

      <CourseGalleryUploadModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        courseId={id || ''}
        editingItem={editingItem}
      />
    </div>
  );
};
