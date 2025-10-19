import { Card, Empty } from 'antd';
import { PageHeader } from '@/components/common';

/**
 * CoursesPage Component
 */
export const CoursesPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Courses Management" />
      <Card>
        <Empty description="Courses management will be implemented here" />
      </Card>
    </div>
  );
};
