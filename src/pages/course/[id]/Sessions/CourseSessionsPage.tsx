import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Empty } from 'antd';
import { Calendar } from 'lucide-react';

export const CourseSessionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <Card
        className="shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            <span>جلسات دوره</span>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Calendar size={64} className="text-gray-400 mb-4" />
          <Empty
            description={
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  جلسات دوره
                </p>
                <p className="text-gray-500">
                  شناسه دوره: {id}
                </p>
                <p className="text-gray-400 mt-2">
                  در حال حاضر جلسه‌ای ثبت نشده است
                </p>
              </div>
            }
          />
        </div>
      </Card>
    </div>
  );
};
