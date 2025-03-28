// Mock user database
const users = {
    'admin@lrms.gov.et': {
        password: 'admin123',
        role: 'admin',
        name: 'System Administrator',
    },
    'registration@lrms.gov.et': {
        password: 'reg123',
        role: 'registration',
        name: 'Registration Officer',
    },
};

export const validateCredentials = (email, password) => {
    const user = users[email];
    if (user && user.password === password) {
        const { password: _, ...userWithoutPassword } = user;
        return { email, ...userWithoutPassword };
    }
    return null;
};

export const getUserPermissions = (role) => {
    const permissions = {
        admin: [
            'manage_users',
            'reset_passwords',
            'view_reports',
            'manage_system',
            'manage_certificates',
        ],
        registration: [
            'create_certificate',
            'view_certificates',
            'verify_certificates',
            'manage_landowners',
        ],
    };
    return permissions[role] || [];
};

export const resetPassword = (email, newPassword, adminEmail) => {
    const admin = users[adminEmail];
    const targetUser = users[email];

    if (!admin || admin.role !== 'admin') {
        throw new Error('Unauthorized: Only administrators can reset passwords');
    }

    if (!targetUser) {
        throw new Error('User not found');
    }

    users[email].password = newPassword;
    return true;
};

export const changePassword = (email, currentPassword, newPassword) => {
    const user = users[email];
    
    if (!user) {
        throw new Error('User not found');
    }

    if (user.password !== currentPassword) {
        throw new Error('Current password is incorrect');
    }

    users[email].password = newPassword;
    return true;
};

export const requestPasswordReset = (email) => {
    const user = users[email];
    if (!user) {
        throw new Error('User not found');
    }
    // In a real application, this would send an email with a reset token
    return true;
};

export const validateResetToken = (token) => {
    // In a real application, this would validate the reset token
    return token === 'valid-token';
};
