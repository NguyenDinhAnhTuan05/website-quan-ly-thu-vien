/**
 * Get the best image URL for a book cover.
 * Priority: Open Library (by ISBN) > Proxy (Goodreads/Amazon) > original URL
 * @param {string} imageUrl - Original image URL
 * @param {string} [isbn] - Book ISBN for Open Library fallback
 * @returns {string} - Best available image URL
 */
export function getProxiedImageUrl(imageUrl, isbn) {
  // If we have an ISBN, use Open Library covers (reliable, no hotlink issues)
  if (isbn) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  }

  if (!imageUrl) return '';
  
  // If it's already a local URL, return as is
  if (imageUrl.startsWith('/') || imageUrl.startsWith('http://localhost')) {
    return imageUrl;
  }
  
  // If it's from Amazon/Goodreads, proxy it
  if (imageUrl.includes('amazon.com') || imageUrl.includes('goodreads.com')) {
    const encodedUrl = btoa(imageUrl);
    return `/api/proxy/image?url=${encodedUrl}`;
  }
  
  // For other URLs, return as is
  return imageUrl;
}

/**
 * Handle image error by trying fallback sources, then placeholder.
 * Attach to <img onError={handleImageError}>
 * @param {Event} e - Image error event
 * @param {string} [isbn] - ISBN to try Open Library as fallback
 * @param {string} [originalUrl] - Original cover URL to try proxy as fallback
 */
export function handleImageError(e, isbn, originalUrl) {
  const src = e.target.src;

  // If Open Library failed and we have an original URL, try proxy
  if (src.includes('covers.openlibrary.org') && originalUrl &&
      (originalUrl.includes('amazon.com') || originalUrl.includes('goodreads.com'))) {
    const encodedUrl = btoa(originalUrl);
    e.target.src = `/api/proxy/image?url=${encodedUrl}`;
    return;
  }

  // Final fallback: SVG placeholder
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"%3E%3Crect fill="%23f3f4f6" width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="16" fill="%239ca3af"%3EKhông có ảnh%3C/text%3E%3C/svg%3E';
  e.target.onerror = null; // Prevent infinite loop
}
