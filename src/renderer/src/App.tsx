import React, { useState, useEffect } from 'react';
import { Button, Col, DatePicker, Form, InputNumber, Row, Upload, message, Typography, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Receipt from './pdf/Receipt';
import { parseExcel, StudentPayment } from './utils/excelParser';
import { createZip } from './utils/zip';
import { formatDate } from './utils/date';
import { sleep } from './utils/index';
import { saveAs } from 'file-saver';

import type { UploadProps, UploadFile } from 'antd';
import type { DocumentProps } from '@react-pdf/renderer';

import ReceiptCarousel from './components/ReceiptCarousel';

const { Title } = Typography;

type PDFDocumentElement = React.ReactElement<DocumentProps>;

function App(): React.JSX.Element {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [generatedPdfs, setGeneratedPdfs] = useState<{ fileName: string; document: PDFDocumentElement, receiptNumber: string }[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Загрузка...');

    useEffect(() => {
        const savedReceiptStartNumber = localStorage.getItem('receiptStartNumber');
        if (savedReceiptStartNumber) {
            form.setFieldsValue({ receiptStartNumber: parseInt(savedReceiptStartNumber, 10) });
        }
    }, []);

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

    const onSubmit = async (values: { upload: any; dateRange: any, receiptStartNumber: number }): Promise<void> => {
        if (!fileList.length) {
            message.error('Пожалуйста, выберите Excel файл.');
            return;
        }

        setLoading(true);
        setLoadingText('Генерация PDF...');
        try {
            const [startDate, endDate] = values.dateRange;

            const isOkPayment = (row: StudentPayment) => row.type && row.operationDate && row.operationDate >= startDate && row.operationDate <= endDate && row.incomeAmount > 0;
            const payments = await parseExcel(fileList[0] as unknown as File);
            const paymentsToShow = payments.filter(isOkPayment);

            if (!paymentsToShow.length) {
                message.warning('Не найдено подходящих платежей за указанный период.');
                setGeneratedPdfs([]);
                return;
            }

            const startNumber = values.receiptStartNumber;

            const pdfs = paymentsToShow.map((payment, index) => {
                const receiptNumber = `${ formatDate(payment.operationDate!, 'yy') }-${ startNumber + index }`;
                const sName = payment.studentName ? payment.studentName?.replace(/\s/g, '_') : 'Без_имени';
                const dName = formatDate(payment.operationDate!, 'dd-MM-yyyy');
                const fileName = `${sName}_${receiptNumber}_${dName}.pdf`;

                return {
                    fileName,
                    document: <Receipt payment={payment} receiptNumber={receiptNumber} />,
                    receiptNumber,
                };
            });

            const nextReceiptStartNumber = startNumber + paymentsToShow.length;
            localStorage.setItem('receiptStartNumber', String(nextReceiptStartNumber));
            form.setFieldsValue({ receiptStartNumber: nextReceiptStartNumber });

            setGeneratedPdfs(pdfs);
            setCurrentSlide(0);

            message.success(`Сгенерировано ${pdfs.length} PDF файлов.`);
        }
        catch (error) {
            console.error('Error generating pdf files', error);
            message.error('Произошла ошибка при генерации PDF файлов. Проверьте корректность Excel файла или обратитесь в техподдержку.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        setLoading(true);
        await sleep(300);
        setLoadingText('Создание архива...');
        try {
            const zipBlob = await createZip(generatedPdfs);
            saveAs(zipBlob, 'Квитанции.zip');
        }
        catch (error) {
            console.error('Error creating zip file', error);
            message.error('Произошла ошибка при создании ZIP файла. Проверьте корректность данных или обратитесь в техподдержку.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Spin spinning={loading} tip={loadingText} size="large" fullscreen />

            <Title level={3} style={{ textAlign: 'center', marginBottom: '30px' }}>
                Генерация квитанций
            </Title>
            <Form form={form} name="excel-pdf-generator" layout="vertical" onFinish={onSubmit}>
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

                <Row gutter={16}>
                    <Col span={14}>
                        <Form.Item
                            name="dateRange"
                            label="Период операций"
                            rules={[{ required: true, message: 'Обязательное поле' }]}
                        >
                            <DatePicker.RangePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <Form.Item
                            name="receiptStartNumber"
                            label="Номер, с которого начать генерацию"
                            initialValue={1}
                            rules={[
                                { required: true, message: 'Обязательное поле' },
                                {
                                    type: 'number',
                                    min: 1,
                                    message: 'Номер должен быть больше нуля',
                                },
                                {
                                    validator: (_, value) =>
                                        Number.isInteger(value)
                                            ? Promise.resolve()
                                            : Promise.reject(new Error('Номер должен быть целым числом')),
                                }
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                Сгенерировать PDF
                            </Button>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item>
                            <Button
                                style={{ width: '100%' }}
                                disabled={generatedPdfs.length === 0}
                                onClick={handleDownload}
                            >
                                Скачать архивом
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <ReceiptCarousel
                generatedPdfs={generatedPdfs}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
            />
        </div>
    );
}

export default App;
