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

    addProject = async function (
        project_id, name, location, latitude, longitude,
        exec, cost, timespan, goal, start_date,
        completion, actual_cost
    ) {
        console.log("ProjectRepository.addProject")
        const client = await getConnection();
        try{
            const res = await client.query(
                `INSERT INTO projects (project_id, name, location, latitude, longitude,
            exec, cost, timespan, goal, start_date,
            completion, actual_cost) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [project_id, name, location, latitude, longitude,
                    exec, cost, timespan, goal, start_date,
                    completion, actual_cost]
            );
            client.release();
            // check if project was added
            if (res.rowCount == 0) {
                return {
                    success: false,
                    code: 500,
                    message: "Failed to add project."
                }
            }

            return {
                success: true,
                code: 201,
                message: "Project added successfully."
            }
        }catch(err){
            console.log(err);
            client.release();
            return {
                success: false,
                code: 500,
                message: "Internal server error."
            }
        }
        
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

    // project_id, // unique id of the project, prop<id>
    // name, // title of the project
    // location,latitue,longitude,
    // timespan, // Timespan of the project in years
    // goal, // objective of the project
    // proposal_date, // when was the project proposed
    // exec, // executing agency
    // cost // projeced cost in cores
    addProposal = async function (
        project_id, name, location,
        latitude, longitude, timespan, goal,
        proposal_date, exec, cost) {
        const client = await getConnection()
        try {
            const data = await client.query(
                `INSERT INTO proposals 
                (project_id, name, location, latitude, 
                longitude, timespan, goal, proposal_date,
                exec, cost) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [project_id, name, location, latitude, longitude, timespan, goal, proposal_date, exec, cost]
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
                message: "Proposal added."
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

    //get proposal by project_id
    getProposal = async function (project_id) {
        const client = await getConnection()
        try {
            const data = await client.query(
                `SELECT * FROM proposals WHERE project_id = $1`,
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
                message: `Proposal found.`,
                data: data.rows[0]
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

    // get all the proposals from "proposals" table
    getAllProposals = async function () {
        console.log("ProjectRepository.getAllProposals")
        const client = await getConnection()
        try {
            const data = await client.query(
                `SELECT * FROM proposals`
            );
            client.release();
            if (data.rowCount == 0) {
                return {
                    success: false,
                    code: 404,
                    message: "No proposal found."
                }
            }
            return {
                success: true,
                code: 200,
                message: `Total ${data.rowCount} proposals found.`,
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