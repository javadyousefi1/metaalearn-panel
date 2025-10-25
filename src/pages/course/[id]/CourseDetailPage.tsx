import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Segmented } from 'antd';
import { Home } from 'lucide-react';
import { PageHeader } from '@/components/common';
import { ROUTES } from '@/constants';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (location.pathname.endsWith('/faq')) {
      return 'faq';
    }
    // Default to FAQ when on the base course detail page
    return 'faq';
  };

  const [activeTab, setActiveTab] = useState<string>(getActiveTab());

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Navigate on first load if on base path
  useEffect(() => {
    if (id && location.pathname === `/course/${id}`) {
      navigate(ROUTES.COURSE.FAQ(id), { replace: true });
    }
  }, [id, location.pathname, navigate]);

  const handleSegmentChange = (value: string | number) => {
    if (!id) return;

    switch (value) {
      case 'faq':
        navigate(ROUTES.COURSE.FAQ(id));
        case 'sessions':
            navigate(ROUTES.COURSE.FAQ(id));
        break;
      default:
        navigate(ROUTES.COURSE.FAQ(id));
    }
  };

  return (
    <div>
      <PageHeader
        title={`جزئیات دوره`}
        description="مشاهده اطلاعات کامل دوره"
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
            title: 'دوره‌ها',
          },
          {
            title: 'جزئیات دوره',
          },
        ]}
        actions={
          <Segmented
            value={activeTab}
            onChange={handleSegmentChange}
            options={[
                {
                    label: 'سوالات متداول',
                    value: 'faq',
                },
            ]}
            size="large"
        />}
      />

      {/* Outlet for nested routes */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};
