import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Avatar, Spin, Button, Empty, Input, Upload, message } from "antd";
import { Home, ArrowLeft, UserCircle, Send, Paperclip, X } from "lucide-react";
import { PageHeader } from "@/components/common";
import { useTicketMessages } from "@/hooks";
import { formatDate } from "@/utils";
import type { UploadFile } from "antd";

/**
 * TicketDetailPage Component - Display ticket messages in a chat interface
 */
export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messageContent, setMessageContent] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { messages, isLoading, sendMessage, isSending } = useTicketMessages({
    ticketId: id,
    pageSize: 1000,
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

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="جزئیات تیکت"
        description="مشاهده پیام‌های تیکت"
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
      />

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
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isOperator ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[70%] ${
                      message.isOperator ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {message.userInfo.imageUrl ? (
                        <Avatar size={40} src={message.userInfo.imageUrl} />
                      ) : (
                        <Avatar
                          size={40}
                          icon={<UserCircle />}
                          style={{
                            backgroundColor: message.isOperator
                              ? "#4B26AD"
                              : "#52c41a",
                          }}
                        />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1">
                      <div
                        className={`mb-1 text-xs text-gray-500 ${
                          message.isOperator ? "text-right" : "text-left"
                        }`}
                      >
                        <span className="font-medium">
                          {message.userInfo.fullNameFa || "بدون نام"}
                        </span>
                        {message.isOperator && (
                          <span className="mr-2 text-purple-600">(اپراتور)</span>
                        )}
                      </div>

                      <div
                        className={`p-3 rounded-lg shadow-sm text-right ${
                          message.isOperator
                            ? "bg-purple-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment) => (
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

                        <div className="mt-2 text-xs text-gray-400 text-right">
                          {formatDate(message.createdTime)}
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
    </div>
  );
};
