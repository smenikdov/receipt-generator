import React, { useRef } from 'react';
import { Carousel, Button, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { PDFViewer } from '@react-pdf/renderer';
import { CarouselRef } from 'antd/es/carousel';
import type { DocumentProps } from '@react-pdf/renderer';

type PDFDocumentElement = React.ReactElement<DocumentProps>;

interface ReceiptCarouselProps {
    generatedPdfs: {
        fileName: string;
        document: PDFDocumentElement;
        receiptNumber: string;
    }[];
    currentSlide: number;
    setCurrentSlide: (slide: number) => void;
}

const ReceiptCarousel: React.FC<ReceiptCarouselProps> = ({
    generatedPdfs,
    currentSlide,
    setCurrentSlide,
}) => {
    const carouselRef = useRef<CarouselRef>(null);

    if (generatedPdfs.length === 0) {
        return null;
    }

    return (
        <div style={{ marginTop: '20px' }}>
            <Carousel
                ref={carouselRef}
                dots={false}
                afterChange={(current) => setCurrentSlide(current)}
            >
                {generatedPdfs.map(({ document }, index) => (
                    <div key={index}>
                        <PDFViewer width="100%" height="520px">{document}</PDFViewer>
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
        </div>
    );
};

export default ReceiptCarousel;
