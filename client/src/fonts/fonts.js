import { Font } from '@react-pdf/renderer';

// Import font files
import NotoSansEthiopic from './NotoSansEthiopic-Regular.ttf';
import NotoSansEthiopicBold from './NotoSansEthiopic-Bold.ttf';
import RobotoRegular from './Roboto-Regular.ttf';
import RobotoBold from './Roboto-Bold.ttf';

// Register fonts
Font.register({
  family: 'Noto Sans Ethiopic',
  fonts: [
    { src: NotoSansEthiopic, fontWeight: 'normal' },
    { src: NotoSansEthiopicBold, fontWeight: 'bold' }
  ]
});

Font.register({
  family: 'Roboto',
  fonts: [
    { src: RobotoRegular, fontWeight: 'normal' },
    { src: RobotoBold, fontWeight: 'bold' }
  ]
});

// Export font families for use in components
export const fonts = {
  ethiopic: 'Noto Sans Ethiopic',
  latin: 'Roboto'
};