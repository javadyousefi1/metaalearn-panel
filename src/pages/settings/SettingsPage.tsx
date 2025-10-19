import { Card, Empty } from 'antd';
import { PageHeader } from '@/components/common';

/**
 * SettingsPage Component
 */
export const SettingsPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Settings" />
      <Card>
        <Empty description="Settings will be implemented here" />
      </Card>
    </div>
  );
};
