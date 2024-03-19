const db = require("../couchbase/connect")

const queryDB = async (scope, query, params) => {
    try {
        console.log(`query: ${query}; params: ${params}`);
        const bucket = await db.greenboardBucket;
        const result = await bucket.scope(scope).query(query, {
            parameters: params
        });
        return result;
    } catch (e) {
        throw e;
    }
}

const getFromDB = async (scope, collection, id) => {
    try{
        const coll = await db.selectCollection(scope, collection);
        const result = await coll.get(id);
        return result;
    } catch (e) {
        throw e;
    }
}

const upsertToDB = async (scope, collection, id, doc) => {
    try {
        const coll = await db.selectCollection(scope, collection);
        const result = await coll.upsert(id, doc);
        return result;
    } catch (e) {
        throw e;
    }
}

module.exports = {
    queryDB,
    getFromDB,
    upsertToDB
};