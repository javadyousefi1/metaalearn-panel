import React, { useState } from 'react';
import { Button, Empty, Spin, Tooltip, Modal } from 'antd';
import { Plus, Edit, Trash2, FolderOpen, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks';
import { ROUTES } from '@/constants';
import { CategoryListItem } from '@/types';
import { CategoryModal } from './CategoryModal';
import { PageHeader } from '@/components/common';

const { confirm } = Modal;

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, isLoading, deleteCategory, isDeleting } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryListItem | null>(null);

  const handleDelete = (id: string, name: string) => {
    confirm({
      title: 'حذف دسته‌بندی',
      content: `آیا از حذف دسته‌بندی "${name}" اطمینان دارید؟`,
      okText: 'بله، حذف شود',
      cancelText: 'انصراف',
      okType: 'danger',
      onOk: async () => {
        await deleteCategory(id);
      },
    });
  };

  const handleEdit = (category: CategoryListItem) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleCardClick = (categoryId: string) => {
    navigate(ROUTES.COURSES.CATEGORIES.SUB(categoryId));
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="در حال بارگذاری..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="مدیریت دسته‌بندی‌ها"
        description="دسته‌بندی‌های اصلی را مشاهده و مدیریت کنید"
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
                title: (
                    <span
                    >
           دوره‌ها
              </span>
                ),
            },
          {
            title: 'دسته‌بندی‌ها',
          },
        ]}
        actions={
          <Button
            type="primary"
            size="large"
            icon={<Plus size={20} />}
            onClick={handleCreate}
            className="shadow-lg hover:shadow-xl transition-all"
          >
            دسته‌بندی جدید
          </Button>
        }
      />

      {/* Cards Grid */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <Empty
            description="هیچ دسته‌بندی وجود ندارد"
            imageStyle={{ height: 120 }}
          >
            <Button type="primary" icon={<Plus size={18} />} onClick={handleCreate}>
              ایجاد اولین دسته‌بندی
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Card Content */}
              <div
                className="p-6 cursor-pointer"
                onClick={() => handleCardClick(category.id)}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FolderOpen size={32} className="text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 text-center mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {category.subCategories?.length || 0} زیردسته
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 border-t border-gray-100">
                <Tooltip title="ویرایش">
                  <Button
                    type="text"
                    icon={<Edit size={18} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(category);
                    }}
                    className="hover:bg-blue-50 hover:text-blue-600"
                  />
                </Tooltip>
                <Tooltip title="حذف">
                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={18} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(category.id, category.name);
                    }}
                    loading={isDeleting}
                    className="hover:bg-red-50"
                  />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        open={modalOpen}
        category={editingCategory}
        onClose={handleModalClose}
      />
    </div>
  );
};
