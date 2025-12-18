import React from 'react';
import { Popconfirm, Modal, Button, Form, Input, Table, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface Props {
    open: boolean;
    onClose: () => void;
    lessonShortcuts: LessonShortcut[];
    onUpdate: (values: LessonShortcut[]) => void;
}

const SettingsModal: React.FC<Props> = ({ open, onClose, lessonShortcuts, onUpdate }) => {
    const [form] = Form.useForm();

    const handleAdd = (values: any) => {
        const newData = [...lessonShortcuts, { key: values.newKey, value: values.newValue }];
        onUpdate(newData);
        form.resetFields(['newKey', 'newValue']);
    };

    const handleDelete = (key: string) => {
        const newData = lessonShortcuts.filter(item => item.key !== key);
        onUpdate(newData);
    };

    const columns = [
        {
            title: 'Сокращение',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Расшифровка',
            dataIndex: 'value',
            key: 'value',
        },
        {
            title: 'Удаление',
            key: 'action',
            render: (_: any, record: { key: string }) => (
                <Popconfirm
                    title="Вы уверены, что хотите удалить это сокращение?"
                    onConfirm={() => handleDelete(record.key)}
                >
                    <Button type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <Modal
            title="Настройка сокращений"
            open={open}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <Alert
                description="Если сокращение не будет найдено, то квитанция сгенерирована не будет."
                type="warning"
                showIcon
                style={{ marginBottom: '20px' }}
            />
            <Table dataSource={lessonShortcuts} columns={columns} pagination={false} size="small" />

            <Form form={form} layout="inline" style={{ marginTop: '20px' }} onFinish={handleAdd}>
                <Form.Item name="newKey" rules={[{ required: true, message: 'Введите сокращение' }]}>
                    <Input placeholder="Сокращение" />
                </Form.Item>
                <Form.Item name="newValue" rules={[{ required: true, message: 'Введите расшифровку' }]}>
                    <Input placeholder="Расшифровка" />
                </Form.Item>
                <Form.Item>
                    <Button icon={<PlusOutlined />} htmlType="submit">
                        Добавить
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SettingsModal;
