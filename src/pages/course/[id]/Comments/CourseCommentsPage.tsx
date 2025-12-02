import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Empty, Tabs, Switch, Avatar, Rate, Tag, Space, Pagination } from 'antd';
import { MessageSquare, UserCircle } from 'lucide-react';
import { useGetCourseComments, useCourseComments } from '@/hooks';
import type { CourseComment } from '@/types/courseComment.types';

const { TabPane } = Tabs;

export const CourseCommentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('pending');
  const pageSize = 10;

  // Single query that changes based on active tab
  const {
    data,
    isLoading,
    refetch,
  } = useGetCourseComments({
    courseId: id || '',
    pageIndex: page,
    pageSize,
    isApproved: activeTab === 'approved',
  });

  const { updateApproval, isUpdating } = useCourseComments();

  const comments = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleApprovalToggle = async (comment: CourseComment) => {
    try {
      await updateApproval({
        id: comment.id,
        state: !comment.isApproved,
      });
      // Refetch current tab
      await refetch();
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as 'approved' | 'pending');
    setPage(1); // Reset to page 1 when switching tabs
  };

  const renderCommentCard = (comment: CourseComment) => (
    <Card
      key={comment.id}
      className="mb-4 shadow-sm hover:shadow-md transition-shadow"
      bordered={true}
    >
      <div className="flex items-start justify-between gap-4">
        {/* User Info & Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {/* User Avatar */}
            {comment.user.imageUrl ? (
              <Avatar size={48} src={comment.user.imageUrl} />
            ) : (
              <Avatar size={48} icon={<UserCircle />} />
            )}

            {/* User Name & Rating */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-base m-0">
                  {comment.user.fullNameFa}
                </h4>
                <Rate disabled defaultValue={comment.score} allowHalf className="text-sm" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Tag color={comment.isApproved ? 'green' : 'orange'}>
                  {comment.isApproved ? 'تایید شده' : 'در انتظار تایید'}
                </Tag>
                <span className="text-xs text-gray-400">
                  شناسه: {comment.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          {/* Comment Content */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-700 m-0 leading-relaxed">{comment.content}</p>
          </div>
        </div>

        {/* Approval Toggle */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">وضعیت تایید</span>
          <Switch
            checked={comment.isApproved}
            onChange={() => handleApprovalToggle(comment)}
            loading={isUpdating}
            checkedChildren="تایید"
            unCheckedChildren="رد"
          />
        </div>
      </div>
    </Card>
  );

  const renderEmptyState = (type: 'approved' | 'pending') => (
    <div className="flex flex-col items-center justify-center py-16">
      <MessageSquare size={64} className="text-gray-400 mb-4" />
      <Empty
        description={
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {type === 'approved' ? 'نظرات تایید شده' : 'نظرات در انتظار تایید'}
            </p>
            <p className="text-gray-500">شناسه دوره: {id}</p>
            <p className="text-gray-400 mt-2">
              {type === 'approved'
                ? 'در حال حاضر نظر تایید شده‌ای وجود ندارد'
                : 'در حال حاضر نظری در انتظار تایید نیست'}
            </p>
          </div>
        }
      />
    </div>
  );

  return (
    <Card
      className="shadow-sm"
      title={
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-primary" />
          <span>نظرات دوره</span>
        </div>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type="card"
      >
        {/* Pending Comments Tab */}
        <TabPane
          tab={
            <Space>
              <span>در انتظار تایید</span>
              {activeTab === 'pending' && <Tag color="orange">{totalCount}</Tag>}
            </Space>
          }
          key="pending"
        >
          {isLoading ? (
            <div className="text-center py-8">در حال بارگذاری...</div>
          ) : comments.length > 0 ? (
            <>
              <div className="mt-4">
                {comments.map((comment) => renderCommentCard(comment))}
              </div>
              {totalCount > pageSize && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={page}
                    total={totalCount}
                    pageSize={pageSize}
                    onChange={setPage}
                    showSizeChanger={false}
                    showTotal={(total) => `مجموع ${total} نظر`}
                  />
                </div>
              )}
            </>
          ) : (
            renderEmptyState('pending')
          )}
        </TabPane>

        {/* Approved Comments Tab */}
        <TabPane
          tab={
            <Space>
              <span>تایید شده</span>
              {activeTab === 'approved' && <Tag color="green">{totalCount}</Tag>}
            </Space>
          }
          key="approved"
        >
          {isLoading ? (
            <div className="text-center py-8">در حال بارگذاری...</div>
          ) : comments.length > 0 ? (
            <>
              <div className="mt-4">
                {comments.map((comment) => renderCommentCard(comment))}
              </div>
              {totalCount > pageSize && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={page}
                    total={totalCount}
                    pageSize={pageSize}
                    onChange={setPage}
                    showSizeChanger={false}
                    showTotal={(total) => `مجموع ${total} نظر`}
                  />
                </div>
              )}
            </>
          ) : (
            renderEmptyState('approved')
          )}
        </TabPane>
      </Tabs>
    </Card>
  );
};
