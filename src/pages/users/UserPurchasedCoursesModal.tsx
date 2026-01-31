import React from 'react';
import { Modal, Spin, Tag, Empty } from 'antd';
import { BookOpen } from 'lucide-react';
import { useGetUserPurchasedCourses } from '@/hooks';

interface UserPurchasedCoursesModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

/**
 * UserPurchasedCoursesModal Component - Display user's purchased courses in a modal
 */
export const UserPurchasedCoursesModal: React.FC<UserPurchasedCoursesModalProps> = ({
  open,
  onClose,
  userId,
  userName,
}) => {
  // Fetch user's purchased courses
  const { data: purchasedCourses = [], isLoading } = useGetUserPurchasedCourses(
    {
      UserId: userId,
      PageIndex: 1,
      PageSize: 100
    },
    open && !!userId
  );

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-primary" />
          <span>دوره‌های خریداری شده توسط {userName}</span>
          {!isLoading && <Tag color="blue">{purchasedCourses.length} دوره</Tag>}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      className="user-purchased-courses-modal"
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : purchasedCourses.length === 0 ? (
        <Empty
          description="این کاربر هنوز هیچ دوره‌ای خریداری نکرده است"
          className="py-8"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto py-2">
          {purchasedCourses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow"
            >
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                  <BookOpen size={32} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{course.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{course.category.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
