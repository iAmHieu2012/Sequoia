/**
 * Service for image uploads to Cloudinary.
 */
export const UploadService = {
  /**
   * Uploads straight from the browser using an unsigned upload preset (no server round-trip).
   * @returns The image's public HTTPS URL.
   */
  uploadImageToCloudinary: async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Missing Cloudinary configuration in .env.local");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }
    
    return data.secure_url;
  }
};
