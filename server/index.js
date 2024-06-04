const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const versionRoutes = require("./routes/versionsRoutes");
const componentsRoutes = require("./routes/componentsRoutes");
const buildRoutes = require("./routes/buildsRoutes");
const pipelineRoutes = require("./routes/pipelineRoutes");
const https = require("https");
const fs = require("fs");
var gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(fs)

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({message : "Greenboard app"});
})
app.use(versionRoutes);
app.use(componentsRoutes);
app.use(buildRoutes);
app.use(pipelineRoutes);

const startServer = async () => {
    try {
        const httpsOptions = {
            cert: fs.readFileSync(process.env['SSL_CERTIFICATE']),
            key: fs.readFileSync(process.env['SSL_CERTIFICATE_KEY'])
        }
        https.createServer(httpsOptions, app).listen(process.env["GREENBOARD_PORT"], () =>
            console.log("Greenboard server started on https://localhost:" + process.env["GREENBOARD_PORT"]));
    } catch (error) {
        console.log(error);
    }
}

startServer()