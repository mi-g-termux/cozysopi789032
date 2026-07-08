import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const cloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

export const PRODUCTS_FOLDER = "shop-products";

/** Upload a base64 data URI or remote URL to Cloudinary. */
export async function uploadImage(file: string) {
  const res = await cloudinary.uploader.upload(file, {
    folder: PRODUCTS_FOLDER,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto", width: 800, crop: "limit" }]
  });
  return { url: res.secure_url, publicId: res.public_id };
}

/** Derive the Cloudinary public_id from a stored secure URL. */
export function publicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

export async function deleteImage(url: string) {
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
