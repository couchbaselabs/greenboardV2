let couchbase = require("couchbase");
const dotenv = require("dotenv");

dotenv.config();

const host = process.env["COUCHBASE_HOST"];
const userName = process.env["COUCHBASE_USERNAME"];
const password = process.env["COUCHBASE_PASSWORD"];
const bucketName = process.env["GREENBOARD_BUCKET"];
let clusterObject;
async function connectDB() {
    if(clusterObject !== undefined) {
        console.log("From memory connectDB")
        return clusterObject.bucket(bucketName);
    }
    const cluster = await couchbase.connect(host, {
        username: userName,
        password: password,
        configProfile: 'wanDevelopment'
    });
    clusterObject = cluster;
    return cluster;
}
async function connectBucket(){
    if(clusterObject !== undefined) {
        console.log("From memory")
        return clusterObject.bucket(bucketName);
    }
    const cluster = await couchbase.connect(host, {
        username: userName,
        password: password,
        configProfile: 'wanDevelopment'
    });
    console.log("New connection")
    clusterObject = cluster
    return cluster.bucket(bucketName);
}
const cluster = connectDB();
const greenboardBucket = connectBucket();
const selectCollection = async (scope, collection) => {
    const bucket = await greenboardBucket;
    return bucket.scope(scope).collection(collection)
};

module.exports = {
    cluster,
    greenboardBucket,
    selectCollection
};