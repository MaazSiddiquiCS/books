// models/downloadModel.js
const db = require('../db/connection');

class Download {
  static async createDownloadRecord(user_id, book_id) {
    const [result] = await db.query(
      `INSERT INTO downloads (user_id, book_id, downloaded_at) 
       VALUES (?, ?, NOW())`,
      [user_id, book_id]
    );
    return result.insertId;
  }

  static async getDownloadHistory(user_id, book_id = null) {
    let query = `SELECT * FROM downloads WHERE user_id = ?`;
    const params = [user_id];
    
    if (book_id) {
      query += ` AND book_id = ?`;
      params.push(book_id);
    }
    
    query += ` ORDER BY downloaded_at DESC`;
    
    const [rows] = await db.query(query, params);
    return rows;
  }

  static async getMostDownloadedBooks(limit = 10) {
    const [rows] = await db.query(
      `SELECT book_id, COUNT(*) as download_count 
       FROM downloads 
       GROUP BY book_id 
       ORDER BY download_count DESC 
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
}

module.exports = Download;