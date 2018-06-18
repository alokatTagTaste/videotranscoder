const { spawn } = require('child_process');
var AWS = require('aws-sdk');
var fs = require('fs');
var s3 = new AWS.S3({ accessKeyId: 'AKIAJ7TYQSJRNM3FDBVA', secretAccessKey: '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' });
let promiseForThumbnail = {
    video: (timestamp, input_file_url, bucket_name) => {

        let promiseForThumbnailObject = new Promise((resolve, reject) => {

            let childProcess = spawn('ffmpeg', [
                '-ss',
                "00:00:5",
                '-i',
                input_file_url,
                '-vf',
                'scale=-1:-1',
                '-vframes',
                '1',
                'image_' + timestamp + "_thumbnail.jpg"
            ], {
                cwd: __dirname
            });

            /**
             * The child process exit even listener
             */
            childProcess.on('exit', (code, signal) => {
                console.log("Child Process Exit", code);
                console.timeEnd('thumbnail');
                if (code == 0) {
                    if (code == 0) {
                        fs.readFile(__dirname + '/image_' + timestamp + "_thumbnail.jpg",
                            (err, data) => {
                                console.log("File", err, data);
                                if (err) {
                                    reject(new Error("Error occured during transcoding Thumbnailp which causes to process exit with code `${code}` due to ", err.message));
                                } else {
                                    console.log("is here..");
                                    s3.putObject({
                                        Bucket: bucket_name,
                                        Key: "videotranscoder/thumbnail/image_" + timestamp + "_thumbnail.jpg",
                                        Body: data,
                                        ContentType: "image/jpg"
                                    }, function(err, s3ObjectRes) {
                                        if (err) {
                                            reject(new Error("Error occured during transcoding Thumbnailp which causes to process exit with code `${code}` due to ", err.message));
                                        } else {
                                            fs.unlink(__dirname + '/image_' + timestamp + "_thumbnail.jpg", (err) => {
                                                if (err) {
                                                    reject(new Error("Error occured during transcoding Thumbnailp which causes to process exit with code `${code}` due to ", err.message));
                                                } else {
                                                    resolve("Done");
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                    } else {
                        reject(new Error("Error occured during transcoding Thumbnailp which causes to process exit with code `${code}` due to ", err.message));
                    }
                } else {
                    reject(new Error("Error occured during transcoding Thumbnailp which causes to process exit with code `${code}` due to ", err.message));
                }
            });

            /**
             * The child process close event listner 
             */
            childProcess.on('close', (code, signal) => {
                console.log("Child Process Close", code);

            });

            /**
             * The child process error even listener
             */
            childProcess.on('error', (code, signal) => {
                console.log("Child Process Error", code);
                reject(new Error("Error occured during transcoding Thumbnail which causes to process exit with code `${code}`"));
            });

            /**
             * The child process message handler even listener
             */
            childProcess.on('message', (code, signal) => {
                console.log("Child Process Message", code);
            });

            /**
             * IO Stream Error Event Listener
             */
            childProcess.stderr.on('data', (data) => {
                console.log("IO Stream Error", data);
            });

            /**
             * IO Stream Data Handler Event Listener
             */
            childProcess.stdout.on('data', (data) => {
                console.log("IO Stream Data", data);
            });

        });

        return promiseForThumbnailObject;

    }
}
module.exports = { promiseForThumbnail };