const db = require('../db/connection');
const axios = require('axios');

// Get all books
exports.getAllBooklinks = (req, res) => {
    db.query(`SELECT bl.link, b.book_id FROM booklinks bl 
        JOIN bookformat bf ON bl.type_id = bf.id 
        JOIN books b ON bl.book_id = b.book_id 
        WHERE bf.id = 1 AND (bl.link LIKE '%h.htm' OR bl.link LIKE '%.html.images')`, (err, results) => {
        if (err) {
            console.error('Error fetching links:', err.message);
            return res.status(500).json({ error: 'Failed to fetch links' });
        }
        res.json(results);
    });
};

exports.getBookContent = async (req, res) => {
    const { bookId } = req.params;

    // First try to find .h.htm link
    db.query(
        `SELECT bl.link 
         FROM booklinks bl
         JOIN bookformat bf ON bl.type_id = bf.id 
         WHERE bf.id = 1 AND bl.book_id = ? AND bl.link LIKE '%h.htm'`,
        [bookId],
        async (err, htmResults) => {
            if (err) {
                console.error('Error fetching book link:', err.message);
                return res.status(500).json({ error: 'Failed to fetch book content' });
            }
            
            let bookLink;
            
            if (htmResults.length > 0) {
                bookLink = htmResults[0].link;
            } else {
                // If no .h.htm link found, try to find .html link
                db.query(
                    `SELECT bl.link 
                     FROM booklinks bl
                     JOIN bookformat bf ON bl.type_id = bf.id 
                     WHERE bf.id = 1 AND bl.book_id = ? AND bl.link LIKE '%.html.images'`,
                    [bookId],
                    async (err, htmlResults) => {
                        if (err) {
                            console.error('Error fetching book link:', err.message);
                            return res.status(500).json({ error: 'Failed to fetch book content' });
                        }
                        if (htmlResults.length === 0) {
                            return res.status(404).json({ error: 'Book not found' });
                        }
                        bookLink = htmlResults[0].link;
                        await fetchAndProcessBook(bookLink, res);
                    }
                );
                return;
            }
            
            await fetchAndProcessBook(bookLink, res);
        }
    );
};

async function fetchAndProcessBook(bookLink, res) {
    try {
        // Fetch the book content from Gutenberg
        const response = await axios.get(bookLink);
        let modifiedContent = response.data;

        // Get the base path from the original bookLink
        const basePath = bookLink.substring(0, bookLink.lastIndexOf('/') + 1);

        // Replace image src
        modifiedContent = modifiedContent.replace(/src="([^"]+\.(jpg|jpeg|png|gif|bmp|svg|webp))"/gi, (match, p1) => {
            const fullImageUrl = basePath + p1;
            return `src="https://ebms.up.railway.app/booklinks/proxy?url=${encodeURIComponent(fullImageUrl)}"`;
        });

        // Replace other href (like CSS)
        modifiedContent = modifiedContent.replace(/href="([^"]+)"/gi, (match, p1) => {
            if (p1.endsWith('.css') || p1.endsWith('.js')) {
                const fullAssetUrl = basePath + p1;
                return `href="https://ebms.up.railway.app/booklinks/proxy?url=${encodeURIComponent(fullAssetUrl)}"`;
            }
            return match;
        });

        res.send(modifiedContent);
    } catch (fetchError) {
        console.error('Error fetching content from Gutenberg:', fetchError.message);
        res.status(500).json({ error: 'Failed to fetch book from external server' });
    }
}

// New function to just send proxy link
exports.getBookLinkOnly = (req, res) => {
    const { bookId } = req.params;
    const proxyLink = `https://ebms.up.railway.app/booklinks/links/${bookId}`;
    res.json({ link: proxyLink });
};

exports.getbookcover = (req, res) => {
    db.query(`SELECT bl.link, b.book_id FROM booklinks bl 
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
