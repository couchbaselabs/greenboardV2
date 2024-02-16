const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const versionRoutes = require("./routes/versionsRoutes");
const componentsRoutes = require("./routes/componentsRoutes");
const buildRoutes = require("./routes/buildsRoutes");
const pipelineRoutes = require("./routes/pipelineRoutes");

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
        app.listen(process.env["GREENBOARD_PORT"], () => console.log("Greenboard server started on " +
            "http://localhost:" + process.env["GREENBOARD_PORT"]));
    } catch (error) {
        console.log(error);
    }
}

startServer()