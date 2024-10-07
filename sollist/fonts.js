import localFont from 'next/font/local';

export const gilroy = localFont({
  src: [
    {
      path: './fonts/Gilroy-Thin.ttf', // Replace with the actual relative path to your font file
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/Gilroy-Light.ttf', // Replace with the actual relative path to your font file
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Gilroy-Regular.ttf', // Replace with the actual relative path to your font file
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Gilroy-Medium.ttf', // Replace with the actual relative path to your font file
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Gilroy-SemiBold.ttf', // Replace with the actual relative path to your font file
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Gilroy-Bold.ttf', // Replace with the actual relative path to your font file
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Gilroy-ExtraBold.ttf', // Replace with the actual relative path to your font file
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/Gilroy-Black.ttf', // Replace with the actual relative path to your font file
      weight: '900',
      style: 'normal',
    }
  ],
});
