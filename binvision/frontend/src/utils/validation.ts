export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_UPLOAD_MB = 5
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

/** Returns an error message, or null when the file is acceptable. Mirrors backend rules. */
export function validateImageFile(file: File): string | null {
  if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return 'Unsupported file type. Please choose a JPEG, PNG or WebP image.'
  }
  if (file.size === 0) return 'That file is empty. Please choose another image.'
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_UPLOAD_MB} MB.`
  }
  return null
}
