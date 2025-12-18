import React, { useState, useEffect } from 'react';
import { Button, Col, DatePicker, Form, InputNumber, Row, Select, message, Typography, Spin } from 'antd';
import { parseExcel, StudentPayment } from './utils/excelParser';
import { createZip } from './utils/zip';
import { formatDate } from './utils/date';
import { getOptionsFromConstants, sleep } from './utils/index';
import { saveAs } from 'file-saver';
import { DEFAULT_LESSON_SHORTCUTS, PAYMENT_METHOD_OPTIONS } from './constants';

import type { DocumentProps } from '@react-pdf/renderer';

import Receipt from './pdf/Receipt';
import SettingsModal from './components/SettingsModal';
import ReceiptCarousel from './components/ReceiptCarousel';
import PasswordModal from './components/PasswordModal';

const { Title } = Typography;

type PDFDocumentElement = React.ReactElement<DocumentProps>;

function App(): React.JSX.Element {
    const [form] = Form.useForm();
    const [generatedPdfs, setGeneratedPdfs] = useState<{ fileName: string; document: PDFDocumentElement, receiptNumber: string }[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Загрузка...');
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [lessonShortcuts, setLessonShortcuts] = useState<LessonShortcut[]>(DEFAULT_LESSON_SHORTCUTS);
    const [filePath, setFilePath] = useState<string | null>(null);
    const [excelPassword, setExcelPassword] = useState<string | undefined>();
    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

    const fileName = filePath ? filePath.split(/[/\\]/).pop() : '';

    useEffect(() => {
        const savedReceiptStartNumber = localStorage.getItem('receiptStartNumber');
        if (savedReceiptStartNumber) {
            form.setFieldsValue({ receiptStartNumber: parseInt(savedReceiptStartNumber, 10) });
        }

        const savedLessonTypeMap = localStorage.getItem('lessonShortcuts');
        if (savedLessonTypeMap) {
            setLessonShortcuts(JSON.parse(savedLessonTypeMap));
        }
    }, []);

    const handleUpdateSettings = (newMap: LessonShortcut[]) => {
        setLessonShortcuts(newMap);
        localStorage.setItem('lessonShortcuts', JSON.stringify(newMap));
    };

    const onSubmit = async (values: { dateRange: any, receiptStartNumber: number, paymentMethods: number[] }): Promise<void> => {
        if (!filePath) {
            message.error('Пожалуйста, выберите Excel файл.');
            return;
        }

        setLoading(true);
        setLoadingText('Генерация PDF...');

        try {
            const paymentMethods = values.paymentMethods;
            let [startDate, endDate] = values.dateRange;
            startDate = startDate.hour(5).minute(0).second(0).toDate();
            endDate = endDate.hour(5).minute(0).second(0).toDate();

            const isOkPayment = (row: StudentPayment) => row.type
                && row.operationDate
                && row.paymentMethod
                && paymentMethods.includes(row.paymentMethod)
                && row.operationDate >= startDate
                && row.operationDate <= endDate && row.incomeAmount > 0;

            const payments = await parseExcel(filePath, lessonShortcuts, excelPassword);
            const paymentsToShow = payments.filter(isOkPayment);

            if (!paymentsToShow.length) {
                message.warning('Не найдено подходящих платежей');
                setGeneratedPdfs([]);
                return;
            }

            const startNumber = values.receiptStartNumber;

            const pdfs = paymentsToShow.map((payment, index) => {
                const receiptNumber = `${formatDate(payment.operationDate!, 'yy')}-${startNumber + index}`;
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
        catch (error: any) {
            console.error('Error generating pdf files', error);

            if (typeof error.message === 'string' && error.message.includes('error parsing excel file')) {
                message.warning('Произошла ошибка при чтении файла, проверьте правильность пароля и загрузите документ заново.');
                setFilePath(null);
            }
            else {
                message.error('Произошла ошибка при генерации PDF файлов. Проверьте корректность Excel файла или обратитесь в техподдержку.');
            }
        }
        finally {
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
        }
        finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async () => {
        const selectedFilePath = await window.api.pickFile(['xlsx', 'xls']);
        if (selectedFilePath) {
            setFilePath(selectedFilePath);
            setPasswordModalVisible(true);
        }
    };

    const handlePasswordModalOk = (password?: string) => {
        setExcelPassword(password);
        setPasswordModalVisible(false);
        if (!filePath) {
            message.error('Произошла ошибка. Файл не был выбран.');
            return;
        }
        message.success(`Файл ${fileName} выбран.`);
    };

    const handlePasswordModalCancel = () => {
        setFilePath(null);
        setExcelPassword(undefined);
        setPasswordModalVisible(false);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Spin spinning={loading} tip={loadingText} size="large" fullscreen />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <Title level={3} style={{ margin: 0 }}>
                    Генерация квитанций
                </Title>
                <Button onClick={() => setSettingsVisible(true)}>
                    Настройка сокращений
                </Button>
            </div>

            <Form form={form} name="excel-pdf-generator" layout="vertical" onFinish={onSubmit}>
                <Form.Item
                    label="Excel файл"
                    required
                >
                    {filePath ? (
                        <Row align="middle" gutter={8}>
                            <Col>
                                <Typography.Text>{fileName || 'Excel'}</Typography.Text>
                            </Col>
                            <Col>
                                <Button onClick={() => {
                                    setFilePath(null);
                                    setExcelPassword(undefined);
                                }} danger size="small">
                                    Удалить
                                </Button>
                            </Col>
                        </Row>
                    ) : (
                        <Button type="default" onClick={handleFileSelect}>
                            Выбрать Excel файл
                        </Button>
                    )}
                </Form.Item>

                <Row gutter={16}>
                    <Col span={14}>
                        <Form.Item
                            name="dateRange"
                            label="Период операций (включительно)"
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

                <Form.Item
                    name="paymentMethods"
                    label="Вид оплаты"
                    initialValue={[PAYMENT_METHOD_OPTIONS.cashless]}
                    rules={[{ required: true, message: 'Выберите хотя бы один вид оплаты' }]}
                >
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="Выберите вид оплаты"
                        options={getOptionsFromConstants(PAYMENT_METHOD_OPTIONS)}
                    />
                </Form.Item>

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

            <SettingsModal
                open={settingsVisible}
                lessonShortcuts={lessonShortcuts}
                onClose={() => setSettingsVisible(false)}
                onUpdate={handleUpdateSettings}
            />

            <PasswordModal
                open={isPasswordModalVisible}
                onOk={handlePasswordModalOk}
                onCancel={handlePasswordModalCancel}
                fileName={fileName || ''}
            />
        </div>
    );
}

export default App;
