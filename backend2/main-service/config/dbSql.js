import mysql from 'mysql2/promise';
import colors from 'colors'; // Make sure colors is available or remove .colors logging

const connectSQL = async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'agriwebdb',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    const connection = await pool.getConnection();
    console.log(`MainService: MySQL Connected: ${connection.config.host}`.cyan.underline.bold);
    connection.release();
    
    global.pool = pool; // Still making it global if your app relies on this
    return pool;
  } catch (error) {
    console.error(`MainService: Error connecting to MySQL: ${error.message}`.red.bold);
    process.exit(1);
  }
};

export default connectSQL;