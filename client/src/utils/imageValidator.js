// Utility functions for image validation and processing

const VALID_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg'];
const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

/**
 * Validates if the given image URL or path has a valid extension and MIME type
 * @param {string} imagePath - URL or path of the image
 * @returns {Promise<boolean>} - True if valid, false otherwise
 */
export const isValidImageExtension = async (imagePath) => {
    if (!imagePath) return false;
    
    try {
        // Check file extension
        const extension = imagePath.split('.').pop().toLowerCase();
        if (!VALID_EXTENSIONS.includes(extension)) {
            console.warn('Invalid image extension:', extension);
            return false;
        }

        // For URLs, try to fetch and validate MIME type
        if (imagePath.startsWith('http')) {
            const response = await fetch(imagePath, { method: 'HEAD' });
            const contentType = response.headers.get('content-type');
            if (!IMAGE_MIME_TYPES.includes(contentType)) {
                console.warn('Invalid image MIME type:', contentType);
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Error validating image:', error);
        return false;
    }
};

/**
 * Gets a fallback image path based on the type of image
 * @param {string} type - Type of image (e.g., 'profile', 'signature', 'plan')
 * @returns {string} - Path to the fallback image
 */
export const getFallbackImage = (type) => {
    const fallbacks = {
        profile: '/assets/default-profile.jpg',
        signature: '/assets/signature-placeholder.jpg',
        plan: '/assets/land-plan-placeholder.jpg',
        logo: '/assets/ethiopian-flag.jpg'
    };

    return fallbacks[type] || fallbacks.profile;
};

/**
 * Processes an image URL/path and returns either the valid image or a fallback
 * @param {string} imagePath - URL or path of the image
 * @param {string} type - Type of image for fallback
 * @returns {Promise<string>} - Valid image path or fallback image path
 */
export const processImage = async (imagePath, type = 'profile') => {
    const isValid = await isValidImageExtension(imagePath);
    return isValid ? imagePath : getFallbackImage(type);
};