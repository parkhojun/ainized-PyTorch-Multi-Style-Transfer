const express = require('express');
const multer = require('multer');
const uuid = require('uuid');
const exec = require('child_process').exec;

const rootDir = "./";

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploaded')
    },
    filename: (req, file, cb) => {
        // cb(null, file.originalname)
        cb(null, uuid.v4() + file.originalname)
    }
})

const upload = multer({ storage: storage });

router.post('/', upload.array('files', 100), (req, res) => {
    const { files } = req;
    const { option } = req.query;
    const filename = files[0].filename;
    console.log({filename, option});
    if (!files) {
        res.json({ "status": false});
    } else {
        move_file_to_right_location(filename, option)
            .then(() => {
                res.json({ "status": true, "filename": filename  });
            })
            .catch(() => {
                res.json({ "status": false});
            })
    }
});

function move_file_to_right_location(filename, option) {
    
    var final_location = "experiments/images/content/";

    console.log(final_location);
    const final_command = "mv ./uploaded/" + filename + " " + final_location;
    console.log(final_command);
    return new Promise((resolve, reject) => {
        exec(final_command, (error, stdout, stderr) => {
            console.log({stdout, stderr});
            if (!error) {
                resolve({stdout, stderr});
            } else {
                reject({error, stderr});
            }
        });
    });
};

module.exports = router;