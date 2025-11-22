import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Segmented } from 'antd';
import { Home } from 'lucide-react';
import { PageHeader } from '@/components/common';

export const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (location.pathname.includes('/gallery')) {
      return 'gallery';
    }
    // Default to info
    return 'info';
  };

  const [activeTab, setActiveTab] = useState<string>(getActiveTab());

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Navigate on first load if on base path or create path
  useEffect(() => {
    if (id && location.pathname === `/blogs/${id}`) {
      navigate(`/blogs/${id}/info`, { replace: true });
    } else if (location.pathname === '/blogs/create') {
      navigate('/blogs/create/info', { replace: true });
    }
  }, [id, location.pathname, navigate]);

  const handleSegmentChange = (value: string | number) => {
    const blogId = id || 'create';

    switch (value) {
      case 'info':
        navigate(`/blogs/${blogId}/info`);
        break;
      case 'gallery':
        if (id) {
          navigate(`/blogs/${id}/gallery`);
        }
        break;
      default:
        navigate(`/blogs/${blogId}/info`);
    }
  };

  return (
    <div>
      <PageHeader
        title={id ? `ویرایش مقاله` : 'ایجاد مقاله جدید'}
        description={id ? 'مشاهده و ویرایش اطلاعات مقاله' : 'ایجاد مقاله جدید'}
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
            title: id ? 'ویرایش مقاله' : 'مقاله جدید',
          },
        ]}
        actions={
          <div dir="rtl">
            <Segmented
              value={activeTab}
              onChange={handleSegmentChange}
              options={[
                {
                  label: 'اطلاعات مقاله',
                  value: 'info',
                },
                ...(id ? [{
                  label: 'گالری',
                  value: 'gallery',
                }] : []),
              ]}
              size="large"
            />
          </div>
        }
      />

      {/* Outlet for nested routes */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};
