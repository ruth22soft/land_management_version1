import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from '@react-pdf/renderer';
import { QRCodeComponent } from '../../utils/qrGenerator';
import { fontFamilies } from '../../utils/fonts';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: fontFamilies.roboto,
    },
    header: {
        marginBottom: 30,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        color: '#2196F3',
        marginBottom: 10,
        fontWeight: 500,
    },
    subtitle: {
        fontSize: 14,
        color: '#333',
        marginBottom: 30,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    infoGroup: {
        width: '48%',
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        color: '#333',
        marginBottom: 5,
        fontWeight: 500,
    },
    value: {
        fontSize: 12,
        color: '#000',
        fontFamily: fontFamilies.notoSansEthiopic,
    },
    qrCode: {
        width: 120,
        height: 120,
        alignSelf: 'center',
        marginTop: 40,
    },
    signature: {
        width: 150,
        height: 60,
        marginTop: 20,
        alignSelf: 'flex-end',
    },
});

const CertificateTemplate = ({ data }) => {
    const formatLandSize = (size) => {
        const numSize = parseFloat(size);
        if (numSize >= 10000) {
            return `${(numSize / 10000).toFixed(2)} hectares`;
        } else if (numSize >= 100) {
            return `${(numSize / 100).toFixed(2)} ares`;
        }
        return `${numSize} square meters`;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Land Registration Certificate</Text>
                    <Text style={styles.subtitle}>Federal Democratic Republic of Ethiopia</Text>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Certificate Number:</Text>
                        <Text style={styles.value}>{data.certificateNumber}</Text>
                        <Text style={styles.label}>Issue Date:</Text>
                        <Text style={styles.value}>{new Date(data.dateOfIssuance).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Full Name:</Text>
                        <Text style={styles.value}>{`${data.ownerFirstName} ${data.ownerLastName}`}</Text>
                        <Text style={styles.label}>National ID:</Text>
                        <Text style={styles.value}>{data.nationalId}</Text>
                        <Text style={styles.label}>Phone:</Text>
                        <Text style={styles.value}>{data.phone}</Text>
                        <Text style={styles.label}>Address:</Text>
                        <Text style={styles.value}>{data.address}</Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Region:</Text>
                        <Text style={styles.value}>{data.region}</Text>
                        <Text style={styles.label}>Woreda:</Text>
                        <Text style={styles.value}>{data.woreda}</Text>
                        <Text style={styles.label}>Kebele:</Text>
                        <Text style={styles.value}>{data.kebele}</Text>
                    </View>
                    <View style={styles.infoGroup}>
                        <Text style={styles.label}>Land Size:</Text>
                        <Text style={styles.value}>{formatLandSize(data.landSize)}</Text>
                        <Text style={styles.label}>Land Use Type:</Text>
                        <Text style={styles.value}>{data.landUseType}</Text>
                    </View>
                </View>

                <View style={styles.qrCode}>
                    <QRCodeComponent value={JSON.stringify({
                        certificateNumber: data.certificateNumber,
                        ownerName: `${data.ownerFirstName} ${data.ownerLastName}`,
                        issueDate: data.dateOfIssuance
                    })} />
                </View>

                <Image
                    style={styles.signature}
                    src="/assets/signature-placeholder.png"
                />
            </Page>
        </Document>
    );
};

export default CertificateTemplate;
