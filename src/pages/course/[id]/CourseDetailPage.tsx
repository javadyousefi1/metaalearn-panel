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
    if (location.pathname.endsWith('/introduction')) {
      return 'introduction';
    }
    if (location.pathname.endsWith('/faq')) {
      return 'faq';
    }
    if (location.pathname.endsWith('/sessions')) {
      return 'sessions';
    }
    if (location.pathname.endsWith('/schedules')) {
      return 'schedules';
    }
    if (location.pathname.endsWith('/gallery')) {
      return 'gallery';
    }
    // Default to Introduction when on the base course detail page
    return 'introduction';
  };

  const [activeTab, setActiveTab] = useState<string>(getActiveTab());

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Navigate on first load if on base path
  useEffect(() => {
    if (id && location.pathname === `/course/${id}`) {
      navigate(ROUTES.COURSE.INTRODUCTION(id), { replace: true });
    }
  }, [id, location.pathname, navigate]);

  const handleSegmentChange = (value: string | number) => {
    if (!id) return;

    switch (value) {
      case 'introduction':
        navigate(ROUTES.COURSE.INTRODUCTION(id));
        break;
      case 'faq':
        navigate(ROUTES.COURSE.FAQ(id));
        break;
      case 'sessions':
        navigate(ROUTES.COURSE.SESSIONS(id));
        break;
      case 'schedules':
        navigate(ROUTES.COURSE.SCHEDULES(id));
        break;
      case 'gallery':
        navigate(ROUTES.COURSE.GALLERY(id));
        break;
      default:
        navigate(ROUTES.COURSE.INTRODUCTION(id));
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
          <div dir="rtl">
            <Segmented
              value={activeTab}
              onChange={handleSegmentChange}
              options={[
                  {
                      label: 'معرفی دوره',
                      value: 'introduction',
                  },
                  {
                      label: 'سوالات متداول',
                      value: 'faq',
                  },
                  {
                      label: 'جلسات',
                      value: 'sessions',
                  },
                  {
                      label: 'گروه‌بندی',
                      value: 'schedules',
                  },
                  {
                      label: 'گالری',
                      value: 'gallery',
                  },
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
