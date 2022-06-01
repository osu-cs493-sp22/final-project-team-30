const GridFsStorage = require("multer-gridfs-storage");
const crypto = require("crypto")
const { ObjectId } = require("mongodb");
const { getDBReference } = require("./mongo");

exports.initializeMulter = () => {
  const storage = new GridFsStorage({
    db: getDBReference(),
    file: (req, file) => {
        console.log(file.mimetype)
        if (file.mimetype in fileTypes){
            return {
                filename:
                `${crypto.pseudoRandomBytes(16).toString("hex")}` +
                `.${fileTypes[file.mimetype]}`,
                metadata: {
                  assignmentId: new ObjectId(req.params.assignmentId),
                  studentId: new ObjectId(req.body.studentId),
                },
                bucketName: 'submissions'
            };
        } else {
            return null;
        }
    },
  });
  const multer = require("multer");

  const fileTypes = {
    "application/pdf": "pdf",
    "image/png": "png",
    "image/jpeg": "jpg",
  };

  
  const upload = multer({
    storage,
    fileFilter: (req, file, callback) => {
      callback(null, !!fileTypes[file.mimetype]);
    },
  });

  return upload;
}
