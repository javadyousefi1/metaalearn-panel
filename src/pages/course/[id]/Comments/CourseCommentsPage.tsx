import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Empty, Tabs, Switch, Avatar, Rate, Tag, Space, Pagination, Button } from 'antd';
import { MessageSquare, UserCircle, Reply } from 'lucide-react';
import { useGetCourseComments, useCourseComments } from '@/hooks';
import type { CourseComment } from '@/types/courseComment.types';
import { CourseCommentReplyModal } from './CourseCommentReplyModal';

const { TabPane } = Tabs;

export const CourseCommentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('pending');
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CourseComment | null>(null);
  const pageSize = 10;

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

  const { updateApproval, createReply, isUpdating, isReplying } = useCourseComments();

  const comments = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleApprovalToggle = async (comment: CourseComment) => {
    try {
      await updateApproval({
        id: comment.id,
        state: !comment.isApproved,
      });
      await refetch();
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  const handleOpenReplyModal = (comment: CourseComment) => {
    setSelectedComment(comment);
    setReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setReplyModalOpen(false);
    setSelectedComment(null);
  };

  const handleReplySubmit = async (content: string) => {
    if (!selectedComment || !id) return;

    try {
      await createReply({
        content,
        courseId: id,
        parentId: selectedComment.id,
      });
      handleCloseReplyModal();
      await refetch();
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as 'approved' | 'pending');
    setPage(1);
    handleCloseReplyModal();
  };

  const renderReply = (reply: CourseComment) => (
    <div key={reply.id} className="mr-8 mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="mb-2 flex items-center gap-2">
        {reply.user.imageUrl ? (
          <Avatar size={32} src={reply.user.imageUrl} />
        ) : (
          <Avatar size={32} icon={<UserCircle />} />
        )}
        <div>
          <span className="text-sm font-semibold">{reply.user.fullNameFa}</span>
          <Tag color="blue" className="mr-2 text-xs">پاسخ ادمین</Tag>
        </div>
      </div>
      <p className="m-0 text-sm leading-relaxed text-gray-700">{reply.content}</p>
    </div>
  );

  const renderCommentCard = (comment: CourseComment) => (
    <Card
      key={comment.id}
      className="mb-4 shadow-sm hover:shadow-md transition-shadow"
      bordered={true}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">وضعیت:</span>
          <Switch
            checked={comment.isApproved}
            onChange={() => handleApprovalToggle(comment)}
            loading={isUpdating}
            checkedChildren="تایید"
            unCheckedChildren="رد"
          />
        </div>

        <Button
          type="default"
          size="small"
          icon={<Reply size={14} />}
          onClick={() => handleOpenReplyModal(comment)}
        >
          پاسخ به نظر
        </Button>
      </div>

      <div className="mb-3 flex items-center gap-3">
        {comment.user.imageUrl ? (
          <Avatar size={48} src={comment.user.imageUrl} />
        ) : (
          <Avatar size={48} icon={<UserCircle />} />
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="m-0 text-base font-semibold">
              {comment.user.fullNameFa}
            </h4>
            <Rate disabled defaultValue={comment.score} allowHalf className="text-sm" />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Tag color={comment.isApproved ? 'green' : 'orange'}>
              {comment.isApproved ? 'تایید شده' : 'در انتظار تایید'}
            </Tag>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-3">
        <p className="m-0 leading-relaxed text-gray-700">{comment.content}</p>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(renderReply)}
        </div>
      )}
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
    <>
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

      <CourseCommentReplyModal
        open={replyModalOpen}
        comment={selectedComment}
        onClose={handleCloseReplyModal}
        onSubmit={handleReplySubmit}
        loading={isReplying}
      />
    </>
  );
};
