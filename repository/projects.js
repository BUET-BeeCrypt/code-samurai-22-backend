const {getConnection} = require('../config/database');

class ProjectRepository{
    findAll = async function (autoCommit = true){
        const client = await getConnection()
        const data = await client.query('SELECT * FROM projects');
        client.release();
        return data.rows
    }
}
module.exports = ProjectRepository;