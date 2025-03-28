import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Grid,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    FormControlLabel,
    InputLabel,
    Avatar,
    IconButton,
    Checkbox,
    FormHelperText,
    InputAdornment,
    Paper as MuiPaper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material';
import { 
    PhotoCamera, 
    CloudUpload, 
    Assignment as AssignmentIcon, 
    VerifiedUser as VerifiedIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import CertificateGenerator from '../certification/CertificateGenerator';
import SignaturePad from 'react-signature-canvas';

// Default legal rights content
const defaultLegalRights = {
    en: `This certifies that the named individual or entity holds legal ownership rights to the specified land parcel according to the Land Registration Act. The owner has the following rights:

1. Right to occupy and utilize the land in accordance with zoning regulations
2. Right to transfer ownership through proper legal channels
3. Right to develop the land in compliance with local building codes
4. Right to exclude others from unauthorized use of the property
5. Right to mortgage or lease the property
6. Right to receive compensation in case of government acquisition

These rights are subject to applicable federal and local laws, regulations, and restrictions.`,
    am: `ይህ የተጠቀሰው ግለሰብ ወይም አካል በመሬት ምዝገባ ህግ መሰረት የተገለፀውን የመሬት ክፍል ህጋዊ የባለቤትነት መብቶች እንዳለው ያረጋግጣል። ባለቤቱ የሚከተሉት መብቶች አሉት፡

1. መሬቱን በዞን ደንቦች መሰረት የመያዝና የመጠቀም መብት
2. ባለቤትነትን በተገቢ ህጋዊ መንገዶች የማስተላለፍ መብት
3. መሬቱን በአካባቢው የግንባታ ደንቦች መሰረት የማልማት መብት
4. ሌሎችን ከንብረቱ ያለፈቃድ መጠቀም የመከልከል መብት
5. ንብረቱን የማስያዝ ወይም የማከራየት መብት
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

1. በምዝገባ ወቅት የቀረበው መረጃ ሁሉ ትክክለኛና እውነተኛ መሆን አለበት
2. መሬቱ ተፈጻሚ ከሚሆኑ የዞን ደንቦች ጋር በሚጣጣም መልኩ መጠቀም አለበት
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

const CertificationForm = () => {
    const [formData, setFormData] = useState({
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
        
        // Children Information
        children: [
            { name: '', nameAm: '', age: '', gender: '' }
        ],
        
        // Land Location
        landLocation: {
            region: '',
            regionAm: '',
            woreda: '',
            woredaAm: '',
            kebele: '',
            kebeleAm: ''
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
        certificateNumber: `LRMS-${Date.now()}`,
        issuingAuthority: '',
        issuingAuthorityAm: '',
        registrationOfficer: '',
        registrationOfficerAm: '',
        dateOfIssuance: new Date().toISOString().split('T')[0],
        additionalNotes: '',
        additionalNotesAm: '',
        
        // Photos and Signatures
        landPhoto: null,
        boundaryPhoto: null,
        signatures: {
            owner: null,
            officer: null
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
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="ownerFirstName"
                    label="First Name (English)"
                    value={formData.ownerFirstName}
                    onChange={handleInputChange}
                    error={Boolean(errors.ownerFirstName)}
                    helperText={renderErrorMessage('ownerFirstName')}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="ownerFirstNameAm"
                    label="First Name (Amharic) / ስም"
                    value={formData.ownerFirstNameAm}
                    onChange={handleInputChange}
                    error={Boolean(errors.ownerFirstNameAm)}
                    helperText={renderErrorMessage('ownerFirstNameAm')}
                    InputProps={{
                        style: { fontFamily: 'Noto Sans Ethiopic' }
                    }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="ownerLastName"
                    label="Last Name (English)"
                    value={formData.ownerLastName}
                    onChange={handleInputChange}
                    error={Boolean(errors.ownerLastName)}
                    helperText={renderErrorMessage('ownerLastName')}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    name="ownerLastNameAm"
                    label="Last Name (Amharic) / የአባት ስም"
                    value={formData.ownerLastNameAm}
                    onChange={handleInputChange}
                    error={Boolean(errors.ownerLastNameAm)}
                    helperText={renderErrorMessage('ownerLastNameAm')}
                    InputProps={{
                        style: { fontFamily: 'Noto Sans Ethiopic' }
                    }}
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
                    onChange={handleInputChange}
                    error={Boolean(errors.nationalId)}
                    helperText={renderErrorMessage('nationalId')}
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
            
            {/* Children Information */}
            <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Children Information / የልጆች መረጃ</Typography>
            </Grid>
            
            {formData.children.map((child, index) => (
                <React.Fragment key={index}>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                Child {index + 1}
                            </Typography>
                            {formData.children.length > 1 && (
                                <Button 
                                    size="small" 
                                    color="error" 
                                    onClick={() => handleRemoveChild(index)}
                                >
                                    Remove
                                </Button>
                            )}
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            name={`children[${index}].name`}
                            label="Child Name (English)"
                            value={child.name || ''}
                            onChange={handleInputChange}
                            error={Boolean(errors.children?.[index]?.name)}
                            helperText={errors.children?.[index]?.name || ''}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            name={`children[${index}].nameAm`}
                            label="Child Name (Amharic)"
                            value={child.nameAm || ''}
                            onChange={handleInputChange}
                            error={Boolean(errors.children?.[index]?.nameAm)}
                            helperText={errors.children?.[index]?.nameAm || ''}
                            InputProps={{
                                style: { fontFamily: 'Noto Sans Ethiopic' }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            name={`children[${index}].age`}
                            label="Age"
                            type="number"
                            value={child.age || ''}
                            onChange={handleInputChange}
                            error={Boolean(errors.children?.[index]?.age)}
                            helperText={errors.children?.[index]?.age || ''}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth error={Boolean(errors.children?.[index]?.gender)}>
                            <InputLabel>Gender</InputLabel>
                            <Select
                                name={`children[${index}].gender`}
                                value={child.gender || ''}
                                onChange={handleInputChange}
                                label="Gender"
                            >
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                            {errors.children?.[index]?.gender && (
                                <FormHelperText>{errors.children?.[index]?.gender}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>
                </React.Fragment>
            ))}
            
            <Grid item xs={12}>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleAddChild}
                >
                    Add Child
                </Button>
            </Grid>
        </Grid>
    );

    const handleAddChild = () => {
        setFormData(prev => ({
            ...prev,
            children: [...prev.children, { name: '', nameAm: '', age: '', gender: '' }]
        }));
    };

    const handleRemoveChild = (index) => {
        setFormData(prev => {
            const newChildren = [...prev.children];
            newChildren.splice(index, 1);
            
            // Always keep at least one child form
            if (newChildren.length === 0) {
                newChildren.push({ name: '', nameAm: '', age: '', gender: '' });
            }
            
            return {
                ...prev,
                children: newChildren
            };
        });
        
        // Clear any errors for this child
        setErrors(prev => {
            if (!prev.children) return prev;
            
            const newChildrenErrors = { ...prev };
            if (newChildrenErrors.children) {
                const childrenArray = [...newChildrenErrors.children];
                childrenArray.splice(index, 1);
                
                if (childrenArray.length === 0) {
                    delete newChildrenErrors.children;
                } else {
                    newChildrenErrors.children = childrenArray;
                }
            }
            
            return newChildrenErrors;
        });
    };

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
                            onChange={handleInputChange}
                            error={Boolean(errors.landLocation?.[key])}
                            helperText={errors.landLocation?.[key] || ''}
                            InputProps={isAmharic ? {
                                style: { fontFamily: 'Noto Sans Ethiopic' }
                            } : undefined}
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
                        onChange={handleInputChange}
                        error={Boolean(errors['landLocation.region'])}
                        helperText={errors['landLocation.region'] || ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Region (Amharic) / ክልል"
                        name="landLocation.regionAm"
                        value={formData.landLocation.regionAm || ''}
                        onChange={handleInputChange}
                        error={Boolean(errors['landLocation.regionAm'])}
                        helperText={errors['landLocation.regionAm'] || ''}
                        InputProps={{
                            style: { fontFamily: 'Noto Sans Ethiopic' }
                        }}
                    />
                </Grid>
                
                {/* Woreda Fields */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Woreda (English)"
                        name="landLocation.woreda"
                        value={formData.landLocation.woreda || ''}
                        onChange={handleInputChange}
                        error={Boolean(errors['landLocation.woreda'])}
                        helperText={errors['landLocation.woreda'] || ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Woreda (Amharic) / ወረዳ"
                        name="landLocation.woredaAm"
                        value={formData.landLocation.woredaAm || ''}
                        onChange={handleInputChange}
                        error={Boolean(errors['landLocation.woredaAm'])}
                        helperText={errors['landLocation.woredaAm'] || ''}
                        InputProps={{
                            style: { fontFamily: 'Noto Sans Ethiopic' }
                        }}
                    />
                </Grid>
                
                {/* Kebele Fields */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Kebele (English)"
                        name="landLocation.kebele"
                        value={formData.landLocation.kebele || ''}
                        onChange={handleInputChange}
                        error={Boolean(errors['landLocation.kebele'])}
                        helperText={errors['landLocation.kebele'] || ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Kebele (Amharic) / ቀበሌ"
                        name="landLocation.kebeleAm"
                        value={formData.landLocation.kebeleAm || ''}
                        onChange={handleInputChange}
                        error={Boolean(errors['landLocation.kebeleAm'])}
                        helperText={errors['landLocation.kebeleAm'] || ''}
                        InputProps={{
                            style: { fontFamily: 'Noto Sans Ethiopic' }
                        }}
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
                        onChange={handleInputChange}
                        error={Boolean(errors.landDescription?.en)}
                        helperText={errors.landDescription?.en || ''}
                        multiline
                        rows={4}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Land Description (Amharic) / የመሬት ማብራሪያ"
                        name="landDescription.am"
                        value={formData.landDescription?.am || ''}
                        onChange={handleInputChange}
                        error={Boolean(errors.landDescription?.am)}
                        helperText={errors.landDescription?.am || ''}
                        multiline
                        rows={4}
                        InputProps={{
                            style: { fontFamily: 'Noto Sans Ethiopic' }
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Land Size"
                        name="landSize"
                        type="number"
                        value={formData.landSize || ''}
                        onChange={handleInputChange}
                        error={Boolean(errors.landSize)}
                        helperText={errors.landSize || ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Size Unit</InputLabel>
                        <Select
                            name="sizeUnit"
                            value={formData.sizeUnit || ''}
                            onChange={handleInputChange}
                            error={Boolean(errors.sizeUnit)}
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
                        {formData.signatures?.officer ? (
                            <Box>
                                <img 
                                    src={formData.signatures?.officer} 
                                    alt="Officer Signature" 
                                    style={{ maxWidth: '100%', maxHeight: '100px' }}
                                />
                                <Button 
                                    size="small" 
                                    sx={{ mt: 1 }}
                                    onClick={() => openSignaturePad('officer')}
                                >
                                    Change
                                </Button>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="subtitle2">Officer Signature</Typography>
                                    <Button 
                                        variant="outlined"
                                        onClick={() => openSignaturePad('officer')}
                                    >
                                        Draw Signature
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Paper>
                    {errors.signatures?.officer && (
                        <FormHelperText error>{errors.signatures?.officer}</FormHelperText>
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

    const handleInputChange = (name, value) => {
        // Handle direct name and value parameters
        if (arguments.length === 2) {
            handleFieldChange(name, value);
            return;
        }
        
        // Handle event parameter
        const { target } = name; // name is the event
        handleFieldChange(target.name, target.value);
    };
    
    const handleFieldChange = (name, value) => {
        if (name.includes('.')) {
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
                if (newErrors[parent]) {
                    const parentErrors = { ...newErrors[parent] };
                    delete parentErrors[child];
                    if (Object.keys(parentErrors).length === 0) {
                        delete newErrors[parent];
                    } else {
                        newErrors[parent] = parentErrors;
                    }
                }
                return newErrors;
            });
        } else if (name.includes('[') && name.includes(']')) {
            // Handle array inputs like children[0].name
            const matches = name.match(/([^\[]+)\[(\d+)\]\.(.+)/);
            if (matches) {
                const [_, arrayName, indexStr, prop] = matches;
                const index = parseInt(indexStr, 10);
                
                // Check if the array exists
                if (!formData[arrayName]) {
                    console.error(`Array ${arrayName} does not exist in form data`);
                    return;
                }
                
                // Ensure the array has enough elements
                const newArray = [...formData[arrayName]];
                while (newArray.length <= index) {
                    newArray.push({});
                }
                
                // Update the specific property
                newArray[index] = {
                    ...newArray[index],
                    [prop]: value
                };
                
                // Update form data
                setFormData(prev => ({
                    ...prev,
                    [arrayName]: newArray
                }));
                
                // Clear error for this field
                setErrors(prev => {
                    const newErrors = { ...prev };
                    if (newErrors[arrayName] && newErrors[arrayName][index] && newErrors[arrayName][index][prop]) {
                        const arrayErrors = { ...newErrors[arrayName] };
                        const indexErrors = { ...arrayErrors[index] };
                        delete indexErrors[prop];
                        
                        if (Object.keys(indexErrors).length === 0) {
                            delete arrayErrors[index];
                        } else {
                            arrayErrors[index] = indexErrors;
                        }
                        
                        if (Object.keys(arrayErrors).length === 0) {
                            delete newErrors[arrayName];
                        } else {
                            newErrors[arrayName] = arrayErrors;
                        }
                    }
                    return newErrors;
                });
            }
        } else {
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
        e.preventDefault();
        
        // Use validateAllSteps to ensure all steps are valid
        if (!validateAllSteps()) {
            // validateAllSteps already sets errors and shows alerts
            return;
        }

        try {
            // Your submit logic here
            console.log('Form submitted:', formData);
            // Show success message
            alert("Form submitted successfully!");
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrors({
                general: "An error occurred while submitting the form. Please try again."
            });
            // Show error alert
            alert("An error occurred while submitting the form. Please try again.");
        }
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
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    [field]: reader.result
                }));
                
                // Clear any error for this field if successful
                setErrors(prev => ({
                    ...prev,
                    [field]: undefined
                }));
            };
            reader.readAsDataURL(file);
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
        
        if (Object.keys(stepErrors).length === 0) {
            // Clear any existing errors for this step
            setErrors(prev => {
                const newErrors = { ...prev };
                
                // Determine which fields to clear based on the current step
                switch (activeStep) {
                    case 0: // Owner Information
                        ['ownerFirstName', 'ownerFirstNameAm', 'ownerLastName', 'ownerLastNameAm', 
                         'dateOfBirth', 'nationalId', 'phone', 'address', 'addressAm'].forEach(field => {
                            delete newErrors[field];
                        });
                        break;
                    case 1: // Personal Information
                        ['fatherName', 'motherName', 'maritalStatus', 'children'].forEach(field => {
                            delete newErrors[field];
                        });
                        break;
                    case 2: // Land Description
                        ['landLocation', 'landSize', 'sizeUnit', 'landUseType', 
                         'landDescription', 'landDescriptionAm'].forEach(field => {
                            delete newErrors[field];
                        });
                        break;
                    case 3: // Legal Details
                        ['registrationNumber', 'dateOfIssuance', 'expirationDate',
                         'issuingAuthority', 'issuingAuthorityAm'].forEach(field => {
                            delete newErrors[field];
                        });
                        break;
                    case 4: // Photos & Signatures
                        ['landPhoto', 'boundaryPhoto', 'signatures'].forEach(field => {
                            delete newErrors[field];
                        });
                        break;
                    default:
                        break;
                }
                
                return newErrors;
            });
            
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
            
            // If current step is the last step before certificate preview
            if (activeStep === steps.length - 2) {
                // Generate the certificate
                handleCertificateGeneration();
            } else {
                // Just go to the next step
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
            }
        } else {
            // Display errors for this step
            setErrors(prev => ({
                ...prev,
                ...stepErrors
            }));
            
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
                    errors.dateOfBirth = "Date of birth is required / የልደት ቀን ያስፈልጋል";
                } else {
                    // Check if the date is in the future
                    const birthDate = new Date(formData.dateOfBirth);
                    const currentDate = new Date();
                    
                    if (birthDate > currentDate) {
                        errors.dateOfBirth = "Date of birth cannot be in the future / የትውልድ ቀን ከዛሬ በኋላ መሆን አይችልም";
                    }
                    
                    // Check if person is at least 18 years old
                    const eighteenYearsAgo = new Date();
                    eighteenYearsAgo.setFullYear(currentDate.getFullYear() - 18);
                    
                    if (birthDate > eighteenYearsAgo) {
                        errors.dateOfBirth = "Land owner must be at least 18 years old / የመሬት ባለቤት ቢያንስ 18 ዓመት መሆን አለበት";
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
                } else if (!/^\d{9,10}$/.test(formData.phone.replace(/\D/g, ''))) {
                    errors.phone = { 
                        en: 'Phone number must be 9-10 digits', 
                        am: 'ስልክ ቁጥር 9-10 አሃዞች መሆን አለበት' 
                    };
                }
                
                // Validate address (English)
                if (!formData.address) {
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
                                childError.nameAm = 'Child name in Amharic is required / የልጅ ስም በአማርኛ ያስፈልጋል';
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
                                childError.gender = 'Child gender is required / የልጅ ፆታ ያስፈልጋል';
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
                // Land location - region
                if (!formData.landLocation?.region) {
                    errors.landLocation = errors.landLocation || {};
                    errors.landLocation.region = { 
                        en: 'Region is required', 
                        am: 'ክልል ያስፈልጋል' 
                    };
                }
                
                // Land location - zone
                if (!formData.landLocation?.zone) {
                    errors.landLocation = errors.landLocation || {};
                    errors.landLocation.zone = { 
                        en: 'Zone is required', 
                        am: 'ዞን ያስፈልጋል' 
                    };
                }
                
                // Land location - woreda
                if (!formData.landLocation?.woreda) {
                    errors.landLocation = errors.landLocation || {};
                    errors.landLocation.woreda = { 
                        en: 'Woreda is required', 
                        am: 'ወረዳ ያስፈልጋል' 
                    };
                }
                
                // Land location - kebele
                if (!formData.landLocation?.kebele) {
                    errors.landLocation = errors.landLocation || {};
                    errors.landLocation.kebele = { 
                        en: 'Kebele is required', 
                        am: 'ቀበሌ ያስፈልጋል' 
                    };
                }
                
                // Land size
                if (!formData.landSize) {
                    errors.landSize = { 
                        en: 'Land size is required', 
                        am: 'የመሬት መጠን ያስፈልጋል' 
                    };
                } else if (isNaN(formData.landSize) || parseFloat(formData.landSize) <= 0) {
                    errors.landSize = { 
                        en: 'Please enter a valid land size', 
                        am: 'ትክክለኛ የመሬት መጠን ያስገቡ' 
                    };
                }
                
                // Size unit
                if (!formData.sizeUnit) {
                    errors.sizeUnit = { 
                        en: 'Size unit is required', 
                        am: 'የመጠን መለኪያ ያስፈልጋል' 
                    };
                }
                
                // Land use type
                if (!formData.landUseType) {
                    errors.landUseType = { 
                        en: 'Land use type is required', 
                        am: 'የመሬት አጠቃቀም ዓይነት ያስፈልጋል' 
                    };
                }
                
                // Land description (English)
                if (!formData.landDescription) {
                    errors.landDescription = { 
                        en: 'Land description is required', 
                        am: 'የመሬት መግለጫ ያስፈልጋል' 
                    };
                }
                
                // Land description (Amharic)
                if (!formData.landDescriptionAm) {
                    errors.landDescriptionAm = { 
                        en: 'Land description in Amharic is required', 
                        am: 'የመሬት መግለጫ በአማርኛ ያስፈልጋል' 
                    };
                }
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
                
                // Owner signature
                if (!formData.signatures?.owner) {
                    errors.signatures = errors.signatures || {};
                    errors.signatures.owner = { 
                        en: 'Owner signature is required', 
                        am: 'የባለቤት ፊርማ ያስፈልጋል' 
                    };
                }
                
                // Official signature
                if (!formData.signatures?.official) {
                    errors.signatures = errors.signatures || {};
                    errors.signatures.official = { 
                        en: 'Official signature is required', 
                        am: 'የባለስልጣን ፊርማ ያስፈልጋል' 
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
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signatureType, setSignatureType] = useState('owner'); // To track which signature is being drawn
    
    // Single signature pad ref for the modal
    const signaturePad = useRef(null);
    
    // Multiple signature pad refs for different signatories
    const signaturePads = {
        owner: useRef(null),
        officer: useRef(null),
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
            Object.assign(allErrors, stepErrors);
        }
        
        if (Object.keys(allErrors).length === 0) {
            // Generate certificate number if not already set
            if (!formData.certificateNumber) {
                const currentYear = new Date().getFullYear();
                const randomPart = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
                const certificateNumber = `LRMS-${currentYear}-${randomPart}`;
                
                // Update form data with generated certificate number
                setFormData(prev => ({
                    ...prev,
                    certificateNumber
                }));
            }
            
            // Generate registration number if not already set
            if (!formData.registrationNumber) {
                const currentYear = new Date().getFullYear();
                const randomPart = Math.floor(100000 + Math.random() * 900000);
                const registrationNumber = `REG-${currentYear}-${randomPart}`;
                
                // Update form data with generated registration number
                setFormData(prev => ({
                    ...prev,
                    registrationNumber
                }));
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
                    allErrors.children.forEach((childErrors, index) => {
                        if (!childErrors) return;
                        
                        Object.entries(childErrors).forEach(([childField, childError]) => {
                            errorMessage += `- Child ${index + 1} ${childField}: ${childError}\n`;
                        });
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
                
                {activeStep === steps.length - 1 ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            // Handle certificate download or print
                            alert("Certificate download functionality would be triggered here");
                        }}
                    >
                        Download Certificate
                    </Button>
                ) : activeStep === steps.length - 2 ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCertificateGeneration}
                    >
                        Generate Certificate
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

            {/* Certificate Preview Dialog */}
            <Dialog
                open={showCertificate}
                onClose={() => setShowCertificate(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    Certificate Preview
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Certificate Number: {formData.certificateNumber}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Please review the certificate details before proceeding.
                        </Typography>
                        <CertificateGenerator certificateData={formData} />
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
                     signatureType === 'officer' ? 'Officer Signature' : 
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
                    for (let step = 0; step < steps.length; step++) {
                        const stepErrors = validateStep(step);
                        Object.assign(allErrors, stepErrors);
                    }
                    
                    // Format errors for display
                    let errorMessage = "Form Validation Errors:\n\n";
                    
                    if (Object.keys(allErrors).length === 0) {
                        errorMessage = "No validation errors found. All required fields are filled correctly.";
                    } else {
                        // Group errors by step
                        const stepErrorMap = {
                            "Owner Information": [],
                            "Personal Information": [],
                            "Land Description": [],
                            "Legal Details": [],
                            "Photos & Signatures": []
                        };
                        
                        // Process flat errors
                        Object.entries(allErrors).forEach(([field, error]) => {
                            if (field === 'children') return; // Handle children separately
                            
                            // Determine which step this field belongs to
                            let stepName = "Owner Information";
                            if (['fatherName', 'motherName', 'maritalStatus'].includes(field)) {
                                stepName = "Personal Information";
                            } else if (field.startsWith('landLocation') || field.startsWith('landDescription') || ['landSize', 'sizeUnit', 'landUseType'].includes(field)) {
                                stepName = "Land Description";
                            } else if (['legalRights', 'termsAndConditions', 'dateOfIssuance', 'registrationNumber'].includes(field) || field.startsWith('issuing')) {
                                stepName = "Legal Details";
                            } else if (['landPhoto', 'boundaryPhoto', 'signatures'].includes(field)) {
                                stepName = "Photos & Signatures";
                            }
                            
                            // Add error to the appropriate step
                            if (typeof error === 'object' && error !== null) {
                                Object.values(error).forEach(err => {
                                    if (err) stepErrorMap[stepName].push(`${field}: ${err}`);
                                });
                            } else if (error) {
                                stepErrorMap[stepName].push(`${field}: ${error}`);
                            }
                        });
                        
                        // Process children errors if any exist
                        if (allErrors.children) {
                            allErrors.children.forEach((childErrors, index) => {
                                if (!childErrors) return;
                                
                                Object.entries(childErrors).forEach(([field, error]) => {
                                    stepErrorMap["Personal Information"].push(`Child ${index + 1} ${field}: ${error}`);
                                });
                            });
                        }
                        
                        // Format the grouped errors
                        Object.entries(stepErrorMap).forEach(([step, errors]) => {
                            if (errors.length > 0) {
                                errorMessage += `${step}:\n`;
                                errors.forEach(error => {
                                    errorMessage += `- ${error}\n`;
                                });
                                errorMessage += '\n';
                            }
                        });
                    }
                    
                    // Show alert with formatted errors
                    alert(errorMessage);
                    
                    // Also log to console for developers
                    console.log("Form Data:", formData);
                    console.log("Form Errors:", allErrors);
                }}
            >
                Debug Form
            </Button>
        </Box>
    );
};

export default CertificationForm;
