import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads an image file to Supabase Storage.
 * 
 * @param {File} file - The file object to upload
 * @param {string} bucket - The bucket name (default: 'images')
 * @param {string} folder - Optional folder path (e.g., 'players' or 'teams')
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadImage = async (file, bucket = 'images', folder = '') => {
    if (!file) throw new Error("No file provided");

    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
    }

    // Get Public URL
    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return data.publicUrl;
};
