import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    signature: {
        flexDirection: 'row',
        textAlign: 'center',
        fontSize: 10,
    },
    signatory: {
        fontWeight: 'bold',
    },
    placeholder: {
        marginLeft: 5,
    },
    tooltip: {
        marginLeft: 12,
    },
});

const Signature = () => (
    <View style={styles.signature}>
        <Text style={styles.signatory}>ИП Седегова Д.А.</Text>
        <View style={styles.placeholder}>
            <Text>
                _________________
            </Text>
            <Text style={styles.tooltip}>
                (подпись)
            </Text>
        </View>
    </View>
);

export default Signature;
