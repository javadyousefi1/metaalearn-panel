import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Avatar, Spin, Button, Empty, Input, Upload, message, Popconfirm, Modal, Space, Tag, Descriptions, Select } from "antd";
import { Home, UserCircle, Send, Paperclip, X, Edit2, Trash2, XCircle, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/common";
import { useCourseTicketMessages, useCourseTicketDetail } from "@/hooks";
import { formatDate } from "@/utils";
import type { UploadFile } from "antd";
import type { CourseTicketMessage } from "@/types/courseTicket.types";
import { CourseTicketStatus, toCourseTicketStatus, COURSE_TICKET_STATUS_OPTIONS } from "@/types/courseTicket.types";
import { courseTicketService } from "@/services/courseTicket.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * OperatorTicketDetailPage Component - Display ticket messages in a chat interface
 */
export const OperatorTicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messageContent, setMessageContent] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [editingMessage, setEditingMessage] = useState<CourseTicketMessage | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editFileList, setEditFileList] = useState<UploadFile[]>([]);

  const {
    messages,
    isLoading,
    sendMessage,
    updateMessage,
    deleteMessage,
    isSending,
    isUpdating,
    isDeleting,
  } = useCourseTicketMessages({
    courseTicketId: id,
    pageSize: 1000,
  });

  // Fetch ticket details
  const {
    ticketDetail,
    isLoading: isLoadingDetail,
  } = useCourseTicketDetail({
    courseTicketId: id,
  });

  // Close course ticket mutation
  const closeCourseTicketMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Course Ticket ID not found");
      await courseTicketService.update({
        id,
        status: CourseTicketStatus.Closed,
      });
    },
    onSuccess: () => {
      message.success("تیکت با موفقیت بسته شد");
      queryClient.invalidateQueries({ queryKey: ["courseTickets"] });
      navigate("/operators");
    },
    onError: () => {
      message.error("خطا در بستن تیکت");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: CourseTicketStatus) => {
      if (!id) throw new Error("Course Ticket ID not found");
      await courseTicketService.update({ id, status });
    },
    onSuccess: () => {
      message.success("وضعیت تیکت به‌روزرسانی شد");
      queryClient.invalidateQueries({ queryKey: ["course-ticket-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["course-tickets"] });
    },
    onError: () => {
      message.error("خطا در تغییر وضعیت تیکت");
    },
  });

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file upload
  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    // Filter only images and zip files
    const validFiles = newFileList.filter((file) => {
      const isImage = file.type?.startsWith("image/");
      const isZip = file.type === "application/zip" || file.type === "application/x-zip-compressed";

      if (!isImage && !isZip) {
        message.error(`فقط فایل‌های تصویری و ZIP مجاز هستند`);
        return false;
      }
      return true;
    });

    setFileList(validFiles);
  };

  // Handle edit file upload
  const handleEditFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    const validFiles = newFileList.filter((file) => {
      const isImage = file.type?.startsWith("image/");
      const isZip = file.type === "application/zip" || file.type === "application/x-zip-compressed";

      if (!isImage && !isZip) {
        message.error(`فقط فایل‌های تصویری و ZIP مجاز هستند`);
        return false;
      }
      return true;
    });

    setEditFileList(validFiles);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageContent.trim() && fileList.length === 0) {
      message.warning("لطفا پیام یا فایل خود را وارد کنید");
      return;
    }

    if (!id) {
      message.error("شناسه تیکت یافت نشد");
      return;
    }

    try {
      const files = fileList.map((file) => file.originFileObj as File);

      await sendMessage({
        courseTicketId: id,
        content: messageContent.trim(),
        files: files.length > 0 ? files : undefined,
      });

      // Clear input after successful send
      setMessageContent("");
      setFileList([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle edit message
  const handleEditMessage = (msg: CourseTicketMessage) => {
    setEditingMessage(msg);
    setEditContent(msg.content);
    setEditFileList([]);
  };

  // Handle update message
  const handleUpdateMessage = async () => {
    if (!editContent.trim() && editFileList.length === 0) {
      message.warning("لطفا پیام یا فایل خود را وارد کنید");
      return;
    }

    if (!editingMessage) return;

    try {
      const files = editFileList.map((file) => file.originFileObj as File);

      await updateMessage({
        id: editingMessage.id,
        content: editContent.trim(),
        files: files.length > 0 ? files : undefined,
      });

      // Clear edit state
      setEditingMessage(null);
      setEditContent("");
      setEditFileList([]);
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle close course ticket
  const handleCloseCourseTicket = () => {
    closeCourseTicketMutation.mutate();
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="جزئیات تیکت اپراتور"
        description="مشاهده و مدیریت پیام‌های تیکت"
        breadcrumbItems={[
          {
            title: (
              <span className="flex items-center gap-2">
                <Home size={16} />
                خانه
              </span>
            ),
          },
          {
            title: "اپراتورها",
            href: "/operators",
          },
          {
            title: "جزئیات تیکت",
          },
        ]}
        actions={
          <Popconfirm
            title="بستن تیکت"
            description="آیا از بستن این تیکت اطمینان دارید؟"
            onConfirm={handleCloseCourseTicket}
            okText="بله"
            cancelText="خیر"
            okButtonProps={{ loading: closeCourseTicketMutation.isPending }}
          >
            <Button
              type="text"
              icon={<XCircle size={18} />}
              loading={closeCourseTicketMutation.isPending}
              size="large"
            >
              بستن تیکت
            </Button>
          </Popconfirm>
        }
      />

      {/* Ticket Detail Header */}
      {isLoadingDetail ? (
        <Card className="!mt-4">
          <div className="flex justify-center py-4">
            <Spin />
          </div>
        </Card>
      ) : ticketDetail ? (
        <Card className="!mt-4 [&_.ant-card-body]:!p-2 sm:[&_.ant-card-body]:!p-4">
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, md: 3, lg: 4 }}
            className="[&_.ant-descriptions-item-label]:!font-medium [&_.ant-descriptions-item-label]:!text-gray-600 [&_.ant-descriptions-item-label]:!text-xs sm:[&_.ant-descriptions-item-label]:!text-sm [&_.ant-descriptions-item-content]:!text-xs sm:[&_.ant-descriptions-item-content]:!text-sm [&_.ant-descriptions-item]:!pb-1 sm:[&_.ant-descriptions-item]:!pb-3"
          >
            <Descriptions.Item label="عنوان تیکت">
              <span className="font-medium text-gray-900">{ticketDetail.title}</span>
            </Descriptions.Item>
            <Descriptions.Item label="وضعیت">
              <div className="w-full max-w-full sm:max-w-[200px]">
                <Select
                  size="small"
                  className="w-full"
                  popupMatchSelectWidth={false}
                  value={toCourseTicketStatus(ticketDetail.status)}
                  loading={updateStatusMutation.isPending}
                  disabled={updateStatusMutation.isPending}
                  options={[...COURSE_TICKET_STATUS_OPTIONS]}
                  onChange={(value) => updateStatusMutation.mutate(value)}
                />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="کاربر">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {ticketDetail.userInfo.imageUrl ? (
                  <Avatar size={20} className="sm:!w-6 sm:!h-6" src={ticketDetail.userInfo.imageUrl} />
                ) : (
                  <Avatar size={20} className="sm:!w-6 sm:!h-6" icon={<UserCircle />} style={{ backgroundColor: '#4B26AD' }} />
                )}
                <span className="truncate">{ticketDetail.userInfo.fullNameFa || 'بدون نام'}</span>
              </div>
            </Descriptions.Item>
            {ticketDetail.course && (
              <Descriptions.Item label="دوره">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {ticketDetail.course.imageUrl ? (
                    <Avatar size={20} className="sm:!w-6 sm:!h-6" src={ticketDetail.course.imageUrl} shape="square" />
                  ) : (
                    <BookOpen size={14} className="sm:w-4 sm:h-4 text-primary" />
                  )}
                  <span className="truncate">{ticketDetail.course.name}</span>
                </div>
              </Descriptions.Item>
            )}
            {ticketDetail.score !== null && (
              <Descriptions.Item label="امتیاز">
                <Tag color="blue" className="text-xs">{ticketDetail.score}</Tag>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="تاریخ ایجاد" className="hidden sm:block">
              <span className="text-xs sm:text-sm">{formatDate(ticketDetail.createdTime, true)}</span>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ) : null}

      <Card
        className="!mt-4 !flex-1 !flex !flex-col"
        bodyStyle={{
          padding: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center flex-1">
            <Spin size="large" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center flex-1">
            <Empty description="هیچ پیامی برای این تیکت یافت نشد" />
          </div>
        ) : (
          <>
            {/* Messages Container */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{
                minHeight: '400px',
                maxHeight: 'calc(100vh - 400px)'
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.isOperator ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[70%] ${
                      msg.isOperator ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {msg.userInfo.imageUrl ? (
                        <Avatar size={40} src={msg.userInfo.imageUrl} />
                      ) : (
                        <Avatar
                          size={40}
                          icon={<UserCircle />}
                          style={{
                            backgroundColor: msg.isOperator
                              ? "#4B26AD"
                              : "#52c41a",
                          }}
                        />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1">
                      <div className="mb-1 text-xs text-gray-500 text-right">
                        <span className="font-medium">
                          {msg.userInfo.fullNameFa || "بدون نام"}
                        </span>
                        {msg.isOperator && (
                          <span className="mr-2 text-purple-600">(ادمین سایت)</span>
                        )}
                      </div>

                      <div
                        className={`p-3 rounded-lg shadow-sm text-right ${
                          msg.isOperator
                            ? "bg-purple-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </p>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.url.replace("http","https")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-blue-600 hover:underline"
                              >
                                📎 فایل پیوست
                              </a>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-400 text-right">
                            {formatDate(msg.createdTime,true)}
                          </div>

                          {/* Admin actions - only for operator messages */}
                          {msg.isOperator && (
                            <Space size="small">
                              <Button
                                type="text"
                                size="small"
                                icon={<Edit2 size={14} />}
                                onClick={() => handleEditMessage(msg)}
                                disabled={isUpdating || isDeleting}
                              />
                              <Popconfirm
                                title="حذف پیام"
                                description="آیا از حذف این پیام اطمینان دارید؟"
                                onConfirm={() => handleDeleteMessage(msg.id)}
                                okText="بله"
                                cancelText="خیر"
                              >
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<Trash2 size={14} />}
                                  disabled={isUpdating || isDeleting}
                                />
                              </Popconfirm>
                            </Space>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area - Fixed Footer */}
            <div className="border-t bg-white p-2 sm:p-4" style={{ flexShrink: 0 }}>
              {/* File Preview */}
              {fileList.length > 0 && (
                <div className="mb-2 sm:mb-3 flex flex-wrap gap-1.5 sm:gap-2">
                  {fileList.map((file) => (
                    <div
                      key={file.uid}
                      className="bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2"
                    >
                      <Paperclip size={12} className="text-blue-600 sm:w-[14px] sm:h-[14px]" />
                      <span className="text-xs sm:text-sm text-blue-900 truncate max-w-[120px] sm:max-w-none">{file.name}</span>
                      <button
                        onClick={() =>
                          setFileList(fileList.filter((f) => f.uid !== file.uid))
                        }
                        className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                      >
                        <X size={12} className="sm:w-[14px] sm:h-[14px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-1.5 sm:gap-2 items-end">
                <Upload
                  fileList={fileList}
                  onChange={handleFileChange}
                  beforeUpload={() => false}
                  accept="image/*,.zip"
                  showUploadList={false}
                  multiple
                >
                  <Button
                    icon={<Paperclip size={16} className="sm:w-[18px] sm:h-[18px]" />}
                    disabled={isSending}
                    size="middle"
                    className="!h-9 !w-9 sm:!h-12 sm:!w-12 flex items-center justify-center !p-0"
                  />
                </Upload>

                <Input.TextArea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="پیام خود را بنویسید..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  disabled={isSending}
                  className="!text-xs sm:!text-sm"
                  style={{
                    flex: 1,
                    resize: 'none',
                    padding: '8px 12px'
                  }}
                />

                <Button
                  type="primary"
                  icon={<Send size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  onClick={handleSendMessage}
                  loading={isSending}
                  disabled={!messageContent.trim() && fileList.length === 0}
                  size="middle"
                  className="!h-9 sm:!h-12 !min-w-[36px] sm:!min-w-[80px] flex items-center justify-center"
                >
                  <span className="hidden sm:inline">ارسال</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Edit Message Modal */}
      <Modal
        title="ویرایش پیام"
        open={!!editingMessage}
        onOk={handleUpdateMessage}
        onCancel={() => {
          setEditingMessage(null);
          setEditContent("");
          setEditFileList([]);
        }}
        okText="ذخیره"
        cancelText="انصراف"
        confirmLoading={isUpdating}
      >
        <div className="py-4 space-y-4">
          {/* Edit File Preview */}
          {editFileList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {editFileList.map((file) => (
                <div
                  key={file.uid}
                  className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2"
                >
                  <Paperclip size={14} className="text-blue-600" />
                  <span className="text-sm text-blue-900">{file.name}</span>
                  <button
                    onClick={() =>
                      setEditFileList(editFileList.filter((f) => f.uid !== file.uid))
                    }
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Upload
            fileList={editFileList}
            onChange={handleEditFileChange}
            beforeUpload={() => false}
            accept="image/*,.zip"
            showUploadList={false}
            multiple
          >
            <Button icon={<Paperclip size={18} />}>
              افزودن فایل
            </Button>
          </Upload>

          <Input.TextArea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            style={{
              fontSize: '14px',
            }}
          />
        </div>
      </Modal>
    </div>
  );
};
