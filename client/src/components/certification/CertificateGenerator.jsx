import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import DefaultProfile from '../../assets/images/default-profile.png';
import { Box, Button } from '@mui/material';
import { Preview as PreviewIcon, Download as DownloadIcon } from '@mui/icons-material';

// Use a PNG version of the flag
const ETHIOPIAN_FLAG_URL = "https://flagcdn.com/h240/et.png";

// Define styles without any images or custom fonts
const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#FFFFFF'
    },
    container: {
        border: 2,
        borderColor: '#006400',
        margin: 10,
        padding: 20,
        height: '95%',
        position: 'relative'
    },
    header: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'flex-start',
        borderBottom: 1,
        borderBottomColor: '#006400',
        paddingBottom: 10
    },
    headerLogo: {
        width: 50,
        height: 50,
        marginRight: 10
    },
    headerText: {
        flex: 1
    },
    title: {
        fontSize: 16,
        color: '#006400',
        marginBottom: 3
    },
    subtitle: {
        fontSize: 14,
        color: '#006400',
        marginBottom: 3
    },
    certificateNumber: {
        fontSize: 9,
        color: '#666666'
    },
    mainContent: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 15,
        borderBottom: 1,
        borderBottomColor: '#006400',
        paddingBottom: 15
    },
    leftColumn: {
        width: '22%'
    },
    rightColumn: {
        width: '78%',
        paddingLeft: 15
    },
    ownerPhotoSection: {
        alignItems: 'center',
        marginBottom: 15,
        padding: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 4
    },
    ownerPhoto: {
        width: 100,
        height: 120,
        marginBottom: 3
    },
    photoLabel: {
        fontSize: 9,
        textAlign: 'center',
        color: '#666666'
    },
    infoSection: {
        marginBottom: 10
    },
    sectionTitle: {
        fontSize: 12,
        color: '#006400',
        fontWeight: 'bold',
        marginBottom: 6
    },
    row: {
        flexDirection: 'row',
        marginBottom: 3
    },
    label: {
        width: 70,
        fontSize: 10,
        color: '#444444'
    },
    value: {
        flex: 1,
        fontSize: 10
    },
    qrSection: {
        alignItems: 'center',
        marginTop: 15
    },
    qrCode: {
        width: 80,
        height: 80
    },
    qrLabel: {
        fontSize: 7,
        textAlign: 'center',
        marginTop: 3,
        color: '#666666'
    },
    signatures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 10
    },
    signatureBox: {
        alignItems: 'center',
        width: '45%'
    },
    signatureLabel: {
        fontSize: 9,
        marginBottom: 5
    },
    signatureName: {
        fontSize: 9,
        marginTop: 3
    },
    signatureImage: {
        width: 120,
        height: 60,
        marginBottom: 3
    },
    signatureLine: {
        width: 120,
        borderBottom: '1px solid #000000',
        marginBottom: 3
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        alignItems: 'center',
        borderTop: 1,
        borderTopColor: '#006400',
        paddingTop: 10
    },
    footerLogo: {
        width: 40,
        height: 30,
        marginBottom: 5,
        opacity: 0.3
    },
    footerText: {
        fontSize: 7,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 2
    }
});

const CertificateGenerator = ({ certificateData }) => {
    const [showPreview, setShowPreview] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    // Function to validate and process image
    const processImage = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            // Check if it's an image
            if (!blob.type.startsWith('image/')) {
                throw new Error('Invalid image format');
            }

            // Convert to base64
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Image processing error:', error);
            setImageError(true);
            return null;
        }
    };

    // Function to handle owner photo
    const handleOwnerPhoto = async (photo) => {
        if (!photo) return DefaultProfile;
        
        try {
            // Check if photo is already base64
            if (photo.startsWith('data:image/')) {
                return photo;
            }
            
            // If it's a URL, process it
            return await processImage(photo);
        } catch (error) {
            console.error('Owner photo processing error:', error);
            return DefaultProfile;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Preview Button */}
            <Button
                variant="contained"
                startIcon={<PreviewIcon />}
                onClick={() => setShowPreview(!showPreview)}
                sx={{ mb: 2 }}
            >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>

            {/* PDF Preview */}
            {showPreview && (
                <Box sx={{ height: '600px', mb: 2 }}>
                    <PDFViewer width="100%" height="100%">
                        <CertificateDocument 
                            certificateData={certificateData}
                            processImage={processImage}
                            handleOwnerPhoto={handleOwnerPhoto}
                        />
                    </PDFViewer>
                </Box>
            )}

            {/* Download Button */}
            <PDFDownloadLink
                document={
                    <CertificateDocument 
                        certificateData={certificateData}
                        processImage={processImage}
                        handleOwnerPhoto={handleOwnerPhoto}
                    />
                }
                fileName={`certificate-${certificateData?.certificateNumber || 'new'}.pdf`}
            >
                {({ blob, url, loading, error }) => (
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        disabled={loading || error || imageError}
                        sx={{
                            backgroundColor: '#4CAF50',
                            '&:hover': {
                                backgroundColor: '#45a049'
                            }
                        }}
                    >
                        {loading ? 'Generating PDF...' : 
                         error || imageError ? 'Error' : 
                         'Download Certificate'}
                    </Button>
                )}
            </PDFDownloadLink>

            {imageError && (
                <Text style={{ color: 'red', marginTop: 10 }}>
                    Error processing images. Please check image formats.
                </Text>
            )}
        </Box>
    );
};

export const CertificateDocument = ({ certificateData, processImage, handleOwnerPhoto }) => {
    const [qrCode, setQrCode] = React.useState(null);
    const [headerFlag, setHeaderFlag] = React.useState(null);
    const [footerFlag, setFooterFlag] = React.useState(null);
    const [ownerPhoto, setOwnerPhoto] = React.useState(null);
    const [ownerSignature, setOwnerSignature] = React.useState(null);
    const [officerSignature, setOfficerSignature] = React.useState(null);

    // Helper function to get owner's full name
    const getOwnerFullName = () => {
        if (certificateData?.ownerName) {
            return certificateData.ownerName;
        } else if (certificateData?.ownerFirstName || certificateData?.ownerLastName) {
            return `${certificateData?.ownerFirstName || ''} ${certificateData?.ownerLastName || ''}`.trim();
        }
        return 'N/A';
    };

    React.useEffect(() => {
        const init = async () => {
            try {
                // Generate QR Code
                const qrData = await QRCode.toDataURL(
                    certificateData?.certificateNumber || 'NO_CERTIFICATE'
                );
                setQrCode(qrData);

                // Process flag images
                const flagData = await processImage(ETHIOPIAN_FLAG_URL);
                if (flagData) {
                    setHeaderFlag(flagData);
                    setFooterFlag(flagData);
                }

                // Process owner photo
                const photoData = await handleOwnerPhoto(certificateData?.ownerPhoto);
                setOwnerPhoto(photoData);

                // Process signatures
                if (certificateData?.signatures?.owner) {
                    const ownerSig = await processImage(certificateData.signatures.owner);
                    setOwnerSignature(ownerSig);
                }
                
                if (certificateData?.signatures?.officer) {
                    const officerSig = await processImage(certificateData.signatures.officer);
                    setOfficerSignature(officerSig);
                }

            } catch (error) {
                console.error('Error initializing certificate:', error);
            }
        };

        init();
    }, [certificateData]);

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.container}>
                    {/* Header Section */}
                    <View style={styles.header}>
                        {headerFlag && (
                            <Image 
                                src={headerFlag}
                                style={styles.headerLogo}
                            />
                        )}
                        <View style={styles.headerText}>
                            <Text style={styles.title}>Federal Democratic Republic of Ethiopia</Text>
                            <Text style={styles.subtitle}>Land Registration Certificate</Text>
                            <Text style={styles.certificateNumber}>
                                Certificate Number: {certificateData?.certificateNumber}
                            </Text>
                        </View>
                    </View>

                    {/* Main Content */}
                    <View style={styles.mainContent}>
                        {/* Left Column */}
                        <View style={styles.leftColumn}>
                            <View style={styles.ownerPhotoSection}>
                                <Image style={styles.ownerPhoto} src={ownerPhoto || DefaultProfile} />
                                <Text style={styles.photoLabel}>Owner Photo</Text>
                            </View>
                            
                            <View style={styles.qrSection}>
                                {qrCode && (
                                    <>
                                        <Image style={styles.qrCode} src={qrCode} />
                                        <Text style={styles.qrLabel}>Scan to verify certificate authenticity</Text>
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Right Column */}
                        <View style={styles.rightColumn}>
                            {/* Owner Information */}
                            <View style={styles.infoSection}>
                                <Text style={styles.sectionTitle}>Owner Information</Text>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Full Name:</Text>
                                    <Text style={styles.value}>{getOwnerFullName()}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>National ID:</Text>
                                    <Text style={styles.value}>{certificateData?.nationalId || 'N/A'}</Text>
                                </View>
                            </View>

                            {/* Land Information */}
                            <View style={styles.infoSection}>
                                <Text style={styles.sectionTitle}>Land Information</Text>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Region:</Text>
                                    <Text style={styles.value}>{certificateData?.landLocation?.region}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Woreda:</Text>
                                    <Text style={styles.value}>{certificateData?.landLocation?.woreda}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Kebele:</Text>
                                    <Text style={styles.value}>{certificateData?.landLocation?.kebele}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Land Size:</Text>
                                    <Text style={styles.value}>{certificateData?.landSize} sq meters</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Land Use:</Text>
                                    <Text style={styles.value}>{certificateData?.landUseType}</Text>
                                </View>
                            </View>

                            {/* Legal Rights & Terms */}
                            <View style={styles.infoSection}>
                                <Text style={styles.sectionTitle}>Legal Rights & Terms</Text>
                                <Text style={styles.value}>{certificateData?.legalRights?.en}</Text>
                            </View>

                            {/* Certificate Validity */}
                            <View style={styles.infoSection}>
                                <Text style={styles.sectionTitle}>Certificate Validity</Text>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Date of Issue:</Text>
                                    <Text style={styles.value}>{certificateData?.dateOfIssuance}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Valid Until:</Text>
                                    <Text style={styles.value}>{certificateData?.validUntil}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Signatures Section */}
                    <View style={styles.signatures}>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>Owner's Signature</Text>
                            {ownerSignature ? (
                                <Image 
                                    src={ownerSignature} 
                                    style={styles.signatureImage}
                                />
                            ) : (
                                <View style={styles.signatureLine} />
                            )}
                            <Text style={styles.signatureName}>{getOwnerFullName()}</Text>
                        </View>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>Registration Officer</Text>
                            {officerSignature ? (
                                <Image 
                                    src={officerSignature} 
                                    style={styles.signatureImage}
                                />
                            ) : (
                                <View style={styles.signatureLine} />
                            )}
                            <Text style={styles.signatureName}>
                                {certificateData?.registrationOfficer || 'Land Registration Office'}
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        {footerFlag && (
                            <Image 
                                src={footerFlag}
                                style={styles.footerLogo}
                            />
                        )}
                        <Text style={styles.footerText}>
                            This certificate is an official document issued by the Ethiopian Land Registration Office
                        </Text>
                        <Text style={styles.footerText}>
                            Federal Democratic Republic of Ethiopia Land Registration Authority
                        </Text>
                        <Text style={styles.footerText}>
                            © {new Date().getFullYear()} - All rights reserved
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default CertificateGenerator;
