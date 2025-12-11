import { useState } from 'react';
import { Button, DatePicker, Form, Upload, message, Typography } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import Receipt from './pdf/Receipt';
import { parseExcel, StudentPayment } from './utils/excelParser';

const { Title } = Typography;

function App(): React.JSX.Element {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const props: UploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            if (fileList.length >= 1) {
                message.error('Вы можете загрузить только один файл.');
                return Upload.LIST_IGNORE;
            }
            setFileList([...fileList, file as UploadFile]);
            return false;
        },
        fileList,
        accept: '.xls,.xlsx',
    };

    const onFinish = async (values: { upload: any; dateRange: any }): Promise<void> => {
        if (!fileList.length) {
            message.error('Пожалуйста, выберите Excel файл.');
            return;
        }

        const [startDate, endDate] = values.dateRange;

        try {
            const isOkPayment = (row: StudentPayment) => row.type && row.operationDate && row.operationDate >= startDate && row.operationDate <= endDate && row.incomeAmount > 0;
            const payments = await parseExcel(fileList[0] as unknown as File);
            console.log('Parsed Excel data:', payments);
            const paymentsToShow = payments.filter(isOkPayment);

            console.log('Parsed Excel data:', paymentsToShow);

            message.success(`Файл: ${fileList[0].name}, С: ${startDate.format('YYYY-MM-DD')}, По: ${endDate.format('YYYY-MM-DD')}`);
        }
        catch (error) {
            console.error('Error generating pdf files', error);
            message.error('Произошла ошибка при генерации PDF файлов. Проверьте корректность Excel файла или обратитесь в техподдержку.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: '30px' }}>
                Генерация квитанций
            </Title>
            <Form form={form} name="excel-pdf-generator" layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="upload"
                    label="Excel файл"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                        if (Array.isArray(e)) {
                            return e;
                        }
                        return e?.fileList;
                    }}
                    rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                    <Upload {...props} maxCount={1}>
                        <Button icon={<UploadOutlined />}>Выбрать файл</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    name="dateRange"
                    label="Период операций, для которых сгененрировать PDF"
                    rules={[{ required: true, message: 'Обязательное поле' }]}
                >
                    <DatePicker.RangePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                        Сгенерировать PDF
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ marginTop: '20px' }}>
                <div style={{ width: '100%', height: '500px', marginBottom: '20px' }}>
                    <PDFViewer width="100%" height="100%">
                        <Receipt />
                    </PDFViewer>
                </div>
                <PDFDownloadLink document={<Receipt />} fileName="document.pdf">
                    {({ loading }) =>
                        loading ? 'Загрузка...' : <Button type="primary">Скачать PDF</Button>
                    }
                </PDFDownloadLink>
            </div>
        </div>
    );
}

export default App;
