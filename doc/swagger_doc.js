// swagger doc settings
const swaggerJsdoc = require('swagger-jsdoc')
// https://dev.to/kabartolo/how-to-document-an-express-api-with-swagger-ui-and-jsdoc-50do
const controllerDocs = [
    'auth.js'
]
const dbModelDocs = [
    './doc/component.js',
]
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Code samurai backend api',
            description: 'Automatically generated documentation'
        },
        servers: [{
            url: 'https://code-samurai-22-backend.onrender.com/',
            description: 'production server'
        }, {
            url: 'http://localhost:3000',
            description: 'Local development server'
        }],
        license: {
            name: 'Licensed Under MIT',
            url: 'https://spdx.org/licenses/MIT.html'
        },
        contact: {
            name: 'Hasan Masum',
            url: 'https://hmasum52.github.io',
        },
        tags: [
            {
                name: 'Users',
                description: 'Authentication Endpoints'
            },
            {
                name: 'Project',
                description: 'Project Endpoints'
            },
            {
                name: 'Comment',
                description: 'Comment Endpoints'
            },
            {
                name: 'Project Proposal',
                description: 'Project Proposal Endpoints'
            }
        ],
    },
    apis: [...controllerDocs, /* ...dbModelDocs */] // files containing annotations as above
}

const openapiSpecification = swaggerJsdoc(options)
module.exports = {
    openapiSpecification
}