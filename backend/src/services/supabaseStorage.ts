import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Initialize Supabase client with service role key (full access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class SupabaseStorageService {
  /**
   * Upload a file to Supabase Storage
   * @param bucket - The bucket name (e.g., 'user-uploads', 'documents')
   * @param fileName - The file name
   * @param fileBuffer - The file buffer
   * @param userId - User ID for organizing files
   * @param contentType - MIME type of the file
   */
  async uploadFile(
    bucket: string,
    fileName: string,
    fileBuffer: Buffer,
    userId: string,
    contentType: string = 'image/jpeg'
  ): Promise<{ url: string; path: string }> {
    try {
      const path = `${userId}/${Date.now()}-${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, fileBuffer, {
          contentType,
          upsert: false,
          cacheControl: '3600'
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return {
        url: urlData.publicUrl,
        path
      };
    } catch (error: any) {
      console.error('File upload error:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from Supabase Storage
   * @param bucket - The bucket name
   * @param filePath - The path of the file to delete
   */
  async deleteFile(bucket: string, filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    } catch (error: any) {
      console.error('File deletion error:', error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Get public URL for a file
   * @param bucket - The bucket name
   * @param path - The file path
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * List files in a bucket for a user
   * @param bucket - The bucket name
   * @param userId - User ID
   */
  async listUserFiles(bucket: string, userId: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(userId);

      if (error) {
        throw new Error(`Failed to list files: ${error.message}`);
      }

      return data.map(file => ({
        name: file.name,
        size: file.metadata?.size,
        lastModified: file.updated_at,
        url: this.getPublicUrl(bucket, `${userId}/${file.name}`)
      }));
    } catch (error: any) {
      console.error('List files error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
}

export const supabaseStorageService = new SupabaseStorageService();


