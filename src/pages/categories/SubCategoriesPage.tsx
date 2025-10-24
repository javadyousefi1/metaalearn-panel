import React, { useState } from 'react';
import { Button, Empty, Spin, Tooltip, Modal, Alert } from 'antd';
import { Plus, Edit, Trash2, FileText, Home } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategory, useCategories } from '@/hooks';
import { ROUTES } from '@/constants';
import { SubCategory } from '@/types';
import { CategoryModal } from './CategoryModal';
import { PageHeader } from '@/components/common';

const { confirm } = Modal;

export const SubCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: parentCategory, isLoading: isLoadingParent } = useCategory(id);
  const { deleteCategory, isDeleting } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);

  const handleDelete = (subCategoryId: string, name: string) => {
    confirm({
      title: 'حذف زیردسته',
      content: `آیا از حذف زیردسته "${name}" اطمینان دارید؟`,
      okText: 'بله، حذف شود',
      cancelText: 'انصراف',
      okType: 'danger',
      onOk: async () => {
        await deleteCategory(subCategoryId);
      },
    });
  };

  const handleEdit = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSubCategory(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSubCategory(null);
  };

  const handleBack = () => {
    navigate(ROUTES.CATEGORIES.LIST);
  };

  if (isLoadingParent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="در حال بارگذاری..." />
      </div>
    );
  }

  if (!parentCategory) {
    return (
      <div className="min-h-screen p-6">
        <Alert
          message="خطا"
          description="دسته‌بندی مورد نظر یافت نشد"
          type="error"
          showIcon
        />
        <Button onClick={handleBack} className="mt-4">
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  const subCategories = parentCategory.subCategories || [];

  return (
    <div>
      <PageHeader
        title={`زیردسته‌های ${parentCategory.name}`}
        description="مدیریت زیردسته‌های این دسته‌بندی"
        breadcrumbItems={[
          {
            title: (
              <span
                className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
                onClick={handleBack}
              >
                <Home size={16} />
                خانه
              </span>
            ),
          },
          {
            title: (
              <span
                className="cursor-pointer hover:text-blue-600"
                onClick={handleBack}
              >
                دسته‌بندی‌ها
              </span>
            ),
          },
          {
            title: parentCategory.name,
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
            زیردسته جدید
          </Button>
        }
      />

      {/* Cards Grid */}
      {subCategories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <Empty
            description="هیچ زیردسته‌ای وجود ندارد"
            imageStyle={{ height: 120 }}
          >
            <Button type="primary" icon={<Plus size={18} />} onClick={handleCreate}>
              ایجاد اولین زیردسته
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subCategories.map((subCategory) => (
            <div
              key={subCategory.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText size={32} className="text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 text-center mb-2 group-hover:text-green-600 transition-colors">
                  {subCategory.name}
                </h3>
                <div className="flex items-center justify-center">
                  <span className="text-sm text-gray-500 bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                    زیردسته
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 border-t border-gray-100">
                <Tooltip title="ویرایش">
                  <Button
                    type="text"
                    icon={<Edit size={18} />}
                    onClick={() => handleEdit(subCategory)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                  />
                </Tooltip>
                <Tooltip title="حذف">
                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={18} />}
                    onClick={() => handleDelete(subCategory.id, subCategory.name)}
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
        category={editingSubCategory}
        parentId={id}
        onClose={handleModalClose}
      />
    </div>
  );
};
