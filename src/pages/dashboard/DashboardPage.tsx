import { Card, Row, Col, Statistic } from 'antd';
import { Users, BookOpen, BarChart3, TrendingUp } from 'lucide-react';
import { PageHeader, PermissionGuard } from '@/components/common';
import { Permission } from '@/types';

/**
 * DashboardPage Component
 */
export const DashboardPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Dashboard" />

      <Row gutter={[16, 16]}>
        <PermissionGuard permissions={Permission.USER_VIEW}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={1234}
                prefix={<Users className="text-primary" size={24} />}
                valueStyle={{ color: '#0ea5e9' }}
              />
            </Card>
          </Col>
        </PermissionGuard>

        <PermissionGuard permissions={Permission.COURSE_VIEW}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Courses"
                value={56}
                prefix={<BookOpen className="text-green-500" size={24} />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
        </PermissionGuard>

        <PermissionGuard permissions={Permission.ANALYTICS_VIEW}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Students"
                value={892}
                prefix={<BarChart3 className="text-orange-500" size={24} />}
                valueStyle={{ color: '#f97316' }}
              />
            </Card>
          </Col>
        </PermissionGuard>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={45678}
              prefix="$"
              suffix={<TrendingUp className="text-primary ml-2" size={20} />}
              valueStyle={{ color: '#4B26AD' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={16}>
          <Card title="Recent Activity" className="h-full">
            <p className="text-gray-500">Recent activity will be displayed here...</p>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Quick Actions" className="h-full">
            <p className="text-gray-500">Quick action buttons will be displayed here...</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
