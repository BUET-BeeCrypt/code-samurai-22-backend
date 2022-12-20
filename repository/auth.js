const { getConnection } = require('../config/database');

class AuthRepository {
    register = async function (username, password, role) {
        console.log("AuthRepository.register");
        const client = await getConnection();
        try {
            var res = await client.query('SELECT * FROM users WHERE username = $1', [username]);

            // user already exists
            if (res.rows.length > 0) {
                client.release();
                return { success: false, code: 409, message: "Username already taken." }
            }

            res = await client.query(
                'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
                [username, password, role]
            );

            if (res.rowCount == 0) {
                client.release();
                return { success: false, code: 500, message: "Internal server error." }
            }
            client.release();
            return { success: true, code: 201, message: "User created." }
        } catch (err) {
            console.log(err);
            client.release();
            return { success: false, code: 500, message: "Internal server error." }
        }
    }

    login = async function (username, password, role) {
        console.log("AuthRepository.login");
    }

    getUser = async function (username) {
        console.log("AuthRepository.register");
        const client = await getConnection();
        try {
            var res = await client.query(
                'SELECT * FROM users WHERE username = $1',
                [username]);
            client.release();
            // console.table(res.rows);
            if(res.rows.length == 0){
                return { success: false, code: 404, message: "User not found." }
            }
            return {success: true, code: 200, message: "User found.", data: res.rows[0]}
            
        }catch(err){
            console.log(err);
            client.release();
            return { success: false, code: 500, message: "Internal server error." }
        }
    }

    updateUserRole = async function (username, role) {
        console.log("AuthRepository.register");
        const client = await getConnection();
        try{
            const res = await client.query(
                'UPDATE users SET role = $1 WHERE username = $2',
                [role, username]
            );
            client.release();
            if(res.rowCount == 0){
                return { success: false, code: 404, message: "User not found." }
            }
            return {success: true, code: 200, message: `User role updated to ${role}.`}
        }
        catch (err) {
            console.log(err.message);
            // check if err.message contains "violates foreign key constraint"
            // as substring
            if(err.message.includes("violates foreign key constraint")){
                return { success: false, code: 404, message: `Role ${role} not found.` }
            }
            client.release();
            return { success: false, code: 500, message: "Internal server error." }
        }
    }

}
module.exports = AuthRepository