require('dotenv').config();
const sql = require('mssql/msnodesqlv8');

// Test with Driver 17
async function testConnection(driverVersion) {
    const cs = `Driver={ODBC Driver ${driverVersion} for SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_DATABASE};Trusted_Connection=yes;Encrypt=no;`;
    console.log(`\nTesting Driver ${driverVersion}...`);
    console.log('Connection string:', cs);

    try {
        const pool = new sql.ConnectionPool(cs);
        await pool.connect();
        console.log(`✅ Driver ${driverVersion} WORKS!`);
        await pool.close();
    } catch (err) {
        console.log(`❌ Driver ${driverVersion} failed:`, err.message);
    }
}

async function run() {
    await testConnection(17);
    await testConnection(18);

    // Also try with SQL Server (built-in driver)
    console.log('\nTesting built-in SQL Server driver...');
    const cs2 = `Driver={SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_DATABASE};Trusted_Connection=yes;`;
    try {
        const pool = new sql.ConnectionPool(cs2);
        await pool.connect();
        console.log('✅ Built-in SQL Server driver WORKS!');
        await pool.close();
    } catch (err) {
        console.log('❌ Built-in SQL Server driver failed:', err.message);
    }
}

run();