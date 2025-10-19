import { Breadcrumb, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { BreadcrumbItem } from '@/types';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  extra?: React.ReactNode;
}

/**
 * PageHeader Component
 * Displays page title and breadcrumbs
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, extra }) => {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="mb-2">
          {breadcrumbs.map((item, index) => (
            <Breadcrumb.Item key={index}>
              {item.path ? <Link to={item.path}>{item.title}</Link> : item.title}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      <div className="flex items-center justify-between">
        <Title level={2} className="!mb-0">
          {title}
        </Title>
        {extra && <div>{extra}</div>}
      </div>
    </div>
  );
};
