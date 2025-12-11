import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';

const styles = StyleSheet.create({
    table: {
        borderTop: '1px solid #000',
        borderLeft: '1px solid #000',
    },
    row: {
        flexDirection: 'row',
    },
    col: {
        flexGrow: 1,
        flexBasis: 1,
        borderRight: '1px solid #000',
        borderBottom: '1px solid #000',
        textAlign: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        minHeight: 10,
    },
});

interface TableProps {
    children: React.ReactNode;
    style?: Style,
}

export const Table = ({ children, style }: TableProps) => (
    <View style={{ ...styles.table, ...style }}>
        {children}
    </View>
);

interface RowProps {
    children: React.ReactNode;
    style?: Style,
}

export const Row = ({ children, style }: RowProps) => (
    <View style={{ ...styles.row, ...style }}>
        {children}
    </View>
);

interface ColProps {
    value?: string;
    style?: Style,
}

export const Col = ({ value, style }: ColProps) => (
    <View style={{ ...styles.col, ...style }}>
        <Text>
            {value}
        </Text>
    </View>
);
