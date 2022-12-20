// auth routes doc
// /**
//  * @swagger
//  * /api/auth/register:
//  *   post:
//  *     summary: Register a new user
//  *     tags: Users
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               username:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: User created
//  *       409:
//  *         description: Username already taken
//  *       500:
//  *         description: Internal server error
//  */


// login
// /**
//  * @swagger
//  * /api/auth/login:
//  *   post:
//  *     summary: Login a user
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               username:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: User logged in
//  *       401:
//  *         description: Invalid credentials
//  *       500:
//  *         description: Internal server error
//  */


// update user role
// /**
//  * @swagger
//  * /api/auth/updateRole:
//  *   post:
//  *     summary: Update user role(admin only)
//  *     tags: [Auth]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               username:
//  *                 type: string
//  *               role:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: User role updated
//  *       401:
//  *         description: Unauthorized
//  *       404:
//  *         description: User not found
//  *       500:
//  *         description: Internal server error
//  */


