function OnUpdate(doc,meta) {
    while(true) {
        try {
            if (doc === null) {
                return;
            }
            const build = doc['build'];
            const name = doc['name'];
            let [docToInsert, docToInsertMeta, newDoc] = getBuildDocument(build, name);
            if (newDoc) {
                docToInsert['displayName'] = doc['displayName'];
                docToInsert['component'] = doc['component'];
                docToInsert['os'] = doc['os'];
                if (doc.hasOwnProperty("runParams")) {
                    docToInsert['runParams'] = doc["runParams"];
                }
                if (doc["variants"] !== undefined) {
                    docToInsert["variants"] = doc["variants"]
                }
            }
            let jobToStore = {
                "url" : doc['url'],
                "buildId" : doc['build_id'],
                "result" : doc['result'],
                "totalCount" : doc['totalCount'],
                "failCount" : doc['failCount'],
                "passCount" : doc['totalCount'] - doc['failCount'],
                "duration" : doc['duration'],
                "runDate" : doc['timestamp'],
                "bestRun" : false,
                "deleted" : false
            }
            docToInsert['jobs'].push(jobToStore)
            // Sort all builds based on buildId and remove any duplicates
            docToInsert['jobs'] = docToInsert['jobs'].sort(function (a, b) {
                return b['buildId'] - a['buildId'];
            }).filter(function(item, pos, array) {
                return !pos || item['buildId'] !== array[[pos - 1]['buildId']];
            });
            // Get the best run out of all the jobs and mark it as bestRun
            docToInsert['jobs'] = docToInsert['jobs'].sort(function (a, b) {
                return b['passCount'] - a['passCount'];
            });
            docToInsert['jobs'][0]['bestRun'] = true;
            // Set rest of the jobs bestRun as false
            for(let i = 1; i < docToInsert['jobs'].length; i++) {
                docToInsert['jobs'][i]['bestRun'] = false;
            }
            // Sort based on buildId
            docToInsert['jobs'] = docToInsert['jobs'].sort(function (a, b) {
                return b['buildId'] - a['buildId'];
            });
            let bestRun = 0;
            for(let i = 0; i < docToInsert['jobs'].length; i++) {
                if(docToInsert['jobs'][i]['bestRun']) {
                    bestRun = i;
                    break;
                }
            }
            docToInsert['jobs']['bestRun'] = bestRun;
            const bestJob = docToInsert['jobs'][bestRun];
            docToInsert['totalCount'] = bestJob['totalCount'];
            docToInsert['failCount'] = bestJob['failCount'];
            docToInsert['passCount'] = bestJob['passCount'];
            docToInsert['jobCount'] = docToInsert['jobs'].length;
            docToInsert['result'] = bestJob['result'];
            docToInsert['runDate']  = bestJob['runDate'];
            docToInsert['bestRun'] = bestRun;
            let duration = 0;
            for(let job of docToInsert['jobs']) {
                duration += job['duration'];
            }
            docToInsert['duration'] = duration;
            if(!replaceOrInsert(builds, docToInsertMeta, docToInsert)) {
                continue;
            }
            log("Inserted into :", docToInsertMeta.id);
            break;
        } catch (e) {
            log("exception1: ", e);
            break;
        }
    }
    /*while(true) {
        try {
            if (!storeBuildInComponentDoc(doc)) {
                continue;
            }
            break;
        } catch (e) {
            log("exception2: ", e);
            break;
        }
    }*/
    while(true) {
        try {
            if (!storeVersionTotal(doc)) {
                continue;
            }
            break;
        } catch (e) {
            log("exception3: ", e);
            break;
        }
    }
    while(true) {
        try {
            if (!storeAllBuildsForComponentDoc(doc)) {
                continue;
            }
            break;
        } catch (e){
            log("exception4: ", e);
            break;
        }
    }
    while (true) {
        try {
            if(!storeVersionComponents(doc)){
                continue;
            }
            break;
        } catch (e) {
            log("Exception in storeVersionComponents: ", e);
            break;
        }
    }
}


function storeVersionTotal(doc) {
    const build = doc['build'];
    const os = doc['os'];
    const version = build.split("-")[0];
    let totalTotalCount = 0;
    let totalFailCount = 0;
    let totalPassCount = 0;
    let totalDuration = 0;
    let totalJobCount = 0;
    let osTotalCount = 0;
    let osFailCount = 0;
    let osPassCount = 0;
    let osDuration = 0;
    let osJobCount = 0;
    let queryResult1 = SELECT SUM(totalCount) AS totalCount,
        SUM(failCount) AS failCount, SUM(passCount) AS passCount,
        SUM(duration) AS duration, SUM(jobCount) as jobCount
    FROM `greenboard`.`server`.`builds`
    WHERE `build` = $build AND os = $os;
    for (let result of queryResult1) {
        osTotalCount = result.totalCount;
        osFailCount = result.failCount;
        osPassCount = result.passCount;
        osDuration = result.duration;
        osJobCount = result.jobCount;
    }
    queryResult1.close();
    let queryResult2 = SELECT SUM(totalCount) AS totalCount,
        SUM(failCount) AS failCount, SUM(passCount) AS passCount,
        SUM(duration) AS duration, SUM(jobCount) as jobCount
    FROM `greenboard`.`server`.`builds`
    WHERE `build` = $build;
    for (let result of queryResult2) {
        totalTotalCount = result.totalCount;
        totalFailCount = result.failCount;
        totalPassCount = result.passCount;
        totalDuration = result.duration;
        totalJobCount = result.jobCount;
    }
    queryResult2.close();
    let [versionTotalDoc, versionTotalDocMeta] = getVersionTotalDocument(version);
    if(!versionTotalDoc['builds'].hasOwnProperty(build)) {
        versionTotalDoc['builds'][build] = { "os" : {}}
    }
    if(!versionTotalDoc['builds'][build]["os"].hasOwnProperty(os)) {
        versionTotalDoc['builds'][build]["os"][os] = {};
    }
    let docChanged = false;
    if (versionTotalDoc['builds'][build]['totalCount'] !== totalTotalCount) {
        versionTotalDoc['builds'][build]['totalCount'] = totalTotalCount;
        docChanged = true;
    }
    if (versionTotalDoc['builds'][build]['failCount'] !== totalFailCount) {
        versionTotalDoc['builds'][build]['failCount'] = totalFailCount;
        docChanged = true;
    }
    if (versionTotalDoc['builds'][build]['passCount'] !== totalPassCount) {
        versionTotalDoc['builds'][build]['passCount'] = totalPassCount;
        docChanged = true;
    }
    if (versionTotalDoc['builds'][build]['duration'] !== totalDuration) {
        versionTotalDoc['builds'][build]['duration'] = totalDuration;
        docChanged = true;
    }
    if (versionTotalDoc['builds'][build]['jobCount'] !== totalJobCount) {
        versionTotalDoc['builds'][build]['jobCount'] = totalJobCount;
        docChanged = true;
    }
    if (versionTotalDoc['builds'][build]["os"][os]['totalCount'] !== osTotalCount) {
        versionTotalDoc['builds'][build]["os"][os]['totalCount'] = osTotalCount;
        docChanged = true;
    }
    if (versionTotalDoc['builds'][build]["os"][os]['failCount'] !== osFailCount) {
        versionTotalDoc['builds'][build]["os"][os]['failCount'] = osFailCount;
        docChanged = true;
    }
    if (versionTotalDoc['builds'][build]["os"][os]['passCount'] !== osPassCount) {
        versionTotalDoc['builds'][build]["os"][os]['passCount'] = osPassCount;
        docChanged = true;
    }
    if (versionTotalDoc['builds'][build]["os"][os]['duration'] !== osDuration) {
        versionTotalDoc['builds'][build]["os"][os]['duration'] = osDuration;
        docChanged = true;
    }
    if (versionTotalDoc['builds'][build]["os"][os]['jobCount'] !== osJobCount) {
        versionTotalDoc['builds'][build]["os"][os]['jobCount'] = osJobCount;
        docChanged = true;
    }
    if (docChanged && !replaceOrInsert(versions, versionTotalDocMeta, versionTotalDoc)) {
        return false;
    }
    log("Inserted into : ", versionTotalDocMeta.id);
    return true;
}

function storeAllBuildsForComponentDoc(doc){
    const build = doc['build'];
    const jobName = doc['name'];
    const displayName = doc['displayName'];
    let variants = {};
    if (doc["variants"] !== undefined) {
        variants = doc["variants"];
    }
    const os = doc['os'];
    const comp = doc['component'];
    const version = build.split("-")[0];
    let [docToStore, docToStoreMeta, newDoc] = getComponentAllDocument(comp, os, version);
    let docChanged = false;
    let storeVariant = false;
    let totalCount = 0;
    if (!docToStore["jobs"].hasOwnProperty(jobName)) {
        docToStore["jobs"][jobName] = {
            "name" : jobName,
            "displayName": displayName,
            "totalCount" : doc['totalCount'],
            "lastRun" : doc['url'],
            "buildId" : doc['build_id'],
            "variants" : variants
        };
        docChanged = true;
        storeVariant = true;
        totalCount = doc['totalCount'];
    } else {
        if (docToStore["jobs"][jobName]["totalCount"] < doc['totalCount']) {
            totalCount = doc['totalCount'] - docToStore["jobs"][jobName]["totalCount"];
            docToStore["jobs"][jobName]["totalCount"] = doc['totalCount'];
            docChanged = true;
            storeVariant = true;
        }
        if (docToStore["jobs"][jobName]["buildId"] < doc['build_id']) {
            docToStore["jobs"][jobName]["buildId"] = doc['build_id'];
            docChanged = true;
        }
    }
    if (storeVariant === true && totalCount !== 0 && doc["variants"] !== undefined) {
        let variantStored = storeVariantsDetailsForVersion(variants, totalCount, version);
        if (!variantStored) {
            // Return since variants weren't stored
            return variantStored;
        }
    }
    if (docChanged) {
        return replaceOrInsert(versionComponents, docToStoreMeta, docToStore);
    }
    log("Inserted into: ", docToStoreMeta.id);
    return true;
}

function storeVariantsDetailsForVersion(variants, totalCount, version) {
    for (const variant in variants) {
        const variantValue = variants[variant];
        let [docToStore, docToStoreMeta, newDoc] = getVariantAllDocument(variant, variantValue, version);
        docToStore['totalCount'] += totalCount;
        let docStored = replaceOrInsert(versionVariants, docToStoreMeta, docToStore);
        if (!docStored) {
            // Return false only if replace was unsuccessful
            // since there might be other variants to calculate yet.
            return docToStore;
        }
    }
    return true;
}

function storeVersionComponents(doc) {
    const version = doc['build'].split('-')[0];
    const platform = doc['os'];
    const feature = doc['component'];
    const variants = doc['variants'];
    let [docToStore, docToStoreMeta, newDoc] = getVersionComponentsDocument(version);
    let docChanged = false;
    if (!docToStore['platforms'].includes(platform)) {
        docToStore['platforms'].push(platform);
        docToStore['platforms'].sort();
        docChanged = true;
    }
    if (!docToStore['features'].includes(feature)) {
        docToStore['features'].push(feature);
        docToStore['features'].sort();
        docChanged = true;
    }
    for (const variant in variants) {
        if(!docToStore['variants'].hasOwnProperty(variant)) {
            docToStore['variants'][variant] = [];
        }
        let variantToStore = docToStore['variants'][variant];
        if(!variantToStore.includes(variants[variant])) {
            docToStore['variants'][variant].push(variants[variant]);
            docToStore['variants'][variant].sort();
            docChanged = true;
        }
    }
    if(docChanged) {
        return replaceOrInsert(versionComponents, docToStoreMeta, docToStore);
    }
    return true;
}

function replaceOrInsert(binding, meta, doc) {
    if (meta.cas !== undefined) {
        const res = couchbase.replace(binding, meta, doc);
        return res.success;
    } else {
        const res = couchbase.insert(binding, meta, doc);
        return res.success;
    }
}

function getBuildDocument(buildVersion, name) {
    const docId = name + "_" + buildVersion;
    const res = couchbase.get(builds, {"id": docId});
    if (res.success) {
        return [res.doc, res.meta, false];
    } else {
        const newBuildToStore = {
            "build": buildVersion,
            "name": name,
            "displayName": "",
            "component": "",
            "os": "",
            "totalCount": 0,
            "failCount": 0,
            "passCount": 0,
            "jobCount": 0,
            "result": "",
            "duration": 0,
            "runDate": 0,
            "runParams": "",
            "bestRun": 0,
            "jobs": []
        };
        return [newBuildToStore, {"id": docId}, true];
    }
}

function getVersionTotalDocument(version) {
    const res = couchbase.get(versions, { "id": version });
    if (res.success) {
        return [res.doc, res.meta];
    } else {
        const newVersionDocument = {
            "version" : version,
            "builds" : {}
        }
        return [newVersionDocument, { "id": version }];
    }
}

function getComponentAllDocument(comp, os, version) {
    const docId = comp + "_" + os + "_" + version;
    const res = couchbase.get(versionComponents, { "id": docId });
    if (res.success) {
        return [res.doc, res.meta, false];
    } else {
        const newComponentToStore = {
            "name": comp,
            "os": os,
            "version": version,
            "jobs" : {}
        };
        return [newComponentToStore, { "id": docId }, true];
    }
}

function getVariantAllDocument(variant, variantValue, version) {
    const docId = variant + "_" + variantValue + "_" + version;
    const res = couchbase.get(versionVariants, {"id": docId});
    if (res.success) {
        return [res.doc, res.meta, false];
    }
    const newVariantAllDoc = {
        "variant": variant,
        "value": variantValue,
        'version': version,
        'totalCount': 0,
    }
    return [newVariantAllDoc, { "id": docId }, true];
}

function getVersionComponentsDocument(version) {
    const docId = version;
    const res = couchbase.get(versionComponents, {"id": docId});
    if (res.success) {
        return [res.doc, res.meta, false];
    }
    const newVersionComponentsDoc = {
        "version" : version,
        "features": [],
        "platforms" : [],
        "variants" : {}
    }
    return [newVersionComponentsDoc, { "id": docId }, true];
}
