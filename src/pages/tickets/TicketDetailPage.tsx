import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Avatar, Spin, Button, Empty, Input, Upload, message, Popconfirm, Modal, Space, Tag, Collapse } from "antd";
import { Home, UserCircle, Send, Paperclip, X, Edit2, Trash2, XCircle, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/common";
import { useTicketMessages, useGetUserPurchasedCourses } from "@/hooks";
import { formatDate } from "@/utils";
import type { UploadFile } from "antd";
import type { TicketMessage } from "@/types/ticket.types";
import { TicketStatus } from "@/types/ticket.types";
import { ticketService } from "@/services/ticket.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * TicketDetailPage Component - Display ticket messages in a chat interface
 */
export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messageContent, setMessageContent] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [editingMessage, setEditingMessage] = useState<TicketMessage | null>(null);
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
  } = useTicketMessages({
    ticketId: id,
    pageSize: 1000,
  });

  // Get the user ID from the first non-operator message
  const userId = useMemo(() => {
    const firstUserMessage = messages.find(msg => !msg.isOperator);
    return firstUserMessage?.userInfo?.id;
  }, [messages]);

  // Fetch user's purchased courses
  const { data: purchasedCourses = [], isLoading: isLoadingCourses } = useGetUserPurchasedCourses(
    {
      UserId: userId,
      PageIndex: 1,
      PageSize: 100
    },
    !!userId
  );

  // Close ticket mutation
  const closeTicketMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Ticket ID not found");
      await ticketService.update({
        id,
        status: TicketStatus.Closed,
      });
    },
    onSuccess: () => {
      message.success("تیکت با موفقیت بسته شد");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      navigate("/tickets");
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
        ticketId: id,
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
  const handleEditMessage = (msg: TicketMessage) => {
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
      // handleSendMessage();
    }
  };

  // Handle close ticket
  const handleCloseTicket = () => {
    closeTicketMutation.mutate();
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="جزئیات تیکت"
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
            title: "تیکت‌ها",
            href: "/tickets",
          },
          {
            title: "جزئیات تیکت",
          },
        ]}
        actions={
          <Popconfirm
            title="بستن تیکت"
            description="آیا از بستن این تیکت اطمینان دارید؟"
            onConfirm={handleCloseTicket}
            okText="بله"
            cancelText="خیر"
            okButtonProps={{ loading: closeTicketMutation.isPending }}
          >
            <Button
              type="text"
              icon={<XCircle size={18} />}
              loading={closeTicketMutation.isPending}
              size="large"
            >
              بستن تیکت
            </Button>
          </Popconfirm>
        }
      />

      {/* User's Purchased Courses - Collapsible */}
      {userId && purchasedCourses.length > 0 && (
        <Collapse
          className="!mt-4"
          items={[
            {
              key: '1',
              label: (
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  <span>دوره‌های خریداری شده توسط کاربر</span>
                  <Tag color="blue">{purchasedCourses.length} دوره</Tag>
                </div>
              ),
              children: isLoadingCourses ? (
                <div className="flex justify-center py-4">
                  <Spin />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        {/*{course.invoice && (*/}
                        {/*  <div className="flex gap-2 mt-1">*/}
                        {/*    <Tag color={course.invoice.hasAccess ? "green" : "orange"} className="text-xs">*/}
                        {/*      {course.invoice.hasAccess ? "دسترسی دارد" : "بدون دسترسی"}*/}
                        {/*    </Tag>*/}
                        {/*  </div>*/}
                        {/*)}*/}
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      )}

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
                                href={attachment.url}
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
                            {formatDate(msg.createdTime, true)}
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
            <div className="border-t bg-white p-4" style={{ flexShrink: 0 }}>
              {/* File Preview */}
              {fileList.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {fileList.map((file) => (
                    <div
                      key={file.uid}
                      className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2"
                    >
                      <Paperclip size={14} className="text-blue-600" />
                      <span className="text-sm text-blue-900">{file.name}</span>
                      <button
                        onClick={() =>
                          setFileList(fileList.filter((f) => f.uid !== file.uid))
                        }
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-end">
                <Upload
                  fileList={fileList}
                  onChange={handleFileChange}
                  beforeUpload={() => false}
                  accept="image/*,.zip"
                  showUploadList={false}
                  multiple
                >
                  <Button
                    icon={<Paperclip size={18} />}
                    disabled={isSending}
                    size="large"
                    style={{ height: '48px' }}
                  />
                </Upload>

                <Input.TextArea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="پیام خود را بنویسید..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  disabled={isSending}
                  style={{
                    flex: 1,
                    resize: 'none',
                    fontSize: '14px',
                    padding: '12px 16px'
                  }}
                />

                <Button
                  type="primary"
                  icon={<Send size={18} />}
                  onClick={handleSendMessage}
                  loading={isSending}
                  disabled={!messageContent.trim() && fileList.length === 0}
                  size="large"
                  style={{ height: '48px', minWidth: '80px' }}
                >
                  ارسال
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
