import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';
import PTSerifRegular from '../assets/font/PTSerif-Regular.ttf';
import PTSerifBold from '../assets/font/PTSerif-Bold.ttf';
import PTSerifItalic from '../assets/font/PTSerif-Italic.ttf';
import PTSerifBoldItalic from '../assets/font/PTSerif-BoldItalic.ttf';
import Signature from './Signature';
import LabelWithValue from './LabelWithValue';
import { Table, Row, Col } from './Table';
import { StudentPayment } from '../utils/excelParser';
import { number2string } from '../utils/number';
import { formatDate } from '../utils/date';

Font.register({
    family: 'PTSerif',
    fonts: [
        { src: PTSerifRegular },
        { src: PTSerifBold, fontWeight: 'bold' },
        { src: PTSerifItalic, fontStyle: 'italic' },
        { src: PTSerifBoldItalic, fontWeight: 'bold', fontStyle: 'italic' },
    ],
});

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 10,
        backgroundColor: '#fff',
        fontFamily: 'PTSerif',
        flexDirection: 'row',
    },

    userBlock: {
        width: '66%',
        paddingRight: 10,
    },
    managerBlock: {
        borderLeft: '1px solid #000',
        width: '34%',
        paddingLeft: 10,
    },

    receiptBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    receiptNumber: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    receiptDate: {
        fontSize: 12,
    },
});

const Header = ({ style }: { style?: Style }) => (
    <View style={style}>
        <Text style={{ fontWeight: 'bold' }}>ИП Седегова Дарья Александровна</Text>
        <Text>ИНН 662343832387 ОГРНИП 325665800188062</Text>
        <Text>Система налогообложения: ПСН</Text>
        <Text>622001, г. Нижний Тагил, ул. Первомайская, д. 21</Text>
    </View>
);

const NdsText = ({ style }: { style?: Style }) => (
    <View style={style}>
        <Text>
            НДС не облагается в связи с тем, что продавец применяет патентную систему
            налогообложения и не является налогоплательщиком НДС.
        </Text>
    </View>
);

interface Props {
    payment: StudentPayment,
    receiptNumber: string,
}

const Receipt = ({ payment, receiptNumber }: Props) => {
    const operationDate = payment.operationDate ? new Date(payment.operationDate) : new Date();
    const formattedDate = formatDate(operationDate, '«dd» MMMM yyyy г.');

    const amountInWords = number2string(payment.incomeAmount).toLowerCase();

    return (
        <Document>
            <Page size="A5" style={styles.page} orientation="landscape">
                <View style={styles.userBlock}>
                    <Header style={{ fontSize: 12, marginBottom: 25 }} />

                    <View style={styles.receiptBlock}>
                        <Text style={styles.receiptNumber}>Квитанция № {receiptNumber}</Text>
                        <Text style={styles.receiptDate}>Дата {formattedDate}</Text>
                    </View>

                    <Table >
                        <Row style={{ fontWeight: 'bold' }}>
                            <Col value="Наименование товара / услуги" />
                            <Col value="Стоимость, руб" />
                        </Row>
                        <Row>
                            <Col value={payment.type || 'Оплата за услуги'} />
                            <Col value={payment.incomeAmount.toFixed(2)} />
                        </Row>
                        <Row>
                            <Col />
                            <Col />
                        </Row>
                        <Row>
                            <Col />
                            <Col />
                        </Row>
                    </Table>

                    {payment.studentName && (
                        <Text style={{ marginTop: 5 }}>
                            {payment.studentName}
                        </Text>
                    )}

                    <LabelWithValue
                        label="Оплачено за услуги:"
                        value={`${ payment.incomeAmount.toFixed(2) } руб. (${ amountInWords }) 00 копеек`}
                        style={{ marginBottom: 5, marginTop: 20 }}
                    />

                    <NdsText style={{ marginBottom: 20 }} />

                    <Signature />
                </View>

                <View style={styles.managerBlock}>
                    <Header style={{ fontSize: 8, marginBottom: 10 }} />

                    <View style={{ marginBottom: 5 }}>
                        <Text style={styles.receiptNumber}>Квитанция № {receiptNumber}</Text>
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.receiptDate}>Дата {formattedDate}</Text>
                    </View>

                    <LabelWithValue
                        label="Наименование товара/услуги:"
                        value={payment.type || 'Оплата за услуги'}
                        style={{ marginBottom: 10 }}
                    />

                    <LabelWithValue
                        label="Стоимость, руб:"
                        value={`${ payment.incomeAmount.toFixed(2) } (${ amountInWords })`}
                        style={{ marginBottom: 10 }}
                    />

                    <NdsText style={{ marginBottom: 40 }} />

                    <Signature />
                </View>
            </Page>
        </Document>
    )
};

export default Receipt;
