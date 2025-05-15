import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    Stepper,
    Step,
    StepLabel,
    Grid,
    Paper,
    IconButton,
    Divider,
    Checkbox,
    Radio,
    RadioGroup,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Tabs,
    Tab,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import { 
    PhotoCamera, 
    Delete, 
    Add, 
    Edit,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    Visibility as PreviewIcon,
    Download as DownloadIcon,
    Assignment as AssignmentIcon,
    VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import SignaturePad from 'react-signature-canvas';
import { Document, Page, PDFDownloadLink } from '@react-pdf/renderer';
import { CertificateDocument } from '../certification/CertificateGenerator';
import CertificateGenerator from '../certification/CertificateGenerator';
import { useNavigate } from 'react-router-dom';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// API helper to fetch parcel by number
const fetchParcelByNumber = async (parcelNumber) => {
    const response = await fetch(`/api/parcels/number/${parcelNumber}`);
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
        // Try to extract error message from JSON, else fallback
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Parcel not found');
        } else {
            throw new Error('Parcel not found');
        }
    }
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        throw new Error('Unexpected response from server');
    }
};

// Helper to append nested data to FormData
const appendFormData = (formData, data, parentKey = '') => {
    if (data === null || data === undefined) return;
    if (typeof data === 'object' && !(data instanceof File)) {
        if (Array.isArray(data)) {
            data.forEach((item, idx) => {
                appendFormData(formData, item, `${parentKey}[${idx}]`);
            });
        } else {
            Object.entries(data).forEach(([key, value]) => {
                const newKey = parentKey ? `${parentKey}.${key}` : key;
                appendFormData(formData, value, newKey);
            });
        }
    } else {
        formData.append(parentKey, data);
    }
};

// Submit certificate registration to backend
const submitCertificate = async (data) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (
            key === 'landPhoto' ||
            key === 'boundaryPhoto' ||
            key === 'ownerPhoto' ||
            key === 'landPlanImage'
        ) {
            if (value && value instanceof File) formData.append(key, value); // append as files
        } else if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, value);
        }
    });

    const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
    });
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to register certificate');
        } else {
            throw new Error('Failed to register certificate');
        }
    }
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        throw new Error('Unexpected response from server');
    }
};

// Helper functions for generating unique IDs
const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `LRMS-${year}-${random}`;
};

// const generateParcelId = () => {
//     const year = new Date().getFullYear();
//     const random = Math.floor(10000 + Math.random() * 90000);
//     return `PARCEL-${year}-${random}`;
// };

// Default legal rights content
const defaultLegalRights = {
    en: `This certificate grants the registered owner the following rights:
1. Right to use the land for the specified purpose
2. Right to build structures according to local regulations
3. Right to transfer ownership through proper legal channels
4. Right to inherit and bequeath the land
5. Right to access the land
6. Right to lease or rent the land
7. Right to compensation if taken by the government

These rights are subject to applicable federal and local laws, regulations, and restrictions.`,
    am: `ይህ የምስክር ወረቀት ለተመዘገበው ባለቤት የሚከተሉትን መብቶች ይሰጣል:
1. መሬቱን ለተገለጸው ዓላማ የመጠቀም መብት
2. በአካባቢው ደንቦች መሰረት ግንባታዎችን የመገንባት መብት
3. ባለቤትነትን በትክክለኛ የህግ ቻናሎች የማስተላለፍ መብት
4. መሬቱን የመውረስ እና የማውረስ መብት
5. መሬቱን የመድረስ መብት
6. የማስያዝ ወይም የማከራየት መብት
7. በመንግስት ሲወሰድ ካሳ የማግኘት መብት

እነዚህ መብቶች በሚተገበሩ ፌዴራል እና አካባቢያዊ ህጎች፣ ደንቦች እና ገደቦች መሰረት ይሆናሉ።`
};

// Default terms and conditions content
const defaultTermsAndConditions = {
    en: `The certificate holder agrees to the following terms and conditions:

1. All information provided during registration must be accurate and truthful
2. The land must be used in accordance with applicable zoning regulations
3. Property taxes and applicable fees must be paid in a timely manner
4. Any transfer of ownership must follow the prescribed legal procedures
5. The certificate holder must report any changes in ownership information
6. The certificate may be revoked if obtained through fraudulent means
7. Disputes regarding the land will be resolved through the appropriate legal channels
8. The certificate holder must comply with all environmental regulations
9. Access must be granted to authorized government representatives for inspection purposes
10. Failure to comply with these terms may result in penalties or certificate revocation`,
    am: `የምስክር ወረቀቱ ባለቤት ከሚከተሉት ውሎች እና ሁኔታዎች ጋር ይስማማል፡

c2. መሬቱ ተፈጻሚ ከሚሆኑ የዞን ደንቦች ጋር በሚጣጣም መልኩ መጠቀም አለበት
3. የንብረት ግብሮች እና ተፈጻሚ የሚሆኑ ክፍያዎች በወቅቱ መከፈል አለባቸው
4. ማንኛውም የባለቤትነት ዝውውር የተወሰኑ ህጋዊ ሂደቶችን መከተል አለበት
5. የምስክር ወረቀቱ ባለቤት በባለቤትነት መረጃ ላይ የሚደረጉ ለውጦችን ሁሉ ማሳወቅ አለበት
6. ምስክር ወረቀቱ በማጭበርበር መንገድ ከተገኘ ሊሰረዝ ይችላል
7. መሬቱን በተመለከተ ያሉ ክርክሮች በተገቢው ህጋዊ መንገዶች ይፈታሉ
8. የምስክር ወረቀቱ ባለቤት ሁሉንም የአካባቢ ደንቦች ማክበር አለበት
9. ለተፈቀደላቸው የመንግስት ተወካዮች ለምርመራ ዓላማዎች መግባት መፍቀድ አለበት
10. እነዚህን ውሎች ያለማክበር ቅጣቶች ወይም የምስክር ወረቀት መሰረዝ ሊያስከትል ይችላል`
};

const styles = {
    signatureSection: {
        marginTop: '20px',
        padding: '20px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
    },
    signaturePad: {
        marginBottom: '20px',
        '& canvas': {
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff',
        }
    },
    signatureButtons: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px',
    },
    photoUpload: {
        marginBottom: '20px',
        '& img': {
            marginTop: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
        }
    },
    witnessSection: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
    },
    pageCounter: {
        display: 'flex',
        justifyContent: 'flex-end',
        mb: 2
    }
};

// Helper to normalize backend values to Select values
const normalizeSizeUnit = (unit) => {
    if (!unit) return '';
    const map = {
        'square meters': 'square_meters',
        'hectares': 'hectares',
        'acres': 'acres'
    };
    return map[unit.trim().toLowerCase()] || '';
};

const normalizeLandUseType = (type) => {
    if (!type) return '';
    const map = {
        'residential': 'residential',
        'agricultural': 'agricultural',
        'commercial': 'commercial',
        'industrial': 'industrial',
        'mixed use': 'mixed_use',
        'mixed_use': 'mixed_use'
    };
    return map[type.trim().toLowerCase()] || '';
};

const CertificationForm = () => {
    const navigate = useNavigate();
    const [parcelNumber, setParcelNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const fetchParcelData = async () => {
    setLoading(true);
    setErrors({});
    try {
        const parcelData = await fetchParcelByNumber(parcelNumber);
        const parcel = parcelData.data || parcelData; // Support both {data: ...} and direct object
        setFormData((prev) => ({
            ...prev,
            parcelId: parcel._id,
            ownerFirstName: parcel.ownerNameEn?.firstName || '',
            ownerFirstNameAm: parcel.ownerNameAm?.firstName || '',
            ownerLastName: parcel.ownerNameEn?.lastName || '',
            ownerLastNameAm: parcel.ownerNameAm?.lastName || '',
            nationalId: parcel.nationalId || '',
            landLocation: {
                region: parcel.landLocation?.regionEn || '',
                regionAm: parcel.landLocation?.regionAm || '',
                zone: parcel.landLocation?.zoneEn || '',
                zoneAm: parcel.landLocation?.zoneAm || '',
                woreda: parcel.landLocation?.woredaEn || '',
                woredaAm: parcel.landLocation?.woredaAm || '',
                kebele: parcel.landLocation?.kebeleEn || '',
                kebeleAm: parcel.landLocation?.kebeleAm || '',
                block: parcel.landLocation?.blockEn || parcel.landLocation?.blockAm || '',
                blockAm: parcel.landLocation?.blockAm || '',
            },
            landDescription: {
                en: parcel.landDescription?.en || '',
                am: parcel.landDescription?.am || '',
            },
            landSize: parcel.landSize || '',
            sizeUnit: normalizeSizeUnit(parcel.sizeUnit),
            landUseType: normalizeLandUseType(parcel.landUseType),
        }));
    } catch (err) {
        setErrors({ parcelNumber: err.message });
    }
    setLoading(false);
};
    const [formData, setFormData] = useState({
        // Auto-generated Fields
        certificateNumber: generateCertificateNumber(),
        registrationNumber: '', // This will be set after fetching parcel data
        parcelId: '', // This will be set after fetching parcel data
        parcelNumber: '',
        dateOfIssuance: formatDate(new Date()),
        
        // Owner Information
        ownerFirstName: '',
        ownerFirstNameAm: '',
        ownerLastName: '',
        ownerLastNameAm: '',
        nationalId: '',
        phone: '',
        address: '',
        addressAm: '',
        dateOfBirth: '',
        
        // Additional Personal Information
        fatherName: '',
        fatherNameAm: '',
        motherName: '',
        motherNameAm: '',
        maritalStatus: '',
        
        // Land Location
        landLocation: {
            region: '',
            regionAm: '',
            zone: '',
            zoneAm: '',
            woreda: '',
            woredaAm: '',
            kebele: '',
            kebeleAm: '',
            block: '',
            blockAm: '',
        },
        
        // Land Details
        landDescription: {
            en: '',
            am: ''
        },
        landSize: '',
        sizeUnit: '',
        landUseType: '',
        landUseTypeAm: '',
        
        // Legal Details
        legalRights: {
            en: defaultLegalRights.en,
            am: defaultLegalRights.am
        },
        termsAndConditions: {
            en: defaultTermsAndConditions.en,
            am: defaultTermsAndConditions.am
        },
        
        // Certificate Details
        issuingAuthority: '',
        issuingAuthorityAm: '',
        registrationOfficer: '',
        registrationOfficerAm: '',
        additionalNotes: '',
        additionalNotesAm: '',
        
        // Photos and Signatures
        landPhoto: null,
        boundaryPhoto: null,
        ownerPhoto: null,
        landPlanImage: null,
        signatures: {
            owner: null,
            registrationOfficer: null
        }
    });

    const [errors, setErrors] = useState({});
    
    const renderErrorMessage = (fieldName) => {
        const error = errors[fieldName];
        if (!error) return null;
        if (typeof error === 'string') return error;
        if (typeof error === 'object') {
            return Object.values(error).filter(Boolean).join(', ');
        }
        return null;
    };

    const renderFormSection = (title, content) => (
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>
            {content}
        </Paper>
    );

    const renderOwnerInfo = () => (
        <Grid container spacing={2}>
            {/* // for parcel id */}
            <Grid item xs={12} md={8}>
                <TextField
                    fullWidth
                    name="parcelNumber"
                    label="Parcel Number"
                    value={parcelNumber}
                    onChange={(e) => setParcelNumber(e.target.value)}
                    error={Boolean(errors.parcelNumber)}
                    helperText={errors.parcelNumber}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={fetchParcelData}
                    disabled={loading || !parcelNumber}
                >
                    {loading ? <CircularProgress size={24} /> : 'Fetch Parcel Data'}
                </Button>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="ownerFirstName"
                    label="First Name (English)"
                    value={formData.ownerFirstName}
                    disabled
                    InputProps={{
                        style: { backgroundColor: '#f5f5f5' } // Light gray background for read-only
                    }}
                    // onChange={handleInputChange}
                    // error={Boolean(errors.ownerFirstName)}
                    // helperText={renderErrorMessage('ownerFirstName')}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="ownerFirstNameAm"
                    label="First Name (Amharic) / ስም"
                    value={formData.ownerFirstNameAm}
                    disabled

                    // onChange={handleInputChange}
                    // error={Boolean(errors.ownerFirstNameAm)}
                    // helperText={renderErrorMessage('ownerFirstNameAm')}
                    // InputProps={{
                    //     style: { fontFamily: 'Noto Sans Ethiopic' }
                    // }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="ownerLastName"
                    label="Last Name (English)"
                    value={formData.ownerLastName}
                    disabled
                    // onChange={handleInputChange}
                    // error={Boolean(errors.ownerLastName)}
                    // helperText={renderErrorMessage('ownerLastName')}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="ownerLastNameAm"
                    label="Last Name (Amharic) / የአባት ስም"
                    value={formData.ownerLastNameAm}
                    disabled
                    // onChange={handleInputChange}
                    // error={Boolean(errors.ownerLastNameAm)}
                    // helperText={renderErrorMessage('ownerLastNameAm')}
                    // InputProps={{
                    //     style: { fontFamily: 'Noto Sans Ethiopic' }
                    // }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="dateOfBirth"
                    label="Date of Birth / የትውልድ ቀን"
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={handleInputChange}
                    error={Boolean(errors.dateOfBirth)}
                    helperText={errors.dateOfBirth}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="nationalId"
                    label="National ID"
                    value={formData.nationalId}
                    disabled
                    // onChange={handleInputChange}
                    // error={Boolean(errors.nationalId)}
                    // helperText={renderErrorMessage('nationalId')}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={Boolean(errors.phone)}
                    helperText={renderErrorMessage('phone')}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="address"
                    label="Address (English)"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={Boolean(errors.address)}
                    helperText={renderErrorMessage('address')}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="addressAm"
                    label="Address (Amharic) / አድራሻ"
                    value={formData.addressAm}
                    onChange={handleInputChange}
                    error={Boolean(errors.addressAm)}
                    helperText={renderErrorMessage('addressAm')}
                    InputProps={{
                        style: { fontFamily: 'Noto Sans Ethiopic' }
                    }}
                />
            </Grid>
        </Grid>
    );
    
    const renderPersonalInfo = () => (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="fatherName"
                    label="Father's Name (English)"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    error={Boolean(errors.fatherName)}
                    helperText={renderErrorMessage('fatherName')}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="fatherNameAm"
                    label="Father's Name (Amharic) / የአባት ስም"
                    value={formData.fatherNameAm}
                    onChange={handleInputChange}
                    error={Boolean(errors.fatherNameAm)}
                    helperText={renderErrorMessage('fatherNameAm')}
                    InputProps={{
                        style: { fontFamily: 'Noto Sans Ethiopic' }
                    }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="motherName"
                    label="Mother's Name (English)"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    error={Boolean(errors.motherName)}
                    helperText={renderErrorMessage('motherName')}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="motherNameAm"
                    label="Mother's Name (Amharic) / የእናት ስም"
                    value={formData.motherNameAm}
                    onChange={handleInputChange}
                    error={Boolean(errors.motherNameAm)}
                    helperText={renderErrorMessage('motherNameAm')}
                    InputProps={{
                        style: { fontFamily: 'Noto Sans Ethiopic' }
                    }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth error={Boolean(errors.maritalStatus)}>
                    <InputLabel>Marital Status</InputLabel>
                    <Select
                        name="maritalStatus"
                        value={formData.maritalStatus || ''}
                        onChange={handleInputChange}
                        label="Marital Status"
                    >
                        <MenuItem value="single">Single</MenuItem>
                        <MenuItem value="married">Married</MenuItem>
                        <MenuItem value="divorced">Divorced</MenuItem>
                        <MenuItem value="widowed">Widowed</MenuItem>
                    </Select>
                    {errors.maritalStatus && (
                        <FormHelperText>{errors.maritalStatus}</FormHelperText>
                    )}
                </FormControl>
            </Grid>
            </Grid>
    
    );
            
            {/* Children Information 
            <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Children Information / የልጆች መረጃ</Typography>
            </Grid>
            
            {formData.children.map((child, index) => (
                <React.Fragment key={index}>
                    <Grid item xs={12}> 
                        {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                Child {index + 1} 



                            </Typography>
                            </Box> {formData.children.length > 1 && (



                    //             <Button 
                    //                 size="small" 
                    //                 color="error" 
                    //                 onClick={() => handleRemoveChild(index)}
                    //             >
                    //                 Remove
                    //             </Button>
                    //         )}
                    //     </Box>
                    // </Grid>
                    // <Grid item xs={12} md={3}>
                    //     <TextField
                    //         fullWidth
                    //         name={`children[${index}].name`}
                    //         label="Child Name (English)"
                    //         value={child.name || ''}
                    //         onChange={handleInputChange}
                    //         error={Boolean(errors.children?.[index]?.name)}
    //                         helperText={errors.children?.[index]?.name || ''}
    //                     />
    //                 </Grid>
    //                 <Grid item xs={12} md={3}>
    //                     <TextField
    //                         fullWidth
    //                         name={`children[${index}].nameAm`}
    //                         label="Child Name (Amharic)"
    //                         value={child.nameAm || ''}
    //                         onChange={handleInputChange}
    //                         error={Boolean(errors.children?.[index]?.nameAm)}
    //                         helperText={errors.children?.[index]?.nameAm || ''}
    //                         InputProps={{
    //                             style: { fontFamily: 'Noto Sans Ethiopic' }
    //                         }}
    //                     />
    //                 </Grid>
    //                 <Grid item xs={12} md={3}>
    //                     <TextField
    //                         fullWidth
    //                         name={`children[${index}].age`}
    //                         label="Age"
    //                         type="number"
    //                         value={child.age || ''}
    //                         onChange={handleInputChange}
    //                         error={Boolean(errors.children?.[index]?.age)}
    //                         helperText={errors.children?.[index]?.age || ''}
    //                     />
    //                 </Grid>
    //                 <Grid item xs={12} md={3}>
    //                     <FormControl fullWidth error={Boolean(errors.children?.[index]?.gender)}>
    //                         <InputLabel>Gender</InputLabel>
    //                         <Select
    //                             name={`children[${index}].gender`}
    //                             value={child.gender || ''}
    //                             onChange={handleInputChange}
    //                             label="Gender"
    //                         >
    //                             <MenuItem value="male">Male</MenuItem>
    //                             <MenuItem value="female">Female</MenuItem>
    //                             <MenuItem value="other">Other</MenuItem>
    //                         </Select>
    //                         {errors.children?.[index]?.gender && (
    //                             <FormHelperText>{errors.children?.[index]?.gender}</FormHelperText>
    //                         )}
    //                     </FormControl>
    //                 </Grid>
    //             </React.Fragment>
    //         ))}
            
    //         <Grid item xs={12}>
    //             <Button 
    //                 variant="contained" 
    //                 color="primary"
    //                 onClick={handleAddChild}
    //             >
    //                 Add Child
    //             </Button>
    //         </Grid>
    //     </Grid>
    // );

    // const handleAddChild = () => {
    //     setFormData(prev => ({
    //         ...prev,
    //         children: [...prev.children, { name: '', nameAm: '', age: '', gender: '' }]
    //     }));
    // };

    // const handleRemoveChild = (index) => {
    //     setFormData(prev => {
    //         const newChildren = [...prev.children];
            
    //         // Always keep at least one child form
    //         if (newChildren.length === 1) {
    //             // Clear the only child form instead of removing it
    //             newChildren[0] = { name: '', nameAm: '', age: '', gender: '' };
    //         } else {
    //             // Remove the specific child
    //             newChildren.splice(index, 1);
    //         }
            
    //         return {
    //             ...prev,
    //             children: newChildren
    //         };
    //     });
        
    //     // Clear any errors for this child
    //     setErrors(prev => {
    //         if (!prev.children) return prev;
            
    //         const newErrors = { ...prev };
            
    // //         // Determine which fields to clear based on the current step
    // //         if (newErrors.children) {
    // //             // If we only have one child, just clear all child errors
    // //             if (newErrors.children.length <= 1) {
    // //                 delete newErrors.children;
    // //             } else {
    // //                 // Remove errors for the specific child
    // //                 const childrenErrors = [...newErrors.children];
    // //                 childrenErrors.splice(index, 1);
                    
    // //                 if (childrenErrors.length === 0) {
    // //                     delete newErrors.children;
    // //                 } else {
    // //                     newErrors.children = childrenErrors;
    // //                 }
    // //             }
    // //         }
            
    // //         return newErrors;
    // //     });
    // // };
    */}
    const renderLandLocation = () => (
        <Grid container spacing={2}>
            {Object.entries(formData.landLocation).map(([key, value]) => {
                const isAmharic = key.endsWith('Am');
                const baseKey = isAmharic ? key.slice(0, -2) : key;
                const label = isAmharic 
                    ? `${baseKey.charAt(0).toUpperCase() + baseKey.slice(1)} (Amharic)`
                    : `${baseKey.charAt(0).toUpperCase() + baseKey.slice(1)} (English)`;
                
                return (
                    <Grid item xs={12} md={6} key={key}>
                        <TextField
                            fullWidth
                            name={`landLocation.${key}`}
                            label={label}
                            value={value}
                            disabled
                            // onChange={handleInputChange}
                            // error={Boolean(errors.landLocation?.[key])}
                            // helperText={errors.landLocation?.[key] || ''}
                            // InputProps={isAmharic ? {
                            //     style: { fontFamily: 'Noto Sans Ethiopic' }
                            // } : undefined}
                        />
                    </Grid>
                );
            })}
        </Grid>
    );

    const renderLandDescription = () => {
        return (
            <Grid container spacing={2}>
                {/* Land Location Section */}
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Land Location / የመሬት አድራሻ</Typography>
                </Grid>
                
                {/* Region Fields */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Region (English)"
                        name="landLocation.region"
                        value={formData.landLocation.region || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landLocation?.region)}
                        // helperText={errors.landLocation?.region || ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Region (Amharic) / ክልል"
                        name="landLocation.regionAm"
                        value={formData.landLocation.regionAm || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landLocation?.regionAm)}
                        // helperText={errors.landLocation?.regionAm || ''}
                        // InputProps={{
                        //     style: { fontFamily: 'Noto Sans Ethiopic' }
                        // }}
                    />
                </Grid>
                
                {/* Zone Fields */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Zone (English)"
                        name="landLocation.zone"
                        value={formData.landLocation.zone || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landLocation?.zone)}
                        // helperText={errors.landLocation?.zone || ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Zone (Amharic) / ዞን"
                        name="landLocation.zoneAm"
                        value={formData.landLocation.zoneAm || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landLocation?.zoneAm)}
                        // helperText={errors.landLocation?.zoneAm || ''}
                        // InputProps={{
                        //     style: { fontFamily: 'Noto Sans Ethiopic' }
                        // }}
                    />
                </Grid>
                
                {/* Woreda Fields */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Woreda (English)"
                        name="landLocation.woreda"
                        value={formData.landLocation.woreda || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landLocation?.woreda)}
                        // helperText={errors.landLocation?.woreda || ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Woreda (Amharic) / ወረዳ"
                        name="landLocation.woredaAm"
                        value={formData.landLocation.woredaAm || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landLocation?.woredaAm)}
                        // helperText={errors.landLocation?.woredaAm || ''}
                        // InputProps={{
                        //     style: { fontFamily: 'Noto Sans Ethiopic' }
                        // }}
                    />
                </Grid>
                
                {/* Kebele Fields */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Kebele (English)"
                        name="landLocation.kebele"
                        value={formData.landLocation.kebele || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landLocation?.kebele)}
                        // helperText={errors.landLocation?.kebele || ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Kebele (Amharic) / ቀበሌ"
                        name="landLocation.kebeleAm"
                        value={formData.landLocation.kebeleAm || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landLocation?.kebeleAm)}
                        // helperText={errors.landLocation?.kebeleAm || ''}
                        // InputProps={{
                        //     style: { fontFamily: 'Noto Sans Ethiopic' }
                        // }}
                    />
                </Grid>
                
                {/* Block Fields */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Block (English) (Optional)"
                        name="landLocation.block"
                        disabled
                        // value={formData.landLocation.block || ''}
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landLocation?.block)}
                        // helperText={errors.landLocation?.block || ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Block (Amharic) / ብሎክ (አማራጭ)"
                        name="landLocation.blockAm"
                        value={formData.landLocation.blockAm || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landLocation?.blockAm)}
                        // helperText={errors.landLocation?.blockAm || ''}
                        // InputProps={{
                        //     style: { fontFamily: 'Noto Sans Ethiopic' }
                        // }}
                    />
                </Grid>
                
                {/* Land Description Section */}
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Land Description / የመሬት ማብራሪያ</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Land Description (English)"
                        name="landDescription.en"
                        value={formData.landDescription?.en || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landDescription?.en)}
                        // helperText={errors.landDescription?.en || ''}
                        // multiline
                        // rows={4}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Land Description (Amharic) / የመሬት ማብራሪያ"
                        name="landDescription.am"
                        value={formData.landDescription?.am || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landDescription?.am)}
                        // helperText={errors.landDescription?.am || ''}
                        // multiline
                        // rows={4}
                        // InputProps={{
                        //     style: { fontFamily: 'Noto Sans Ethiopic' }
                        // }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Land Size"
                        name="landSize"
                        type="number"
                        value={formData.landSize || ''}
                        disabled
                        // onChange={handleInputChange}
                        // error={Boolean(errors.landSize)}
                        // helperText={errors.landSize || ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Size Unit</InputLabel>
                        <Select
                            name="sizeUnit"
                            value={formData.sizeUnit || ''}
                            disabled
                            // onChange={handleInputChange}
                            // error={Boolean(errors.sizeUnit)}
                        >
                            <MenuItem value="square_meters">Square Meters</MenuItem>
                            <MenuItem value="hectares">Hectares</MenuItem>
                            <MenuItem value="acres">Acres</MenuItem>
                        </Select>
                        {errors.sizeUnit && (
                            <FormHelperText error>{errors.sizeUnit}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Land Use Type</InputLabel>
                        <Select
                            name="landUseType"
                            value={formData.landUseType || ''}
                            disabled
                            // onChange={handleInputChange}
                            // error={Boolean(errors.landUseType)}
                        >
                            <MenuItem value="residential">Residential</MenuItem>
                            <MenuItem value="agricultural">Agricultural</MenuItem>
                            <MenuItem value="commercial">Commercial</MenuItem>
                            <MenuItem value="industrial">Industrial</MenuItem>
                            <MenuItem value="mixed_use">Mixed Use</MenuItem>
                        </Select>
                        {errors.landUseType && (
                            <FormHelperText error>{errors.landUseType}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
            </Grid>
        );
    };

    const renderLegalDetails = () => (
        <Grid container spacing={2}>
            {/* Legal Rights and Terms Section - Read Only */}
            <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Standard Legal Information (Auto-generated)</Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                    The legal rights and terms are automatically generated and cannot be modified.
                </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Legal Rights (English)</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                    <Typography variant="body2">
                        {formData.legalRights?.en || defaultLegalRights.en}
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>መብቶች (አማርኛ)</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                    <Typography variant="body2" style={{ fontFamily: 'Noto Sans Ethiopic' }}>
                        {formData.legalRights?.am || defaultLegalRights.am}
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Terms and Conditions (English)</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                    <Typography variant="body2">
                        {formData.termsAndConditions?.en || defaultTermsAndConditions.en}
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>ውሎች እና ሁኔታዎች (አማርኛ)</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                    <Typography variant="body2" style={{ fontFamily: 'Noto Sans Ethiopic' }}>
                        {formData.termsAndConditions?.am || defaultTermsAndConditions.am}
                    </Typography>
                </Paper>
            </Grid>
            
            {/* Certificate Details */}
            <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Certificate Details</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Registration Number"
                    name="registrationNumber"
                    value={formData.registrationNumber || ''}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                <AssignmentIcon />
                            </InputAdornment>
                        ),
                    }}
                    helperText="Auto-generated unique registration number"
                />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Certificate Number"
                    name="certificateNumber"
                    value={formData.certificateNumber || ''}
                    InputProps={{
                        readOnly: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                <VerifiedIcon />
                            </InputAdornment>
                        ),
                    }}
                    helperText="Auto-generated unique certificate number"
                />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Date of Issuance"
                    name="dateOfIssuance"
                    type="date"
                    value={formData.dateOfIssuance || ''}
                    onChange={handleInputChange}
                    error={Boolean(errors.dateOfIssuance)}
                    helperText={errors.dateOfIssuance || "Certificate issue date"}
                />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Issuing Authority (English)"
                    name="issuingAuthority"
                    value={formData.issuingAuthority || ''}
                    onChange={handleInputChange}
                    error={Boolean(errors.issuingAuthority)}
                    helperText={errors.issuingAuthority || "Name of the authority issuing this certificate"}
                />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Issuing Authority (Amharic)"
                    name="issuingAuthorityAm"
                    value={formData.issuingAuthorityAm || ''}
                    onChange={handleInputChange}
                    error={Boolean(errors.issuingAuthorityAm)}
                    helperText={errors.issuingAuthorityAm}
                    InputProps={{
                        style: { fontFamily: 'Noto Sans Ethiopic' }
                    }}
                />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.hasExpirationDate || false}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    hasExpirationDate: e.target.checked,
                                    // Clear expiration date if unchecked
                                    expirationDate: e.target.checked ? formData.expirationDate : ''
                                });
                            }}
                            name="hasExpirationDate"
                        />
                    }
                    label="Certificate has an expiration date"
                />
                
                {formData.hasExpirationDate && (
                    <TextField
                        fullWidth
                        label="Expiration Date"
                        name="expirationDate"
                        type="date"
                        value={formData.expirationDate || ''}
                        onChange={handleInputChange}
                        error={Boolean(errors.expirationDate)}
                        helperText={errors.expirationDate}
                        sx={{ mt: 2 }}
                    />
                )}
            </Grid>
        </Grid>
    );

    const renderPhotosAndSignatures = () => {
        return (
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>Land Photos</Typography>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                        Please upload photos of the land and property
                    </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            minHeight: '150px',
                            justifyContent: 'center'
                        }}
                    >
                        {formData.landPhoto ? (
                            <Box>
                                <img 
                                    src={formData.landPhoto} 
                                    alt="Land" 
                                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                                />
                                <Button 
                                    size="small" 
                                    sx={{ mt: 1 }}
                                    onClick={() => {
                                        document.getElementById('land-photo').click();
                                    }}
                                >
                                    Change
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <PhotoCamera sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                <Button 
                                    variant="outlined"
                                    onClick={() => {
                                        document.getElementById('land-photo').click();
                                    }}
                                >
                                    Upload Land Photo
                                </Button>
                            </>
                        )}
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="land-photo"
                            type="file"
                            onChange={(e) => handleFileChange(e, 'landPhoto')}
                        />
                    </Paper>
                    {errors.landPhoto && (
                        <FormHelperText error>{errors.landPhoto}</FormHelperText>
                    )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            minHeight: '150px',
                            justifyContent: 'center'
                        }}
                    >
                        {formData.boundaryPhoto ? (
                            <Box>
                                <img 
                                    src={formData.boundaryPhoto} 
                                    alt="Boundary" 
                                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                                />
                                <Button 
                                    size="small" 
                                    sx={{ mt: 1 }}
                                    onClick={() => {
                                        document.getElementById('boundary-photo').click();
                                    }}
                                >
                                    Change
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <PhotoCamera sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                <Button 
                                    variant="outlined"
                                    onClick={() => {
                                        document.getElementById('boundary-photo').click();
                                    }}
                                >
                                    Upload Boundary Photo
                                </Button>
                            </>
                        )}
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="boundary-photo"
                            type="file"
                            onChange={(e) => handleFileChange(e, 'boundaryPhoto')}
                        />
                    </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            minHeight: '150px',
                            justifyContent: 'center'
                        }}
                    >
                        {formData.ownerPhoto ? (
                            <Box>
                                <img 
                                    src={formData.ownerPhoto} 
                                    alt="Owner" 
                                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                                />
                                <Button 
                                    size="small" 
                                    sx={{ mt: 1 }}
                                    onClick={() => {
                                        document.getElementById('owner-photo').click();
                                    }}
                                >
                                    Change
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <PhotoCamera sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                <Button 
                                    variant="outlined"
                                    onClick={() => {
                                        document.getElementById('owner-photo').click();
                                    }}
                                >
                                    Upload Owner Photo
                                </Button>
                            </>
                        )}
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="owner-photo"
                            type="file"
                            onChange={(e) => handleFileChange(e, 'ownerPhoto')}
                        />
                    </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            minHeight: '150px',
                            justifyContent: 'center'
                        }}
                    >
                        {formData.landPlanImage ? (
                            <Box>
                                <img 
                                    src={formData.landPlanImage} 
                                    alt="Land Plan" 
                                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                                />
                                <Button 
                                    size="small" 
                                    sx={{ mt: 1 }}
                                    onClick={() => {
                                        document.getElementById('land-plan-image').click();
                                    }}
                                >
                                    Change
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <PhotoCamera sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                <Button 
                                    variant="outlined"
                                    onClick={() => {
                                        document.getElementById('land-plan-image').click();
                                    }}
                                >
                                    Upload Land Plan
                                </Button>
                            </>
                        )}
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="land-plan-image"
                            type="file"
                            onChange={(e) => handleFileChange(e, 'landPlanImage')}
                        />
                    </Paper>
                </Grid>
                
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Signatures</Typography>
                    <Typography variant="caption" color="textSecondary" gutterBottom>
                        Please provide signatures of the owner and registration officer
                    </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            minHeight: '150px',
                            justifyContent: 'center'
                        }}
                    >
                        {formData.signatures?.owner ? (
                            <Box>
                                <img 
                                    src={formData.signatures?.owner} 
                                    alt="Owner Signature" 
                                    style={{ maxWidth: '100%', maxHeight: '100px' }}
                                />
                                <Button 
                                    size="small" 
                                    sx={{ mt: 1 }}
                                    onClick={() => openSignaturePad('owner')}
                                >
                                    Change
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="subtitle2">Owner Signature</Typography>
                                    <Button 
                                        variant="outlined"
                                        onClick={() => openSignaturePad('owner')}
                                    >
                                        Draw Signature
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Paper>
                    {errors.signatures?.owner && (
                        <FormHelperText error>{errors.signatures?.owner}</FormHelperText>
                    )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            minHeight: '150px',
                            justifyContent: 'center'
                        }}
                    >
                        {formData.signatures?.registrationOfficer ? (
                            <Box>
                                <img 
                                    src={formData.signatures?.registrationOfficer} 
                                    alt="Officer Signature" 
                                    style={{ maxWidth: '100%', maxHeight: '100px' }}
                                />
                                <Button 
                                    size="small" 
                                    sx={{ mt: 1 }}
                                    onClick={() => openSignaturePad('registrationOfficer')}
                                >
                                    Change
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="subtitle2">Registration Officer Signature</Typography>
                                    <Button 
                                        variant="outlined"
                                        onClick={() => openSignaturePad('registrationOfficer')}
                                    >
                                        Draw Signature
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Paper>
                    {errors.signatures?.registrationOfficer && (
                        <FormHelperText error>{errors.signatures?.registrationOfficer}</FormHelperText>
                    )}
                </Grid>
            </Grid>
        );
    };


    const validateForm = () => {
        const allErrors = {};
        
        // Use validateStep for each step to ensure complete validation
        for (let step = 0; step < steps.length; step++) {
            const stepErrors = validateStep(step);
            
            // Debug: Log all validation errors to console
            if (Object.keys(stepErrors).length > 0) {
                console.log('Validation errors for step', step, ':', stepErrors);
                console.log('Current form data:', formData);
            }
            
            // Merge step errors into all errors
            Object.assign(allErrors, stepErrors);
        }
        
        return allErrors;
    };

    const handleInputChange = (event, directValue) => {
        // If this is an event (most common case from UI interactions)
        if (event && event.target && event.target.name) {
            handleFieldChange(event.target.name, event.target.value);
            return;
        }
        
        // If called with a direct name and value (for programmatic changes)
        if (typeof event === 'string' && directValue !== undefined) {
            handleFieldChange(event, directValue);
            return;
        }
        
        // Log error if we can't handle this input pattern
        console.error('handleInputChange called with invalid arguments:', { event, directValue });
    };
    
    const handleFieldChange = (name, value) => {
        // Ensure name is a string to prevent errors with includes
        if (!name || typeof name !== 'string') {
            console.error('handleFieldChange called with invalid name:', name);
            return;
        }
        
        // Handle regular nested object inputs (e.g., landLocation.region)
        if (name.includes('.') && !name.includes('[')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));

            // Clear error for this field
            setErrors(prev => {
                const newErrors = { ...prev };
                
                // Handle nested object errors (like landLocation.region)
                if (newErrors[parent]) {
                    // If we have errors for this parent object
                    const parentErrors = { ...newErrors[parent] };
                    // Delete the specific child error
                    delete parentErrors[child];
                    
                    // If no more errors for this parent, remove the parent error object
                    if (Object.keys(parentErrors).length === 0) {
                        delete newErrors[parent];
                    } else {
                        // Otherwise, update the parent errors
                        newErrors[parent] = parentErrors;
                    }
                }
                
                return newErrors;
            });
        }
        // Handle array inputs like children[0].name
        else if (name.includes('[') && name.includes(']')) {
            const matches = name.match(/([^\[]+)\[(\d+)\]\.(.+)/);
            if (matches) {
                const [_, arrayName, indexStr, prop] = matches;
                const index = parseInt(indexStr, 10);
                
                // Update form data
                setFormData(prev => {
                    // Check if the array exists
                    if (!prev[arrayName] || !Array.isArray(prev[arrayName])) {
                        console.warn(`Array ${arrayName} does not exist or is not an array in form data`);
                        // Initialize it
                        prev = {
                            ...prev,
                            [arrayName]: []
                        };
                    }
                    
                    // Create a copy of the array
                    const newArray = [...prev[arrayName]];
                    
                    // Ensure the array has enough elements
                    while (newArray.length <= index) {
                        newArray.push({});
                    }
                    
                    // Update the specific property
                    newArray[index] = {
                        ...newArray[index],
                        [prop]: value
                    };
                    
                    return {
                        ...prev,
                        [arrayName]: newArray
                    };
                });
                
                // Clear error for this specific field
                setErrors(prev => {
                    if (!prev.children) return prev;
                    
                    const newErrors = { ...prev };
                    
                    // Determine which fields to clear based on the current step
                    if (newErrors.children) {
                        // If we only have one child, just clear all child errors
                        if (newErrors.children.length <= 1) {
                            delete newErrors.children;
                        } else {
                            // Remove errors for the specific child
                            const childrenErrors = [...newErrors.children];
                            childrenErrors.splice(index, 1);
                            
                            if (childrenErrors.length === 0) {
                                delete newErrors.children;
                            } else {
                                newErrors.children = childrenErrors;
                            }
                        }
                    }
                    
                    return newErrors;
                });
            }
        } 
        // Handle regular fields
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            
            // Clear error for this field
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validate all fields before submitting
        const allErrors = validateForm();
        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            // Format errors for display
            let errorMessage = "Please fix the following issues before submitting:\n\n";
            Object.entries(allErrors).forEach(([field, error]) => {
                if (field === 'children' && Array.isArray(error)) {
                    error.forEach((childError, index) => {
                        if (childError) {
                            Object.entries(childError).forEach(([childField, childErrorMessage]) => {
                                errorMessage += `Child ${index + 1} - ${childField}: ${childErrorMessage}\n`;
                            });
                        }
                    });
                } else if (typeof error === 'object' && error !== null) {
                    Object.values(error).forEach(msg => {
                        errorMessage += `${field}: ${msg}\n`;
                    });
                } else {
                    errorMessage += `${field}: ${error}\n`;
                }
            });
            alert(errorMessage); // Show a user-friendly alert
            setLoading(false);
            return;
        }

        try {
            // Prepare payload for backend
            const payload = {
                parcelId: formData.parcelId,
                dateOfBirth: formData.dateOfBirth,
                phone: formData.phone,
                addressAm: formData.addressAm,
                addressEn: formData.address,
                fatherNameAm: formData.fatherNameAm,
                fatherNameEn: formData.fatherName,
                motherNameAm: formData.motherNameAm,
                motherNameEn: formData.motherName,
                maritalStatus: formData.maritalStatus,
                children: formData.children,
                issuanceDate: formData.dateOfIssuance,
                issuingAuthorityAm: formData.issuingAuthorityAm,
                issuingAuthorityEn: formData.issuingAuthority,
                expiryDate: formData.expirationDate,
                status: "approved",
                // ...add any other required fields
            };
            await submitCertificate(payload);
            // Check if the user is still authenticated after submission
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Your session has expired. Please log in again.');
                //navigate('/login', { replace: true });
                return;
            }
            alert('Certificate registered successfully!');
            navigate('/certificate-history', { replace: true }); // Navigate after success
        } catch (err) {
            if (err.message && (err.message.toLowerCase().includes('unauthorized') || err.message.toLowerCase().includes('token'))){
                alert('Your session has expired or you are not authorized. Please log in again.');
               // navigate('/login', { replace: true });
                return;
            }
            setErrors({ submit: err.message });
            alert(err.message || 'An error occurred while submitting the form.');
        }
        setLoading(false);
    };

    const isEnglishText = (text) => {
        if (!text) return false;
        
        // Trim the text to remove any leading/trailing whitespace
        const trimmedText = text.trim();
        if (trimmedText === '') return false;
        
        // If it's only numbers, it's not valid English text
        if (/^\d+$/.test(trimmedText)) {
            return false;
        }
        
        // Allow all common characters used in English, including spaces and punctuation
        // Be more lenient by allowing a wider range of characters
        const englishPattern = /^[a-zA-Z0-9\s.,;:'"!@#$%^&*()-+=_|\[\]{}/<>?`~]*$/;
        return englishPattern.test(trimmedText);
    };

    const isAmharicText = (text) => {
        if (!text) return false;
        
        // Trim the text to remove any leading/trailing whitespace
        const trimmedText = text.trim();
        if (trimmedText === '') return false;
        
        // If it's only numbers, it's not valid Amharic text
        if (/^\d+$/.test(trimmedText)) {
            return false;
        }
        
        // Be more lenient with Amharic validation
        // Allow Amharic characters, numbers, spaces, and common punctuation
        // The Unicode range for Amharic is extended to include related characters
        const amharicPattern = /^[\u1200-\u137F\s0-9.,;:'"!@#$%^&*()-+=_]*$/;
        return amharicPattern.test(trimmedText);
    };

    const handleFileChange = (event, field) => {
        const file = event.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [field]: file // store the File object, not base64
            }));
        }
    };

    const handleSignatureSave = () => {
        if (signaturePad.current) {
            const canvas = signaturePad.current.getCanvas();
            const isEmpty = signaturePad.current.isEmpty();
            
            if (!isEmpty) {
                try {
                    const signatureDataUrl = canvas.toDataURL('image/png');
                    
                    // Update the form data with the signature
                    setFormData(prev => ({
                        ...prev,
                        signatures: {
                            ...prev.signatures,
                            [signatureType]: signatureDataUrl
                        }
                    }));
                    
                    // Clear any signature error after successful save
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        
                        if (newErrors.signatures) {
                            const newSignatureErrors = { ...newErrors.signatures };
                            delete newSignatureErrors[signatureType];
                            
                            if (Object.keys(newSignatureErrors).length > 0) {
                                newErrors.signatures = newSignatureErrors;
                            } else {
                                delete newErrors.signatures;
                            }
                        }
                        
                        return newErrors;
                    });
                    
                    // Close the modal
                    setShowSignaturePad(false);
                } catch (error) {
                    console.error('Error saving signature:', error);
                    setErrors(prev => ({
                        ...prev,
                        signatures: {
                            ...(prev.signatures || {}),
                            [signatureType]: 'Failed to save signature'
                        }
                    }));
                }
            } else {
                setErrors(prev => ({
                    ...prev,
                    signatures: {
                        ...(prev.signatures || {}),
                        [signatureType]: 'Please sign before saving'
                    }
                }));
            }
        }
    };

    const handleSignatureClear = () => {
        if (signaturePad.current) {
            signaturePad.current.clear();
        }
    };

    const clearSignature = (type) => {
        if (signaturePads[type]?.current) {
            signaturePads[type].current.clear();
            
            // Also clear the signature in the form data
            setFormData(prev => ({
                ...prev,
                signatures: {
                    ...prev.signatures,
                    [type]: null
                }
            }));
        }
    };
    
    // Function to open signature pad modal for a specific type
    const openSignaturePad = (type) => {
        setSignatureType(type);
        setShowSignaturePad(true);
    };
    
    const steps = [
        'Owner Information',
        'Personal Information',
        'Land Description',
        'Legal & Certificate Details',
        'Photos & Signatures'
    ];

    const handleNext = () => {
        const stepErrors = validateStep(activeStep);
        // Only block next step if there are errors for the current step's fields
        if (Object.keys(stepErrors).length === 0) {
            setErrors({});
            
            // If we're at Legal Details step (step 3), and this is the first time we're filling it
            if (activeStep === 3 && !formData.registrationNumber) {
                // Auto-generate registration number
                const currentYear = new Date().getFullYear();
                const randomPart = Math.floor(100000 + Math.random() * 900000);
                const registrationNumber = `REG-${currentYear}-${randomPart}`;
                
                // Auto-generate certificate number
                const randomCertPart = Math.floor(100000 + Math.random() * 900000);
                const certificateNumber = `LRMS-${currentYear}-${randomCertPart}`;
                
                // Set default date of issuance to today if not set
                const today = new Date().toISOString().split('T')[0];
                
                setFormData(prev => ({
                    ...prev,
                    registrationNumber,
                    certificateNumber,
                    dateOfIssuance: prev.dateOfIssuance || today,
                    // Set default legal rights and terms if not already set
                    legalRights: prev.legalRights || defaultLegalRights,
                    termsAndConditions: prev.termsAndConditions || defaultTermsAndConditions,
                    issuingAuthority: prev.issuingAuthority || 'Land Registration Authority',
                    issuingAuthorityAm: prev.issuingAuthorityAm || 'የመሬት ምዝገባ ባለስልጣን'
                }));
            }
            
            // Just go to the next step
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
            setErrors(stepErrors); // Only set current step errors
            
            // Log validation errors for debugging
            console.log("Step validation failed:", stepErrors);
            
            // Scroll to the first error element
            const firstErrorField = Object.keys(stepErrors)[0];
            if (firstErrorField) {
                const errorElement = document.getElementsByName(firstErrorField)[0];
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    errorElement.focus();
                }
            }
        }
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
        setErrors({});
    };

    const validateStep = (step) => {
        const errors = {};
        
        switch(step) {
            case 0: // Owner Information
                // Validate owner first name (English)
                if (!formData.ownerFirstName) {
                    errors.ownerFirstName = {
                        en: 'First name is required',
                        am: 'ስም ያስፈልጋል'
                    };
                }
                // Validate owner first name (Amharic)
                if (!formData.ownerFirstNameAm) {
                    errors.ownerFirstNameAm = {
                        en: 'First name in Amharic is required',
                        am: 'ስም በአማርኛ ያስፈልጋል'
                    };
                }
                // Validate owner last name (English)
                if (!formData.ownerLastName) {
                    errors.ownerLastName = {
                        en: 'Last name is required',
                        am: 'የአባት ስም ያስፈልጋል'
                    };
                }
                // Validate owner last name (Amharic)
                if (!formData.ownerLastNameAm) {
                    errors.ownerLastNameAm = {
                        en: 'Last name in Amharic is required',
                        am: 'የአባት ስም በአማርኛ ያስፈልጋል'
                    };
                }
                // Validate date of birth
                if (!formData.dateOfBirth) {
                    errors.dateOfBirth = 'Date of birth is required / የልደት ቀን ያስፈልጋል';
                } else {
                    const birthDate = new Date(formData.dateOfBirth);
                    const currentDate = new Date();
                    if (birthDate > currentDate) {
                        errors.dateOfBirth = 'Date of birth cannot be in the future / የትውልድ ቀን ከዛሬ በኋላ መሆን አይችልም';
                    }
                    const eighteenYearsAgo = new Date();
                    eighteenYearsAgo.setFullYear(currentDate.getFullYear() - 18);
                    if (birthDate > eighteenYearsAgo) {
                        errors.dateOfBirth = 'Land owner must be at least 18 years old / የመሬት ባለቤት ቢያንስ 18 ዓመት መሆን አለበት';
                    }
                }
                // Validate national ID
                if (!formData.nationalId) {
                    errors.nationalId = {
                        en: 'National ID is required',
                        am: 'መታወቂያ ቁጥር ያስፈልጋል'
                    };
                }
                // Validate phone number
                if (!formData.phone) {
                    errors.phone = {
                        en: 'Phone number is required',
                        am: 'ስልክ ቁጥር ያስፈልጋል'
                    };
                } else {
                    // Remove non-digit characters
                    const digits = formData.phone.replace(/\D/g, '');
                    // Accept 10 digits (with leading 0) or 9 digits (without leading 0)
                   
                    if (!((digits.length === 10 && digits.startsWith('0')) || (digits.length === 9 && !digits.startsWith('0')))) {
                        errors.phone = {
                            en: 'Phone number must be 9 or 10 digits and start with 0 if 10 digits',
                            am: 'ስልክ ቁጥር 9 ወይም 10 አሃዞች መሆን አለበት፣ 10 አሃዝ ከሆነ በ0 መጀመር አለበት'
                        };
                    }
                }
                
                // Phone number validation (Ethiopian standard: 9 or 10 digits, allow leading 0)
                if (formData.phone) {
                    // Remove non-digit characters
                    const digits = formData.phone.replace(/\D/g, '');
                    // Accept 10 digits (with leading 0) or 9 digits (without leading 0)
                    if (!((digits.length === 10 && digits.startsWith('0')) || (digits.length === 9 && !digits.startsWith('0')))) {
                        errors.phone = 'Phone number must be 9-10 digits, ስልክ ቁጥር 9-10 አሃዞች መሆን አለበት';
                    }
                }
                
                // Validate address (English)
                if (!formData.address){
                    errors.address = { 
                        en: 'Address is required', 
                        am: 'አድራሻ ያስፈልጋል' 
                    };
                }
                
                // Validate address (Amharic)
                if (!formData.addressAm) {
                    errors.addressAm = { 
                        en: 'Address in Amharic is required', 
                        am: 'አድራሻ በአማርኛ ያስፈልጋል' 
                    };
                }
                break;      
            case 1: // Personal Information
                // Validate father's name
                if (!formData.fatherName) {
                    errors.fatherName = { 
                        en: 'Father\'s name is required', 
                        am: 'የአባት ስም ያስፈልጋል' 
                    };
                }
                
                // Validate mother's name
                if (!formData.motherName) {
                    errors.motherName = { 
                        en: 'Mother\'s name is required', 
                        am: 'የእናት ስም ያስፈልጋል' 
                    };
                }
                
                // Validate marital status
                if (!formData.maritalStatus) {
                    errors.maritalStatus = { 
                        en: 'Marital status is required', 
                        am: 'የጋብቻ ሁኔታ ያስፈልጋል' 
                    };
                }
                
                // Validate children (if any)
                if (formData.children && formData.children.length > 0) {
                    const childrenErrors = [];
                    let hasChildErrors = false;
                    
                    formData.children.forEach((child, index) => {
                        const childError = {};
                        
                        // Only validate if at least one field is filled
                        const hasValue = Boolean(child.name || child.nameAm || child.age || child.gender);
                        
                        if (hasValue) {
                            // Name validation
                            if (!child.name) {
                                childError.name = 'Child name is required / የልጅ ስም ያስፈልጋል';
                                hasChildErrors = true;
                            }
                            
                            // Name (Amharic) validation
                            if (!child.nameAm) {
                                childError.nameAm = 'Child name in Amharic is required / የልጅ ስም በአማርኛ ያስፈል';
                                hasChildErrors = true;
                            }
                            
                            // Age validation
                            if (!child.age) {
                                childError.age = 'Child age is required / የልጅ እድሜ ያስፈልጋል';
                                hasChildErrors = true;
                            } else if (isNaN(child.age) || parseInt(child.age) < 0 || parseInt(child.age) > 120) {
                                childError.age = 'Please enter a valid age / ትክክለኛ እድሜ ያስገቡ';
                                hasChildErrors = true;
                            }
                            
                            // Gender validation
                            if (!child.gender) {
                                childError.gender = 'Child gender is required / የልጅ ፆታ  ያስፈልጋል';
                                hasChildErrors = true;
                            }
                        }
                        
                        childrenErrors[index] = Object.keys(childError).length > 0 ? childError : null;
                    });
                    
                    if (hasChildErrors) {
                        errors.children = childrenErrors;
                    }
                }
                break;
                
            case 2: // Land Description
                console.log("Validating Land Description step", formData);
                // Initialize landLocation errors object if needed
                if (!formData.landLocation) {
                    errors.landLocation = {};
                    errors.landLocation.region = 'Region is required / ክልል ያስፈልጋል';
                    errors.landLocation.zone = 'Zone is required / ዞን ያስፈልጋል';
                    errors.landLocation.woreda = 'Woreda is required / ወረዳ ያስፈልጋል';
                    errors.landLocation.kebele = 'Kebele is required / ቀበሌ ያስፈልጋል';
                    // Block is now optional
                } else {
                    // Land location - region
                    if (!formData.landLocation.region) {
                        errors.landLocation = errors.landLocation || {};
                        errors.landLocation.region = 'Region is required / ክልል ያስፈልጋል';
                    }
                    
                    // Land location - zone
                    if (!formData.landLocation.zone) {
                        errors.landLocation = errors.landLocation || {};
                        errors.landLocation.zone = 'Zone is required / ዞን ያስፈልጋል';
                    }
                    
                    // Land location - woreda
                    if (!formData.landLocation.woreda) {
                        errors.landLocation = errors.landLocation || {};
                        errors.landLocation.woreda = 'Woreda is required / ወረዳ ያስፈልጋል';
                    }
                    
                    // Land location - kebele
                    if (!formData.landLocation.kebele) {
                        errors.landLocation = errors.landLocation || {};
                        errors.landLocation.kebele = 'Kebele is required / ቀበሌ ያስፈልጋል';
                    }
                    
                    // Land location - block (optional)
                    // Removed the required validation for block field
                    // if (!formData.landLocation.block) {
                    //     errors.landLocation = errors.landLocation || {};
                    //     errors.landLocation.block = 'Block is required / ብሎክ ያስፈልጋል';
                    // }
                }
                
                // Land size
                if (!formData.landSize) {
                    errors.landSize = 'Land size is required / የመሬት መጠን ያስፈልጋል';
                } else if (isNaN(formData.landSize) || parseFloat(formData.landSize) <= 0) {
                    errors.landSize = 'Please enter a valid land size / ትክክለኛ የመሬት መጠን ያስገቡ';
                }
                
                // Size unit
                if (!formData.sizeUnit) {
                    errors.sizeUnit = 'Size unit is required / የመጠን መለኪያ ያስፈልጋል';
                }
                
                // Land use type
                if (!formData.landUseType) {
                    errors.landUseType = 'Land use type is required / የመሬት አጠቃቀም ዓይነት ያስፈልጋል';
                }
                
                // Land description validation
                if (!formData.landDescription) {
                    errors.landDescription = {};
                    errors.landDescription.en = 'Land description is required / የመሬት መግለጫ ያስፈልጋል';
                    errors.landDescription.am = 'Land description in Amharic is required / የመሬት መግለጫ በአማርኛ ያስፈልጋል';
                } else {
                    // Check English description
                    if (!formData.landDescription.en) {
                        errors.landDescription = errors.landDescription || {};
                        errors.landDescription.en = 'Land description is required / የመሬት መግለጫ ያስፈልጋል';
                    }
                    
                    // Check Amharic description
                    if (!formData.landDescription.am) {
                        errors.landDescription = errors.landDescription || {};
                        errors.landDescription.am = 'Land description in Amharic is required / የመሬት መግለጫ በአማርኛ ያስፈልጋል';
                    }
                }
                
                console.log("Land Description validation errors:", errors);
                break;
                
            case 3: // Legal Details
                // We validate registration number only if user tries to edit it manually
                if (formData.registrationNumber && formData.registrationNumber.trim() !== '' && !/^REG-\d{4}-\d{6}$/.test(formData.registrationNumber)) {
                    errors.registrationNumber = { 
                        en: 'Registration number must be in the format REG-YYYY-XXXXXX', 
                        am: 'የምዝገባ ቁጥር REG-YYYY-XXXXXX በሚለው ቅርጸት መሆን አለበት' 
                    };
                }
                
                // Date of issuance
                if (!formData.dateOfIssuance) {
                    errors.dateOfIssuance = { 
                        en: 'Date of issuance is required', 
                        am: 'የመመዝገቢያ ቀን ያስፈልጋል' 
                    };
                } else {
                    const issuanceDate = new Date(formData.dateOfIssuance);
                    const currentDate = new Date();
                    
                    if (issuanceDate > currentDate) {
                        errors.dateOfIssuance = { 
                            en: 'Date of issuance cannot be in the future', 
                            am: 'የመመዝገቢያ ቀን ከዛሬ በኋላ መሆን አይችልም' 
                        };
                    }
                }
                
                // Expiration date - only check if there IS an expiration date
                if (formData.hasExpirationDate && !formData.expirationDate) {
                    errors.expirationDate = { 
                        en: 'Expiration date is required', 
                        am: 'የማለቂያ ቀን ያስፈልጋል' 
                    };
                } else if (formData.hasExpirationDate && formData.expirationDate) {
                    const expirationDate = new Date(formData.expirationDate);
                    const issuanceDate = new Date(formData.dateOfIssuance || Date.now());
                    
                    if (expirationDate <= issuanceDate) {
                        errors.expirationDate = { 
                            en: 'Expiration date must be after date of issuance', 
                            am: 'የማለቂያ ቀን ከመመዝገቢያ ቀን በኋላ መሆን አለበት' 
                        };
                    }
                }
                
                // Issuing authority
                if (!formData.issuingAuthority) {
                    errors.issuingAuthority = { 
                        en: 'Issuing authority is required', 
                        am: 'ማረጋገጫ የሚሰጠው አካል ያስፈልጋል' 
                    };
                }
                
                // Issuing authority (Amharic)
                if (!formData.issuingAuthorityAm) {
                    errors.issuingAuthorityAm = { 
                        en: 'Issuing authority in Amharic is required', 
                        am: 'ማረጋገጫ የሚሰጠው አካል በአማርኛ ያስፈልጋል' 
                    };
                }
                break;
                
            case 4: // Photos & Signatures
                // Land photo
                if (!formData.landPhoto) {
                    errors.landPhoto = { 
                        en: 'Land photo is required', 
                        am: 'የመሬት ፎቶ ያስፈልጋል' 
                    };
                }
                
                // Boundary photo
                if (!formData.boundaryPhoto) {
                    errors.boundaryPhoto = { 
                        en: 'Boundary photo is required', 
                        am: 'የድንበር ፎቶ ያስፈልጋል' 
                    };
                }
                
                // Owner photo
                if (!formData.ownerPhoto) {
                    errors.ownerPhoto = { 
                        en: 'Owner photo is required', 
                        am: 'የባለቤት ፎቶ ያስፈልጋል' 
                    };
                }
                
                // Land plan image
                if (!formData.landPlanImage) {
                    errors.landPlanImage = { 
                        en: 'Land plan image is required', 
                        am: 'የመሬት ፕላን ፎቶ ያስፈልጋል' 
                    };
                }
                
                // Owner signature
                if (!formData.signatures?.owner) {
                    errors.signatures = errors.signatures || {};
                    errors.signatures.owner = { 
                        en: 'Owner signature is required', 
                        am: 'የባለቤት ፊርማ ያስፈልጋል' 
                    };
                }
                
                // Registration officer signature
                if (!formData.signatures?.registrationOfficer) {
                    errors.signatures = errors.signatures || {};
                    errors.signatures.registrationOfficer = { 
                        en: 'Registration officer signature is required', 
                        am: 'የምዝገባ አማካሪ ፊርማ ያስፈልጋል' 
                    };
                }
                break;
                
            default:
                // No validation for other steps
                break;
        }
        
        return errors;
    };

    const validateAllSteps = () => {
        let isValid = true;
        for (let i = 0; i <= activeStep; i++) {
            const stepValid = validateStep(i);
            
            // Debug: Log all validation errors to console
            if (Object.keys(stepValid).length > 0) {
                console.log('Validation errors for step', i, ':', stepValid);
                console.log('Current form data:', formData);
            }
            
            // Only proceed if there are no errors
            if (Object.keys(stepValid).length > 0) {
                isValid = false;
                break;
            }
        }
        return isValid;
    };

    const [activeStep, setActiveStep] = useState(0);
    const [showCertificate, setShowCertificate] = useState(false);
    const [activeCertificateTab, setActiveCertificateTab] = useState('preview');
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signatureType, setSignatureType] = useState('owner'); // To track which signature is being drawn
    
    // Single signature pad ref for the modal
    const signaturePad = useRef(null);
    
    // Multiple signature pad refs for different signatories
    const signaturePads = {
        owner: useRef(null),
        registrationOfficer: useRef(null),
        witness1: useRef(null),
        witness2: useRef(null)
    };
    
    const handlePhotoUpload = async (event) => {
        const files = Array.from(event.target.files);
        // Create URLs for preview
        const photoURLs = files.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
            ...prev,
            photographs: files
        }));
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return renderOwnerInfo();
            case 1:
                return renderPersonalInfo();
            case 2:
                return renderLandDescription();
            case 3:
                return renderLegalDetails();
            case 4:
                return renderPhotosAndSignatures();
            default:
                return 'Unknown step';
        }
    };

    const handleCertificateGeneration = () => {
        // Validate all steps before generating the certificate
        const allErrors = {};
        for (let step = 0; step < steps.length - 1; step++) { // Exclude the certificate preview step
            const stepErrors = validateStep(step);
            
            // Debug: Log all validation errors to console
            if (Object.keys(stepErrors).length > 0) {
                console.log('Validation errors for step', step, ':', stepErrors);
                console.log('Current form data:', formData);
            }
            
            // Merge step errors into all errors
            Object.assign(allErrors, stepErrors);
        }
        
        if (Object.keys(allErrors).length === 0) {
            // Generate certificate number if not already set
            if (!formData.certificateNumber) {
                const currentYear = new Date().getFullYear();
                const randomPart = Math.floor(100000 + Math.random() * 900000);
                const certificateNumber = `LRMS-${currentYear}-${randomPart}`;
                
                // Generate registration number if not already set
                if (!formData.registrationNumber) {
                    const randomRegPart = Math.floor(100000 + Math.random() * 900000);
                    const registrationNumber = `REG-${currentYear}-${randomRegPart}`;
                    
                    // Set default date of issuance to today if not set
                    const today = new Date().toISOString().split('T')[0];
                    
                    setFormData(prev => ({
                        ...prev,
                        registrationNumber,
                        certificateNumber,
                        dateOfIssuance: prev.dateOfIssuance || today,
                        // Set default legal rights and terms if not already set
                        legalRights: prev.legalRights || defaultLegalRights,
                        termsAndConditions: prev.termsAndConditions || defaultTermsAndConditions,
                        issuingAuthority: prev.issuingAuthority || 'Land Registration Authority',
                        issuingAuthorityAm: prev.issuingAuthorityAm || 'የመሬት ምዝገባ ባለስልጣን'
                    }));
                }
            }
            
            // Create a certification record
            const certificationRecord = {
                certificateNumber: formData.certificateNumber || `LRMS-${Date.now()}`,
                registrationNumber: formData.registrationNumber || `REG-${Date.now()}`,
                ownerName: `${formData.ownerFirstName} ${formData.ownerLastName}`,
                dateOfIssuance: formData.dateOfIssuance,
                landParcelNumber: formData.parcelNumber || 'N/A',
                region: formData.landLocation?.region || 'N/A',
                woreda: formData.landLocation?.woreda || 'N/A',
                kebele: formData.landLocation?.kebele || 'N/A',
                landArea: `${formData.landSize || '0'} ${formData.sizeUnit || 'sq m'}`,
                issuingAuthority: formData.issuingAuthority || 'Land Registration Authority',
                issuingAuthorityAm: formData.issuingAuthorityAm || 'የመሬት ምዝገባ ባለስልጣን',
                // Add a timestamp for when the certificate was generated
                generatedAt: new Date().toISOString(),
                // If there's an expiration date, include it
                expirationDate: formData.hasExpirationDate ? formData.expirationDate : null
            };
            
            // Here you would typically save the record to your database
            console.log("Certificate generated:", certificationRecord);
            
            // For now, we'll just store it in local storage as an example
            const existingRecords = JSON.parse(localStorage.getItem('certificateRecords') || '[]');
            existingRecords.push(certificationRecord);
            localStorage.setItem('certificateRecords', JSON.stringify(existingRecords));
            
            // Show success message
            alert("Certificate generated successfully! Certificate Number: " + certificationRecord.certificateNumber);
            
            // Show certificate
            setShowCertificate(true);
        } else {
            // Display validation errors
            setErrors(allErrors);
            
            // Format errors for display
            let errorMessage = "Please fix the following issues before generating the certificate:\n\n";
            
            Object.entries(allErrors).forEach(([field, error]) => {
                if (field === 'children') {
                    // Handle children errors separately
                    allErrors.children.forEach((childError, index) => {
                        if (childError) {
                            Object.entries(childError).forEach(([childField, childErrorMessage]) => {
                                errorMessage += `- Child ${index + 1} ${childField}: ${childErrorMessage}\n`;
                            });
                        }
                    });
                } else if (typeof error === 'object' && error !== null) {
                    // Handle nested errors like signatures
                    Object.entries(error).forEach(([subField, subError]) => {
                        errorMessage += `- ${field}.${subField}: ${subError}\n`;
                    });
                } else {
                    // Handle simple errors
                    errorMessage += `- ${field}: ${error}\n`;
                }
            });
            
            // Show alert with validation errors
            alert(errorMessage);
        }
    };

    const handleCertificateImageDownload = () => {
        // Create a reference to the certificate preview element
        const certificateElement = document.querySelector('.certificate-preview');
        
        if (!certificateElement) {
            alert('Certificate preview not found. Please try again.');
            return;
        }
        
        // Use html2canvas to capture the certificate as an image
        import('html2canvas').then(html2canvas => {
            html2canvas.default(certificateElement).then(canvas => {
                // Create a download link for the image
                const link = document.createElement('a');
                link.download = `land-certificate-${formData.certificateNumber}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(err => {
                console.error('Error generating certificate image:', err);
                alert('Failed to generate certificate image. Please try again.');
            });
        }).catch(err => {
            console.error('Error loading html2canvas:', err);
            alert('Failed to load image generation library. Please try again.');
        });
    };

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                {steps.map((label, index) => (
                    <Step key={label} completed={activeStep > index}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            
            {/* Display general errors at the top of the form */}
            {errors.general && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.general}
                </Alert>
            )}
            
            <Box sx={styles.pageCounter}>
                <Typography variant="subtitle1">
                    Page {activeStep + 1} of {steps.length}
                </Typography>
            </Box>
            
            <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                    {getStepContent(activeStep)}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={activeStep === 0}
                    >
                        Back
                    </Button>
                    
                    {activeStep === steps.length - 1 && showCertificate ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setShowCertificate(true)}
                        >
                            View Certificate
                        </Button>
                    ) : activeStep === steps.length - 1 ? (
                        // <Button
                        //     variant="contained"
                        //     color="primary"
                        //     onClick={handleCertificateGeneration}
                        // >
                        //     Generate Certificate
                        // </Button>
                         <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={loading}
                            fullWidth
                            sx={{ mt: 3 }}
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </form>

            {/* Certificate Preview Dialog */}
            <Dialog
                open={showCertificate}
                onClose={() => setShowCertificate(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    Land Registration Certificate
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Certificate Number: {formData.certificateNumber}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Please review the certificate details before proceeding.
                        </Typography>
                        
                        {/* Certificate Format Options */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, mt: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Button 
                                startIcon={<PreviewIcon />}
                                onClick={() => setActiveCertificateTab('preview')}
                                sx={{ 
                                    color: activeCertificateTab === 'preview' ? 'primary.main' : 'text.secondary',
                                    borderBottom: activeCertificateTab === 'preview' ? '2px solid' : 'none',
                                    borderRadius: 0,
                                    pb: 1
                                }}
                            >
                                Preview
                            </Button>
                            <Button 
                                startIcon={<PdfIcon />}
                                onClick={() => setActiveCertificateTab('pdf')}
                                sx={{ 
                                    color: activeCertificateTab === 'pdf' ? 'primary.main' : 'text.secondary',
                                    borderBottom: activeCertificateTab === 'pdf' ? '2px solid' : 'none',
                                    borderRadius: 0,
                                    pb: 1
                                }}
                            >
                                PDF
                            </Button>
                            <Button 
                                startIcon={<ImageIcon />}
                                onClick={() => setActiveCertificateTab('image')}
                                sx={{ 
                                    color: activeCertificateTab === 'image' ? 'primary.main' : 'text.secondary',
                                    borderBottom: activeCertificateTab === 'image' ? '2px solid' : 'none',
                                    borderRadius: 0,
                                    pb: 1
                                }}
                            >
                                Image
                            </Button>
                        </Box>
                        
                        {/* Certificate Content based on selected tab */}
                        {activeCertificateTab === 'preview' && (
                            <Box className="certificate-preview">
                                <CertificateGenerator certificateData={formData} />
                            </Box>
                        )}
                        
                        {activeCertificateTab === 'pdf' && (
                            <Box sx={{ textAlign: 'center', p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Download PDF Certificate
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                                    Click the button below to download your certificate as a PDF document.
                                </Typography>
                                <PDFDownloadLink
                                    document={<CertificateDocument certificateData={formData} qrCodeUrl={formData.qrCodeUrl} />}
                                    fileName={`land-certificate-${formData.certificateNumber}.pdf`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    {({ blob, url, loading, error }) => (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled={loading}
                                            startIcon={<DownloadIcon />}
                                            size="large"
                                        >
                                            {loading ? 'Generating PDF...' : 'Download PDF Certificate'}
                                        </Button>
                                    )}
                                </PDFDownloadLink>
                            </Box>
                        )}
                        
                        {activeCertificateTab === 'image' && (
                            <Box sx={{ textAlign: 'center', p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Download Certificate as Image
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                                    Click the button below to download your certificate as an image file.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleCertificateImageDownload}
                                    size="large"
                                >
                                    Download as Image
                                </Button>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setShowCertificate(false)} 
                        color="inherit"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Signature Pad Dialog */}
            <Dialog
                open={showSignaturePad}
                onClose={() => setShowSignaturePad(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {signatureType === 'owner' ? 'Owner Signature' : 
                     signatureType === 'registrationOfficer' ? 'Registration Officer Signature' : 
                     'Draw Your Signature'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Use your mouse or touch screen to sign below:
                        </Typography>
                        <Box sx={{ border: '1px dashed #ccc', height: '200px', mb: 2 }}>
                            <SignaturePad
                                ref={signaturePad}
                                canvasProps={{
                                    width: '100%',
                                    height: 200,
                                    className: 'signatureCanvas'
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={handleSignatureClear} 
                        color="inherit"
                    >
                        Clear
                    </Button>
                    <Button 
                        onClick={() => setShowSignaturePad(false)} 
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSignatureSave} 
                        variant="contained"
                        color="primary"
                    >
                        Save Signature
                    </Button>
                </DialogActions>
            </Dialog>
            
            <Button 
                variant="contained" 
                color="error"
                sx={{ mt: 3 }}
                onClick={() => {
                    // Validate all steps to identify all errors
                    const allErrors = {};
                    const stepErrors = {
                        "Owner Information": [],
                        "Personal Information": [],
                        "Land Description": [],
                        "Legal Details": [],
                        "Photos & Signatures": []
                    };

                    // Validate each step and collect errors
                    for (let step = 0; step < steps.length; step++) {
                        const errors = validateStep(step);
                        Object.assign(allErrors, errors);
                    }

                    // Categorize errors by step
                    Object.entries(allErrors).forEach(([field, error]) => {
                        // Helper function to add error to appropriate step
                        const addError = (stepName, errorMessage) => {
                            stepErrors[stepName].push(errorMessage);
                        };

                        // Determine which step the error belongs to and format the message
                        if (field.startsWith('owner') || field === 'nationalId' || field === 'phone' || field === 'address') {
                            const message = typeof error === 'object' ? error.en : error;
                            addError("Owner Information", `${field}: ${message}`);
                        }
                        else if (field === 'children' || field === 'fatherName' || field === 'motherName' || field === 'maritalStatus') {
                            if (field === 'children' && Array.isArray(error)) {
                                error.forEach((childError, index) => {
                                    if (childError) {
                                        Object.entries(childError).forEach(([childField, childErrorMessage]) => {
                                            addError("Personal Information", `Child ${index + 1} - ${childField}: ${childErrorMessage}`);
                                        });
                                    }
                                });
                            } else {
                                const message = typeof error === 'object' ? error.en : error;
                                addError("Personal Information", `${field}: ${message}`);
                            }
                        }
                        else if (field.startsWith('land') || field === 'sizeUnit') {
                            if (typeof error === 'object' && error !== null) {
                                Object.entries(error).forEach(([subField, message]) => {
                                    addError("Land Description", `${field}.${subField}: ${message}`);
                                });
                            } else {
                                addError("Land Description", `${field}: ${error}`);
                            }
                        }
                        else if (field.includes('date') || field.includes('issuing') || field.includes('registration')) {
                            const message = typeof error === 'object' ? error.en : error;
                            addError("Legal Details", `${field}: ${message}`);
                        }
                        else if (field.includes('photo') || field.includes('signature')) {
                            if (typeof error === 'object' && error !== null) {
                                Object.entries(error).forEach(([subField, message]) => {
                                    const msg = typeof message === 'object' ? message.en : message;
                                    addError("Photos & Signatures", `${field}.${subField}: ${msg}`);
                                });
                            } else {
                                addError("Photos & Signatures", `${field}: ${error}`);
                            }
                        }
                    });

                    // Create formatted message
                    let message = "Form Validation Summary:\n\n";
                    
                    if (Object.values(stepErrors).every(errors => errors.length === 0)) {
                        message = "✅ All form fields are filled correctly!\n";
                    } else {
                        Object.entries(stepErrors).forEach(([step, errors]) => {
                            if (errors.length > 0) {
                                message += `${step}:\n`;
                                errors.forEach(error => {
                                    message += `❌ ${error}\n`;
                                });
                                message += '\n';
                            } else {
                                message += `✅ ${step}: All fields complete\n\n`;
                            }
                        });
                    }

                    // Show formatted errors in an alert
                    alert(message);

                    // Also log to console for developers
                    console.log("Form Data:", formData);
                    console.log("Validation Errors:", stepErrors);
                }}
            >
                Debug Form
            </Button>
        </Box>
    );
};

export default CertificationForm;
