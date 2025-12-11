import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';

const styles = StyleSheet.create({
    label: {
        fontWeight: 'bold',
    },
    value: {},
});

interface LabelWithValueProps {
    label: string;
    value: string;
    style?: Style;
}

const LabelWithValue = ({ label, value, style }: LabelWithValueProps) => (
    <View style={style}>
        <Text>
            <Text style={styles.label}>{label} </Text>
            <Text style={styles.value}>{value}</Text>
        </Text>
    </View>
);

export default LabelWithValue;
