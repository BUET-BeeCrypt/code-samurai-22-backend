const { getConnection } = require('../config/database');

class ProjectRepository {
    findAll = async function (autoCommit = true) {
        const client = await getConnection()
        const data = await client.query(`SELECT projects.*, agencies.name as agency FROM projects
join agencies on(projects."exec" = agencies.code);`);
        client.release();
        return data.rows
    }
}
module.exports = ProjectRepository;