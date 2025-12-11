import React, { useRef, useState } from 'react';
import { Button, Carousel, DatePicker, Form, Upload, message, Typography } from 'antd';
import { LeftOutlined, RightOutlined, UploadOutlined } from '@ant-design/icons';
import { PDFViewer } from '@react-pdf/renderer';
import Receipt from './pdf/Receipt';
import { parseExcel, StudentPayment } from './utils/excelParser';
import { CarouselRef } from 'antd/es/carousel';
import { formatDate } from './utils/date';

import type { UploadProps, UploadFile } from 'antd';
import type { DocumentProps } from '@react-pdf/renderer';

const { Title } = Typography;

type PDFDocumentElement = React.ReactElement<DocumentProps>;

function App(): React.JSX.Element {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [generatedPdfs, setGeneratedPdfs] = useState<{ fileName: string; document: PDFDocumentElement }[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselRef = useRef<CarouselRef>(null);

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

    const onSubmit = async (values: { upload: any; dateRange: any }): Promise<void> => {
        if (!fileList.length) {
            message.error('Пожалуйста, выберите Excel файл.');
            return;
        }

        const [startDate, endDate] = values.dateRange;

        try {
            const isOkPayment = (row: StudentPayment) => row.type && row.operationDate && row.operationDate >= startDate && row.operationDate <= endDate && row.incomeAmount > 0;
            const payments = await parseExcel(fileList[0] as unknown as File);
            const paymentsToShow = payments.filter(isOkPayment);

            if (!paymentsToShow.length) {
                message.warning('Не найдено подходящих платежей за указанный период.');
                setGeneratedPdfs([]);
                return;
            }

            const pdfs = paymentsToShow.map((payment, index) => {
                const sName = payment.studentName ? payment.studentName?.replace(/\s/g, '_') : 'Без_имени';
                const rName = '';
                const dName = formatDate(payment.operationDate!, 'dd-MM-yyyy');
                const fileName = `${sName}_${rName}_${dName}.pdf`;

                return {
                    fileName,
                    document: <Receipt payment={payment} receiptNumber={index + 1} />,
                };
            });

            setGeneratedPdfs(pdfs);
            setCurrentSlide(0);

            message.success(`Сгенерировано ${pdfs.length} PDF файлов.`);
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
                {generatedPdfs.length > 0 && (
                    <>
                        <Carousel
                            ref={carouselRef}
                            dots={false}
                            afterChange={(current) => setCurrentSlide(current)}
                        >
                            {generatedPdfs.map(({ document }, index) => (
                                <div key={index}>
                                    <PDFViewer width="100%" height="600px">{document}</PDFViewer>
                                </div>
                            ))}
                        </Carousel>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                            <Button onClick={() => carouselRef.current?.prev()} icon={<LeftOutlined />} />
                            <Typography.Text style={{ margin: '0 10px' }}>
                                {currentSlide + 1} / {generatedPdfs.length}
                            </Typography.Text>
                            <Button onClick={() => carouselRef.current?.next()} icon={<RightOutlined />} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
