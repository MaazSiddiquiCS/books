const db = require('../db/connection');
const axios = require('axios');
const pdfGenerator = require('../services/pdfGenerator');

exports.recordDownload = (req, res) => {
  const { user_id, book_id } = req.body;

  if (!user_id || !book_id) {
    return res.status(400).json({ error: 'User ID and Book ID are required' });
  }

  db.query(
    `SELECT * FROM downloaded_books WHERE user_id = ? AND book_id = ?`,
    [user_id, book_id],
    (err, results) => {
      if (err) {
        console.error('Error checking existing download:', err.message);
        return res.status(500).json({ error: 'Failed to check existing download' });
      }

      if (results.length > 0) {
        // Update downloaded_books and books_downloaded
        db.query(
          `UPDATE downloaded_books 
           SET downloaded_at = NOW(), download_count = download_count + 1 
           WHERE user_id = ? AND book_id = ?`,
          [user_id, book_id],
          (err) => {
            if (err) {
              console.error('Error updating downloaded_books:', err.message);
              return res.status(500).json({ error: 'Failed to update downloaded_books' });
            }

            db.query(
              `UPDATE books_downloaded 
               SET numdownloads = numdownloads + 1 
               WHERE book_id = ?`,
              [book_id],
              (err) => {
                if (err) {
                  console.error('Error updating books_downloaded:', err.message);
                  return res.status(500).json({ error: 'Failed to update books_downloaded' });
                }

                return res.status(200).json({
                  success: true,
                  message: 'Download updated successfully'
                });
              }
            );
          }
        );
      } else {
        // Insert into downloaded_books
        db.query(
          `INSERT INTO downloaded_books (user_id, book_id, downloaded_at, download_count)
           VALUES (?, ?, NOW(), 1)`,
          [user_id, book_id],
          (err) => {
            if (err) {
              console.error('Error inserting into downloaded_books:', err.message);
              return res.status(500).json({ error: 'Failed to insert into downloaded_books' });
            }

            db.query(
              `INSERT INTO books_downloaded (book_id, numdownloads)
               VALUES (?, 1)
               ON DUPLICATE KEY UPDATE numdownloads = numdownloads + 1`,
              [book_id],
              (err) => {
                if (err) {
                  console.error('Error inserting into books_downloaded:', err.message);
                  return res.status(500).json({ error: 'Failed to insert into books_downloaded' });
                }

                return res.status(201).json({
                  success: true,
                  message: 'Download recorded successfully'
                });
              }
            );
          }
        );
      }
    }
  );
};


exports.downloadBook = async (req, res) => {
  try {
    const { book_id, user_id, format } = req.body;

    if (!book_id || !user_id || !format) {
      return res.status(400).json({ error: 'Book ID, User ID, and format are required' });
    }

    console.log(`Attempting to download book ${book_id} in ${format} format`);

    try {
      const bookContent = await exports.getBookContent(book_id, format);
      console.log('Book content retrieved:', { 
        title: bookContent.title,
        hasContent: !!bookContent.content,
        hasLink: !!bookContent.link
      });

      // Record download first
      await exports.recordDownload({ body: { user_id, book_id } }, { 
        status: () => ({ json: () => {} }),
        json: () => {} 
      });

      if (format === 'pdf') {
        if (!bookContent.content) {
          throw new Error('No HTML content available for PDF generation');
        }

        console.log('Starting PDF generation...');
        const pdfBuffer = await pdfGenerator.generatePDF({
          title: bookContent.title || 'Book',
          author: bookContent.author || 'Unknown Author',
          htmlContent: bookContent.content
        });

        // Verify PDF buffer
        if (!pdfBuffer || !pdfBuffer.length) {
          throw new Error('Generated PDF is empty');
        }

        // Create safe filename
        const safeTitle = bookContent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${safeTitle}.pdf`;

        // Send PDF response with proper encoding
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': pdfBuffer.length,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        });
        
        return res.end(pdfBuffer);
      }
      // ... rest of your code for other formats
    } catch (contentError) {
      console.error('Content retrieval failed:', contentError);
      // ... error handling
    }
  } catch (error) {
    console.error('Download process failed:', error);
    // ... error handling
  }
};

exports.getBookContent = async (bookId, format) => {
  return new Promise((resolve, reject) => {
    const formatMap = {
      epub: { id: 2, pattern: '%epub%' },
      pdf:{ id: 1, pattern: '%.html.images%' },
    };
    
    const { id, pattern } = formatMap[format] || {};
    if (!id) return reject(new Error('Unsupported format'));
    
    const query = `
      SELECT bl.link, a.name as author, bt.title
      FROM booklinks bl
      JOIN books b ON bl.book_id = b.book_id
      JOIN booktitles bt ON b.book_id = bt.book_id
      LEFT JOIN authorbooks ab ON b.book_id = ab.book_id
      LEFT JOIN authors a ON a.author_id = ab.author_id
      JOIN bookformat bf ON bl.type_id = bf.id
      WHERE bf.id = ? AND bl.book_id = ? AND bl.link LIKE ?
    `;
    
    db.query(query, [id, bookId, pattern], async (err, results) => {
      if (err) return reject(new Error('Failed to fetch book content'));
      if (results.length === 0) return reject(new Error(`No content found`));

      const bookData = results[0];
      
      try {
        // Use proxy endpoint for HTML content
        const proxyUrl = `https://ebms.up.railway.app/booklinks/links/${bookId}`;
        const response = await axios.get(proxyUrl);
        
        resolve({
          title: bookData.title,
          author: bookData.author,
          content: response.data,
          link: bookData.link
        });
      } catch (error) {
        reject(new Error('Failed to fetch via proxy'));
      }
    });
  });
};

exports.getBookContentRoute = async (req, res) => {
  try {
    const { bookId, format } = req.params;
    const content = await exports.getBookContent(bookId, format);
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookLinkOnly = (req, res) => {
  const { bookId } = req.params;
  const proxyLink = `https://ebms.up.railway.app/booklinks/links/${bookId}`;
  res.json({ link: proxyLink });
};

exports.getbookcover = (req, res) => {
  db.query(` select bl.link, b.book_id FROM booklinks bl 
      JOIN bookformat bf ON bl.type_id = bf.id 
      JOIN books b ON bl.book_id = b.book_id 
      WHERE bf.id = 6 AND bl.link LIKE '%cover.medium.jpg'`, (err, results) => {
      if (err) {
          console.error('Error fetching cover:', err.message);
          return res.status(500).json({ error: 'Failed to fetch covers' });
      }
      res.json(results);
  });
};
exports.getnumdownloads = (req, res) => {
  db.query(` select b.book_id,bd.numdownloads from books_downloaded bd
              join books b on bd.book_id=b.book_id`, (err, results) => {
      if (err) {
          console.error('Error fetching cover:', err.message);
          return res.status(500).json({ error: 'Failed to fetch covers' });
      }
      res.json(results);
  });
};
