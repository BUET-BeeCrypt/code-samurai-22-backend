const { getConnection } = require('../config/database');

class ProjectRepository {
    findAll = async function () {
        const client = await getConnection()
        const data = await client.query(
            `SELECT projects.*, agencies.name as agency FROM projects
            join agencies on(projects."exec" = agencies.code);`);
        client.release();
        return data.rows 
    }

    insert = async function (data) {
        const client = await getConnection()
        const res = await client.query(
            `SELECT projects.*, agencies.name as agency FROM projects
            join agencies on(projects."exec" = agencies.code);`);
        client.release();
    }

    update = async function (data) {
        const client = await getConnection()
        const res = await client.query(`SELECT projects.*, agencies.name as agency FROM projects
join agencies on(projects."exec" = agencies.code);`);
        client.release();
    }

    delete = async function (data) {
        const client = await getConnection()
        const res = await client.query(`SELECT projects.*, agencies.name as agency FROM projects
join agencies on(projects."exec" = agencies.code);`);
        client.release();
    }
}
module.exports = ProjectRepository;