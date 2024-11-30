const db = require('./connection');

const testConnection = async () => {
    try {
        await db.query('SELECT 1');
        console.log('Database connection successful!');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};

testConnection();
