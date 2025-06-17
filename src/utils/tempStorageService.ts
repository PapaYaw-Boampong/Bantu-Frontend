// Temporary storage service for local development
// This is a temporary solution to store and retrieve files locally

/**
 * Store a file in the local temp storage
 * @param file File to store
 * @param type 'audio' | 'image' - Type of file to store
 * @returns URL to access the file
 */
export const storeFile = async (file: File, type: 'audio' | 'image'): Promise<string> => {
  // In a real implementation, this would upload to a server
  // For now, we'll use the File API to create a local URL
  const fileUrl = URL.createObjectURL(file);
  
  // In a real app, we would save this to a server
  // For now, just return the local URL
  return fileUrl;
};

/**
 * Get a file from a URL or ID
 * @param url URL or ID of the file to retrieve
 * @param type 'audio' | 'image' - Type of file to retrieve
 * @returns URL to access the file
 */
export const getFileUrl = (url: string, type: 'audio' | 'image'): string => {
  // If it's already a blob URL, return it
  if (url.startsWith('blob:')) {
    return url;
  }
  
  // If it's a full URL, return it
  if (url.startsWith('http')) {
    return url;
  }
  
  // Otherwise, assume it's a file in our temp storage
  const folder = type === 'audio' ? 'audio' : 'images';
  return `/temp_storage/${folder}/${url}`;
};

/**
 * Save a base64 string as a file
 * @param base64String Base64 string to save
 * @param type 'audio' | 'image' - Type of file to store
 * @returns URL to access the file
 */
export const saveBase64AsFile = async (base64String: string, type: 'audio' | 'image'): Promise<string> => {
  // Convert base64 to blob
  const parts = base64String.split(';base64,');
  const contentType = parts[0].split(':')[1] || '';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  const blob = new Blob([uInt8Array], { type: contentType });
  const file = new File([blob], `temp-${Date.now()}.${contentType.split('/')[1] || 'file'}`, { type: contentType });
  
  return storeFile(file, type);
}; 