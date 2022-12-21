const { getConnection } = require('../config/database');

class OptimizeRepository {
    findAllComponents = async function () {
        const client = await getConnection()
        const data = await client.query(
            `SELECT * FROM components`);
        client.release();
        return data.rows
    }
}
module.exports = OptimizeRepository;