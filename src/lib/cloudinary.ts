import { CldImage } from 'next-cloudinary';

// Replace with your cloud name from Cloudinary dashboard
export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

// Helper function to get Cloudinary URL
export const getCloudinaryUrl = (publicId: string) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
};

export { CldImage }; 