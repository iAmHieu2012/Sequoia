/**
 * Service for handling file and image uploads to Cloudinary or external providers.
 */
export const UploadService = {
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
