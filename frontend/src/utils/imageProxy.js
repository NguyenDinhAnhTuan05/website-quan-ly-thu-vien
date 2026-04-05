/**
 * Get the best image URL for a book cover.
 * Priority:
 *   1. Google Books URL (coverUrl from crawler) → dùng trực tiếp, tăng zoom
 *   2. Open Library by ISBN (chỉ khi ISBN thật, không phải Google ID)
 *   3. Original URL as-is
 *
 * @param {string} imageUrl - Original image URL (coverUrl từ DB)
 * @param {string} [isbn] - Book ISBN
 * @returns {string} - Best available image URL
 */
export function getProxiedImageUrl(imageUrl, isbn) {
  // Nếu là URL từ Google Books → dùng trực tiếp, tăng zoom để ảnh lớn hơn
  if (imageUrl && imageUrl.includes('books.google.com')) {
    let url = imageUrl.replace('http:', 'https:');
    // Tăng zoom từ 1 lên 2 để ảnh rõ hơn
    url = url.replace('zoom=1', 'zoom=2').replace('zoom=5', 'zoom=2');
    return url;
  }

  // Nếu có ISBN thật (chỉ số, 10 hoặc 13 ký tự) → thử Open Library
  if (isbn && /^\d{10,13}$/.test(isbn)) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  }

  if (!imageUrl) return '';
  
  // URL local → return as is
  if (imageUrl.startsWith('/') || imageUrl.startsWith('http://localhost')) {
    return imageUrl;
  }
  
  // Tất cả URL external → proxy qua backend để tránh hotlink protection / CORS
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    const encodedUrl = btoa(imageUrl);
    return `/api/proxy/image?url=${encodedUrl}`;
  }
  
  return imageUrl;
}

/**
 * Handle image error by trying fallback sources, then placeholder.
 * @param {Event} e - Image error event
 * @param {string} [isbn] - ISBN to try Open Library as fallback
 * @param {string} [originalUrl] - Original cover URL to try as fallback
 */
export function handleImageError(e, isbn, originalUrl) {
  const src = e.target.src;

  // Fallback 1: Nếu Google Books failed → thử Open Library (chỉ ISBN thật)
  if (src.includes('books.google.com') && isbn && /^\d{10,13}$/.test(isbn)) {
    e.target.src = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    return;
  }

  // Fallback 2: Nếu Open Library failed → thử Google Books URL gốc
  if (src.includes('covers.openlibrary.org') && originalUrl && originalUrl.includes('books.google.com')) {
    let url = originalUrl.replace('http:', 'https:');
    url = url.replace('zoom=1', 'zoom=2').replace('zoom=5', 'zoom=2');
    e.target.src = url;
    return;
  }

  // Fallback 3: Nếu Open Library failed → thử proxy URL gốc
  if (src.includes('covers.openlibrary.org') && originalUrl &&
      (originalUrl.startsWith('http://') || originalUrl.startsWith('https://'))) {
    const encodedUrl = btoa(originalUrl);
    e.target.src = `/api/proxy/image?url=${encodedUrl}`;
    return;
  }

  // Final fallback: SVG placeholder
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"%3E%3Crect fill="%23f3f4f6" width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="16" fill="%239ca3af"%3EKhông có ảnh%3C/text%3E%3C/svg%3E';
  e.target.onerror = null;
}
