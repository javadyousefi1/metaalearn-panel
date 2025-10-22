import React, { ReactNode } from 'react';
import { Breadcrumb, Button } from 'antd';
import { ArrowRight } from 'lucide-react';
import type { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Breadcrumb items (Ant Design format) */
  breadcrumbItems?: BreadcrumbItemType[];
  /** Action buttons for the right side */
  actions?: ReactNode;
  /** Back button configuration */
  backButton?: {
    onClick: () => void;
    label?: string;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * PageHeader Component
 * Modern, flexible page header with breadcrumbs, title, description, and actions
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbItems,
  actions,
  backButton,
  className = '',
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Breadcrumb */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
      )}

      {/* Back Button */}
      {backButton && (
        <Button
          type="text"
          icon={<ArrowRight size={18} />}
          onClick={backButton.onClick}
          className="mb-4 hover:bg-gray-100"
        >
          {backButton.label || 'بازگشت'}
        </Button>
      )}

      {/* Title and Actions Row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 truncate">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 text-base">{description}</p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
