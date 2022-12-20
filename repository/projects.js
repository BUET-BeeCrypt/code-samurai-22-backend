const { getConnection } = require('../config/database');

class ProjectRepository {
    findAll = async function () {
        const client = await getConnection()
        const data = await client.query(
            `SELECT p.*, agencies.name as agency,
(SELECT cast(coalesce(avg(rating), 0) as integer) from ratings where ratings.project_id = p.project_id) as rating,
(SELECT cast(coalesce(count(username), 0) as integer) from ratings where ratings.project_id = p.project_id) as total_rating
FROM projects p
join agencies on(p."exec" = agencies.code)`);
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

    addRating = async function (username, project_id, rating) {
        const client = await getConnection()
        try {
            const data = await client.query(
                `INSERT INTO ratings (username, project_id, rating) 
                VALUES ($1, $2, $3) ON CONFLICT
                ON CONSTRAINT ratings_pk
                DO UPDATE SET rating = $3`,
                [username, project_id, rating]
            );
            client.release();
            if (data.rowCount == 0) {
                return {
                    success: false,
                    code: 500,
                    message: "Internal server error."
                }
            }
            return {
                success: true,
                code: 201,
                message: "Rating added."
            }
        } catch (err) {
            console.log(err);
            client.release();
            return {
                success: false,
                code: 500,
                message: "Internal server error."
            }
        }
    }

    // insert comments in comments table
    addComment = async function (username, project_id, comment) {
        const client = await getConnection()
        try {
            const data = await client.query(
                `INSERT INTO comments (username, project_id, comment, time_stamp) 
                VALUES ($1, $2, $3, current_timestamp)`,
                [username, project_id, comment]
            );
            client.release();
            if (data.rowCount == 0) {
                return {
                    success: false,
                    code: 500,
                    message: "Internal server error."
                }
            }
            return {
                success: true,
                code: 201,
                message: "Comment added."
            }
        } catch (err) {
            console.log(err);
            client.release();
            return {
                success: false,
                code: 500,
                message: "Internal server error."
            }
        }
    }

    // get all the comments from "comments" table
    getComments = async function (project_id) {
        console.log("ProjectRepository.getComments: " + project_id);
        const client = await getConnection()
        try {
            const data = await client.query(
                `SELECT * FROM comments WHERE project_id = $1`,
                [project_id]
            );
            client.release();
            if (data.rowCount == 0) {
                return {
                    success: false,
                    code: 500,
                    message: "Internal server error."
                }
            }
            return {
                success: true,
                code: 200,
                message: `Total ${data.rowCount} comments found.`,
                data: data.rows
            }
        }
        catch (err) {
            console.log(err);
            client.release();
            return {
                success: false,
                code: 500,
                message: "Internal server error."
            }
        }
    }
}
module.exports = ProjectRepository;