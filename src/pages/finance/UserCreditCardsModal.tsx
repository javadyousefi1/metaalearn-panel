import React from 'react';
import { Modal, Avatar, Tag, Image, Button, Form, Select, Input, Divider } from 'antd';
import { User, CreditCard as CreditCardIcon } from 'lucide-react';
import { useUpdateCreditCardIdentity } from '@/hooks';
import {
  UserListItem,
  CreditCardIdentityStatusType,
  CreditCardIdentityActionType,
  getCreditCardStatusName,
  getCreditCardStatusColor,
} from '@/types/user.types';

interface UserCreditCardsModalProps {
  open: boolean;
  onClose: () => void;
  user: UserListItem;
}

export const UserCreditCardsModal: React.FC<UserCreditCardsModalProps> = ({
  open,
  onClose,
  user,
}) => {
  const [form] = Form.useForm();
  const { updateCreditCardIdentity, isUpdating } = useUpdateCreditCardIdentity();

  // Get pending cards for action dropdown
  const pendingCards = user.creditCards?.filter(
    (card) => card.identityStatusType === CreditCardIdentityStatusType.Pending
  ) || [];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload: any = {
        actionType: values.actionType,
        creditCardId: values.selectedCard,
      };

      if (values.actionType === CreditCardIdentityActionType.Reject && values.message) {
        payload.message = values.message;
      }

      await updateCreditCardIdentity(payload);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Credit card verification error:', error);
    }
  };

  // Watch action type for message requirement
  const actionType = Form.useWatch('actionType', form);
  const selectedCardId = Form.useWatch('selectedCard', form);

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          {user.imageUrl ? (
            <Avatar size={40} src={user.imageUrl} />
          ) : (
            <Avatar size={40} icon={<User />} style={{ backgroundColor: '#4B26AD' }} />
          )}
          <div>
            <div className="font-bold">{user.fullNameFa || 'بدون نام'}</div>
            <div className="text-xs text-gray-500">{user.phoneNumber}</div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
      styles={{ body: { maxHeight: '80vh', overflowY: 'auto', padding: '16px' } }}
    >
      {/* Action Form - Compact */}
      {pendingCards.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <Form form={form} layout="vertical" requiredMark={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item
                name="selectedCard"
                label="انتخاب کارت"
                rules={[{ required: true, message: 'کارت را انتخاب کنید' }]}
                className="mb-0"
              >
                <Select placeholder="انتخاب کارت..." size="large">
                  {pendingCards.map((card, index) => (
                    <Select.Option key={card.id} value={card.id}>
                      کارت {index + 1} - {card.pan?.slice(-4)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="actionType"
                label="وضعیت"
                rules={[{ required: true, message: 'وضعیت را انتخاب کنید' }]}
                className="mb-0"
              >
                <Select placeholder="انتخاب وضعیت..." size="large">
                  <Select.Option value={CreditCardIdentityActionType.Verify}>
                    تایید شود
                  </Select.Option>
                  <Select.Option value={CreditCardIdentityActionType.Reject}>
                    رد شود
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>

            {actionType === CreditCardIdentityActionType.Reject && (
              <Form.Item
                name="message"
                label="دلیل رد"
                rules={[{ required: true, message: 'دلیل رد را وارد کنید' }]}
                className="mb-0 mt-3"
              >
                <Input.TextArea rows={2} placeholder="دلیل رد کارت..." />
              </Form.Item>
            )}

            <Button
              type="primary"
              onClick={handleSubmit}
              loading={isUpdating}
              disabled={!selectedCardId || !actionType}
              className="mt-3 w-full"
              size="large"
            >
              ثبت
            </Button>
          </Form>
        </div>
      )}

      <Divider className="my-3" />

      {/* Cards List */}
      <div className="space-y-3">
        {user.creditCards && user.creditCards.length > 0 ? (
          user.creditCards.map((creditCard, index) => (
            <div
              key={creditCard.id}
              className={`border rounded-lg p-3 ${
                selectedCardId === creditCard.id ? 'border-primary bg-purple-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCardIcon size={18} className="text-gray-500" />
                  <div>
                    <span className="font-medium">کارت {index + 1}</span>
                    <span className="text-gray-500 text-sm mr-2 font-mono" dir="ltr">
                      •••• {creditCard.pan?.slice(-4)}
                    </span>
                  </div>
                </div>
                <Tag color={getCreditCardStatusColor(creditCard.identityStatusType)} className="m-0">
                  {getCreditCardStatusName(creditCard.identityStatusType)}
                </Tag>
              </div>

              {/* Expanded view for images */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  {creditCard.imageUrl ? (
                    <Image
                      src={creditCard.imageUrl}
                      alt="Card"
                      className="rounded border"
                      style={{ maxHeight: '100px', objectFit: 'contain', width: '100%' }}
                    />
                  ) : (
                    <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                      تصویر کارت
                    </div>
                  )}
                </div>
                <div>
                  {creditCard.identityImageUrl ? (
                    <Image
                      src={creditCard.identityImageUrl}
                      alt="Identity"
                      className="rounded border"
                      style={{ maxHeight: '100px', objectFit: 'contain', width: '100%' }}
                    />
                  ) : (
                    <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                      تصویر هویتی
                    </div>
                  )}
                </div>
              </div>

              {creditCard.message && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-100 rounded p-2">
                  پیام: {creditCard.message}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <CreditCardIcon size={40} className="mx-auto mb-2 opacity-50" />
            <p>کارتی ثبت نشده</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
