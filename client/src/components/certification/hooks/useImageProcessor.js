import { useState, useEffect } from 'react';

const processImage = async (imageSource, type = 'image') => {
    if (!imageSource) return null;
    try {
        return typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
    } catch (error) {
        console.error(`Error processing ${type} image:`, error);
        return null;
    }
};

export const useImageProcessor = (imageSources) => {
    const [processedImages, setProcessedImages] = useState({});
    const [imageError, setImageError] = useState(null);

    useEffect(() => {
        const processImages = async () => {
            try {
                const processed = {};
                for (const [key, source] of Object.entries(imageSources)) {
                    processed[key] = await processImage(source, key);
                }
                setProcessedImages(processed);
            } catch (error) {
                console.error('Error processing images:', error);
                setImageError('Failed to process one or more images');
            }
        };

        processImages();
    }, [imageSources]);

    return { processedImages, imageError };
};