const db = require('./db');
const utils = require('./utils');

var _addFile = async function (req, res) {

    var msg = "";
    var dccnUsername = "";
    var filesizeBytes = 0;
    var err;
    var dirname;
    var file;
    var filename;
    var insertUploadFileResult;

    // Check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        msg = 'Missing Authorization Header'
        console.log(msg);
        return res.status(401).json({ "error": msg });
    }

    // Verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    dccnUsername = credentials.split(':')[0];

    // Check for structure
    if (!req.body) {
        msg = `No attributes were uploaded: "req.body" is empty`
        return res.status(400).json({ "error": msg });
    }
    var uploadSessionId = req.body.uploadSessionId;
    var projectNumber = req.body.projectNumber;
    var subjectLabel = req.body.subjectLabel;
    var sessionLabel = req.body.sessionLabel;
    var dataType = req.body.dataType;

    if (!uploadSessionId) {
        msg = 'uploadSessionId empty';
        return res.status(500).json({ "error": msg });
    }
    if (!projectNumber) {
        msg = 'projectNumber empty';
        return res.status(500).json({ "error": msg });
    }
    if (!subjectLabel) {
        msg = 'subjectLabel empty';
        return res.status(500).json({ "error": msg });
    }
    if (!sessionLabel) {
        msg = 'sessionLabel empty';
        return res.status(500).json({ "error": msg });
    }
    if (!dataType) {
        msg = 'dataType empty';
        return res.status(500).json({ "error": msg });
    }

    // Obtain the target directory
    dirname = utils.getDirName(projectNumber, subjectLabel, sessionLabel, dataType);
    if (!dirname) {
        msg = 'Error obtaining directory name';
        console.error(msg);
        return res.status(500).json({ "error": msg });
    }

    // Check for uploaded files
    if (!req.files) {
        msg = `No files were uploaded: "req.files" is empty`;
        console.log(msg);
        return res.status(400).json({ "error": msg });
    }
    if (!req.files.files) {
        msg = `No files were uploaded: "req.files.files" is empty`;
        console.log(msg);
        return res.status(400).json({ "error": msg });
    }

    // Given the req.files.files, derive the number of uploaded files
    var num_files = utils.getNumFiles(req.files.files);
    if (num_files === 0) {
        msg = `No files were uploaded: file list is empty in request`;
        console.error(msg);
        return res.status(400).json({ "error": msg });
    }

    // Collection of file objects from the uploaded form data
    var files = [];
    if (num_files === 1) {
        files.push(req.files.files);
    } else {
        files = req.files.files;
    }

    // Allow single file upload only
    if (num_files > 1) {
        msg = `Only single file upload is supported`;
        console.error(msg);
        return res.status(400).json({ "error": msg });
    }
    file = files[0];
    filename = file.name;
    filesizeBytes = file.size;

    // Store the file in the buffer
    err = utils.storeFile(file, dirname);
    if (err) {
        console.error(err);
        return res.status(500).json({ "error": err });
    }

    // Add a row to the ui database
    try {
        insertUploadFileResult = await db.insertUploadFile(uploadSessionId, filename, filesizeBytes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ "error": error });
    }

    console.log(JSON.stringify(insertUploadFileResult));
    return res.status(200).json({ "data": insertUploadFileResult });
}

module.exports.addFile = _addFile;