import React, { useState } from 'react';
import { Modal, Empty, Spin, Radio, Tag } from 'antd';
import { Image as ImageIcon, Video, CheckCircle2 } from 'lucide-react';
import { useGetCourseGallery } from '@/hooks';
import {
  CourseGalleryItem,
  GalleryType,
  getGalleryCategoryName,
  getGalleryCategoryColor,
  getGalleryTypeName,
} from '@/types';

interface CourseGallerySelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  courseId: string;
}

export const CourseGallerySelectModal: React.FC<CourseGallerySelectModalProps> = ({
  open,
  onClose,
  onSelect,
  courseId,
}) => {
  const [selectedItem, setSelectedItem] = useState<CourseGalleryItem | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const { data: galleryItems = [], isLoading } = useGetCourseGallery({
    CourseId: courseId,
    PageIndex: 1,
    PageSize: 99999,
  });

  const handleImageError = (itemId: string) => {
    setFailedImages((prev) => new Set(prev).add(itemId));
  };

  const handleSelect = () => {
    if (selectedItem?.shareableUrl) {
      onSelect(selectedItem.shareableUrl);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedItem(null);
    onClose();
  };

  const renderGalleryItem = (item: CourseGalleryItem) => {
    const isSelected = selectedItem?.id === item.id;

    return (
      <div
        key={item.id}
        onClick={() => setSelectedItem(item)}
        className={`relative cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border-2 ${
          isSelected ? 'border-primary-500' : 'border-gray-200'
        }`}
      >
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 z-10 bg-primary-500 rounded-full p-1">
            <CheckCircle2 size={20} className="text-white" />
          </div>
        )}

        {/* Media Preview */}
        <div className="relative w-full h-32 bg-gray-100 flex items-center justify-center">
          {item.type === GalleryType.Image ? (
            failedImages.has(item.id) ? (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={32} />
                <span className="text-xs mt-1">تصویر یافت نشد</span>
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
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <Video size={32} className="text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="p-2 space-y-1">
          <div className="flex items-center justify-between">
            <Tag
              color={getGalleryCategoryColor(item.category)}
              className="text-xs"
            >
              {getGalleryCategoryName(item.category)}
            </Tag>
            <div className="flex items-center gap-1 text-gray-600 text-xs">
              {item.type === GalleryType.Image ? (
                <ImageIcon size={14} />
              ) : (
                <Video size={14} />
              )}
              <span>{getGalleryTypeName(item.type)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ImageIcon size={20} className="text-primary" />
          <span>انتخاب تصویر از گالری</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      onOk={handleSelect}
      okText="انتخاب"
      cancelText="انصراف"
      okButtonProps={{ disabled: !selectedItem }}
      width={800}
      bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
        </div>
      ) : galleryItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {galleryItems.map(renderGalleryItem)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <ImageIcon size={64} className="text-gray-400 mb-4" />
          <Empty
            description={
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  گالری خالی است
                </p>
                <p className="text-gray-400 mt-2">
                  لطفاً ابتدا از بخش گالری، تصاویر را آپلود کنید
                </p>
              </div>
            }
          />
        </div>
      )}
    </Modal>
  );
};
