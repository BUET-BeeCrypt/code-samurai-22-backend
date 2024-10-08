const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const morgan = require('morgan');
const router = require('./routes/routes.js');
const cors = require('cors');
const bodyParser = require("body-parser");



const port = process.env.PORT || 3000;
const app = express();
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/api", router);

// swagger js
const swaggerUi = require('swagger-ui-express')
const swaggerDoc = require('./doc/swagger_doc.js')
app.use('/api-docs',
    swaggerUi.serveFiles(swaggerDoc.openapiSpecification),
    swaggerUi.setup(swaggerDoc.openapiSpecification)
)

const server = app.listen(port, function () {
    console.log(`Server listening at PORT ${port}`);
})
//
// const io = new Server(server, {
//     cors: {
//         origin: '*',
//         methods: ["GET", "POST"]
//     }
// });