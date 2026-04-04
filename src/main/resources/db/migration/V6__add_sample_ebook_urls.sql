-- Add sample ebook / preview URLs to a few seed books for demo purposes

-- Chí Phèo: public HTML preview (Project Gutenberg style)
UPDATE books
SET preview_url = 'https://www.gutenberg.org/files/5200/5200-h/5200-h.htm'
WHERE id = 1;

-- Truyện Kiều: sample PDF for testing the embedded reader
UPDATE books
SET ebook_url = 'https://www.africau.edu/images/default/sample.pdf'
WHERE id = 3;
