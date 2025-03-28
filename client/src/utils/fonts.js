import { Font } from '@react-pdf/renderer';

// Register fonts with local files
Font.register({
    family: 'Roboto',
    fonts: [
        { src: '/fonts/Roboto-Light.ttf', fontWeight: 300 },
        { src: '/fonts/Roboto-Regular.ttf', fontWeight: 400 },
        { src: '/fonts/Roboto-Medium.ttf', fontWeight: 500 },
        { src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 },
    ],
});

// Register Noto Sans Ethiopic font for Amharic text support
Font.register({
    family: 'Noto Sans Ethiopic',
    src: '/fonts/NotoSansEthiopic-Regular.ttf',
});

export const fontFamilies = {
    roboto: 'Roboto',
    notoSansEthiopic: 'Noto Sans Ethiopic',
};