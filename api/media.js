const router = require('express').Router()

const { getSubmissionDownloadStreamById } = require('../models/submission')

exports.router = router

router.get('/submission/:filename', async function (req, res, next) {
    // get id from filename
    const id = (req.params.filename).split('.')[0]
    getSubmissionDownloadStreamById(id)
        .on('file', function (file) {
        res.status(200).type(file.metadata.mimetype)
        })
        .on('error', function (err) {
        if (err.code === 'ENOENT') {
            next()
        } else {
            next(err)
        }
        })
        .pipe(res)
})
