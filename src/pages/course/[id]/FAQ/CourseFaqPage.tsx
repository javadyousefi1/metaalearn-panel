import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Empty } from 'antd';
import { MessageCircleQuestion } from 'lucide-react';
import {useGetCourseById} from "@/hooks";

export const CourseFaqPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {data:courseData} = useGetCourseById(id)

    console.log(courseData)

  return (
    <div>
      <Card className="shadow-sm">
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
