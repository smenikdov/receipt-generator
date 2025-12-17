import React from 'react';
import { Modal, Form, Input } from 'antd';

interface PasswordModalProps {
    open: boolean;
    onOk: (password?: string) => void;
    onCancel: () => void;
    fileName: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ open, onOk, onCancel, fileName }) => {
    const [form] = Form.useForm();

    const handleOk = async () => {
        const password = form.getFieldValue('password');
        onOk(password);
        form.resetFields();
    };

    const handleCancel = () => {
        onCancel();
        form.resetFields();
    };

    return (
        <Modal
            title={`Пароль для файла ${fileName}`}
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="Подтвердить"
            cancelText="Отмена"
        >
            <Form form={form} layout="vertical" name="password_form" initialValues={{ hasPassword: false }}>
                <Form.Item
                    name="password"
                    label="Пароль (при наличии)"
                >
                    <Input.Password placeholder="Нет пароля" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PasswordModal;
