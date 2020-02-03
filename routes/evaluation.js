let express = require('express');
var exec = require('child_process').exec, child;
// https://stackoverflow.com/questions/1880198/how-to-execute-shell-command-in-javascript
const multer = require('multer');
const uuid = require('uuid');


let router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploaded')
    },
    filename: (req, file, cb) => {
        cb(null, uuid.v4() + file.originalname)
    }
})
const upload = multer({ storage: storage });


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


// WEB_UI EDITION = RUNNING ONLY (UPLOAD AND REDIRECTION REQUIRED!)
router.get('/21styles', (req, res, next) => {
    const { option, filename } = req.query;
    console.log({filename, option});

    exec("python main.py eval --content-image images/content/" + filename + " --style-image images/21styles/" + option + ".jpg --model models/21styles.model --content-size 512 --cuda 0", {cwd: 'experiments/'}, (error, stdout, stderr) => {
        if (!error) {
            res.json({ "msg": stdout });
            console.log(1111);
        } else {
            res.json({ "msg": stderr });
            console.log(filename, option);
        }
    });
});

// SWAGGER EDITION = UPLOAD + RUNNING
const FileMoveError = new Error('file move error');
router.post('/21styles', upload.array('files', 1), (req, res, next) => {
    const { files } = req;
    const { option } = req.query;
    if (!files) {
        // FIXME: FILE UPLOAD ERROR!!!!!!!!!!!!
        res.status(400);
        res.json({"status": "file upload error"});
    } else {
        const filename = files[0].filename;
        console.log({filename, option});
        move_file_to_right_location(filename, option)
        .catch(() => {
            throw FileMoveError;
        })
        .then(() => {
            return new Promise((resolve, reject) => {
                exec("python main.py eval --content-image images/content/" + filename + " --style-image images/21styles/" + option + ".jpg --model models/21styles.model --content-size 256 --cuda 0", {cwd: 'experiments/'}, (error, stdout, stderr) => {
                    console.log({error});
                    console.log({stdout});
                    console.log({stderr});
                    if (!error) {
                        resolve();
                    } else {
                        reject(MLTestError);
                    }
                });
            });
        })
        /*
        .then(() => {
            return new Promise((resolve) => {
                exec("ls -al", {cwd: "experiments/"}, (error, stdout, stderr) => {
                    console.log({error});
                    console.log({stdout});
                    console.log({stderr});
                    resolve();
                });
            });
        })
        */
        .then(() => {
            const real_file_location = `experiments/output.jpg`;
            res.download(real_file_location);
        })
        .catch((err) => {
            res.status(500);
            if (err === FileMoveError) {
                res.json({"status": "file move error"});
            } else if (err === MLTestError) {
                res.json({"status": "ml test error"});
            } else {
                res.json({"status": "unknown error"});
            }
        })
    }

});

module.exports = router;