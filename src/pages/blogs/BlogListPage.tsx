import React, { useState } from 'react';
import { Button, Tag, Tooltip, Modal } from 'antd';
import { Home, Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, DataTable } from '@/components/common';
import { useTable, useBlogs } from '@/hooks';
import { blogService } from '@/services';
import { Blog } from '@/types/blog.types';
import { formatDate } from '@/utils';

const { confirm } = Modal;

export const BlogListPage: React.FC = () => {
  const navigate = useNavigate();
  const { deleteBlog, isDeleting } = useBlogs();

  const {
    data: blogs,
    totalCount,
    isLoading,
    pagination,
    refresh,
  } = useTable<Blog>({
    queryKey: 'blogs',
    fetchFn: blogService.getAll,
    initialPageSize: 10,
    initialPageIndex: 1,
  });

  const handleCreateClick = () => {
    navigate('/blogs/create');
  };

  const handleEditClick = (blogId: string) => {
    navigate(`/blogs/${blogId}`);
  };

  const handleDetailsClick = (blogId: string) => {
    navigate(`/blogs/${blogId}`);
  };

  const handleDelete = (id: string, name: string) => {
    confirm({
      title: 'حذف مقاله',
      content: `آیا از حذف مقاله "${name}" اطمینان دارید؟`,
      okText: 'بله، حذف شود',
      cancelText: 'انصراف',
      okType: 'danger',
      onOk: async () => {
        await deleteBlog(id);
        refresh();
      },
    });
  };

  const columns: ColumnsType<Blog> = [
    {
      title: 'عنوان',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'دسته‌بندی',
      dataIndex: ['category', 'name'],
      key: 'categoryName',
      render: (cName: string) => cName ? <Tag color="green">{cName}</Tag> : <Tag>بدون دسته</Tag>
    },
    {
      title: 'نویسنده',
      dataIndex: ['publisherInfo', 'fullNameFa'],
      key: 'publisher',
      render: (name: string) => name || '-',
    },
    {
      title: 'تاریخ انتشار',
      dataIndex: 'publishTime',
      key: 'publishTime',
      align: 'center',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'تعداد علاقه‌مندی',
      dataIndex: 'favoriteCount',
      key: 'favoriteCount',
      align: 'center',
      render: (count: number) => count || 0,
    },
    {
      title: 'وضعیت',
      key: 'status',
      align: 'center',
      render: (_: any, record: Blog) => {
        if (record.isDraft) {
          return <Tag color="orange">پیش‌نویس</Tag>;
        }
        if (record.isActive) {
          return <Tag color="green">فعال</Tag>;
        }
        return <Tag color="red">غیرفعال</Tag>;
      },
    },
    {
      title: 'جزئیات',
      key: 'details',
      align: 'center',
      width: 100,
      render: (_: any, record: Blog) => (
        <Tooltip title="مشاهده جزئیات">
          <Button
            type="text"
            icon={<Eye size={18} />}
            onClick={() => handleDetailsClick(record.id)}
            className="hover:bg-green-50 hover:text-green-600"
          />
        </Tooltip>
      ),
    },
    {
      title: 'عملیات',
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_: any, record: Blog) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="ویرایش">
            <Button
              type="text"
              icon={<Edit size={18} />}
              onClick={() => handleEditClick(record.id)}
              className="hover:bg-blue-50 hover:text-blue-600"
            />
          </Tooltip>
          <Tooltip title="حذف">
            <Button
              type="text"
              danger
              icon={<Trash2 size={18} />}
              onClick={() => handleDelete(record.id, record.name)}
              loading={isDeleting}
              className="hover:bg-red-50"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-[60vh]">
      <PageHeader
        title="لیست مقالات"
        description="مشاهده و مدیریت مقالات"
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
            title: 'مقالات',
          },
          {
            title: 'لیست مقالات',
          },
        ]}
        actions={
          <Button
            type="primary"
            size="large"
            icon={<Plus size={20} />}
            onClick={handleCreateClick}
            className="shadow-lg hover:shadow-xl transition-all"
          >
            مقاله جدید
          </Button>
        }
      />

      <DataTable<Blog>
        columns={columns}
        dataSource={blogs}
        rowKey="id"
        loading={isLoading}
        totalCount={totalCount}
        pagination={pagination}
        emptyText="هیچ مقاله‌ای یافت نشد"
        itemName="مقاله"
      />
    </div>
  );
};
