import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Empty, Button } from 'antd';
import { MessageCircleQuestion, Plus } from 'lucide-react';
import {useGetCourseById} from "@/hooks";

export const CourseFaqPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {data:courseData} = useGetCourseById(id)

    console.log(courseData)

  const handleAddFaq = () => {
    // TODO: Open modal or navigate to add FAQ form
    console.log('Add FAQ clicked');
  };

  return (
    <div>
      <Card
        className="shadow-sm"
        extra={
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={handleAddFaq}
            className="shadow-md hover:shadow-lg transition-all"
          >
            افزودن سوال جدید
          </Button>
        }
        title={
          <div className="flex items-center gap-2">
            <MessageCircleQuestion size={20} className="text-blue-500" />
            <span>سوالات متداول دوره</span>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center py-12">
          <MessageCircleQuestion size={64} className="text-gray-400 mb-4" />
            {!courseData?.faq &&
                <Empty
                    description={
                        <div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">
                                سوالات متداول دوره
                            </p>
                            <p className="text-gray-500">
                                شناسه دوره: {id}
                            </p>
                            <p className="text-gray-400 mt-2">
                                در حال حاضر سوالات متداولی ثبت نشده است
                            </p>
                        </div>
                    }
                />
            }
        </div>
      </Card>
    </div>
  );
};
