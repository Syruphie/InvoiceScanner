const sql = require("mssql");

const pool = sql.connect(process.env.AZURE_SQL_CONNECTION_STRING).then(async (pool) => {
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='invoices' AND xtype='U')
    CREATE TABLE invoices (
      id INT IDENTITY PRIMARY KEY,
      vendor NVARCHAR(255),
      invoice_no NVARCHAR(100),
      date NVARCHAR(50),
      due_date NVARCHAR(50),
      subtotal NVARCHAR(50),
      tax NVARCHAR(50),
      total NVARCHAR(50),
      confidence INT,
      blob_url NVARCHAR(1000),
      scanned_at DATETIME DEFAULT GETDATE()
    )
  `);
  return pool;
});

module.exports = { pool, sql };
