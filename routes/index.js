const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const { promiseFor720 } = require('./video720');
const { promiseFor480 } = require('./video480');
const { promiseFor360 } = require('./video360');
const { promiseFor240 } = require('./video240');
const { promiseFor144 } = require('./video144');
const { promiseForThumbnail } = require('./videoThumbnail');

/**
 * 720:ffmpeg -i input.mp4 -c:a copy -s hd720 output_720.mp4
 * 480:ffmpeg -i input.mp4 -c:a copy -s hd480 output_480.mp4
 * 360:ffmpeg -i input.mp4 -c:a copy -s 640x360 output_360.mp4
 * 240:ffmpeg -i input.mp4 -c:a copy -s 320x240 output_240.mp4
 * 144:ffmpeg -i input.mp4 -c:a copy -s 272*144 output_144.mp4
 * Thumbnail:ffmpeg -ss 00:00:15 -i video.mp4 -vf scale=800:-1 -vframes 1 image.jpg
 */
//216767
//152774.968ms
//128374.643ms
//61541.713ms - 480p
//59840.191ms - 480p
//70528.240ms - 480p + 144p
//31409.974ms - 144p
//33615.932ms - 240p
//31859.421ms - 144p
//104623.129ms - 480p + 144p + 240p
//7203.495ms - Thumbnail
//42447.967ms - 360p
//133040.430ms - 720p
//139607.034ms - 480p + 144p + 240p + 360p + Thumbnail
//135345.338ms - 480p + 144p + 240p + 360p + Thumbnail
/* GET home page. */
router.post('/', function(req, res, next) {

    let input_file_url = req.body.file_path;
    let bucket_name = req.body.bucket_name;
    let timestamp = Date.now();
    console.time("IN");
    console.time("thumbnail");
    console.time("480p");
    console.time("360p");
    console.time("240p");
    console.time("144p");
    Promise.all([
        //promiseFor720.video(timestamp, input_file_url, bucket_name),
        promiseFor480.video(timestamp, input_file_url, bucket_name),
        promiseFor360.video(timestamp, input_file_url, bucket_name),
        promiseFor240.video(timestamp, input_file_url, bucket_name),
        promiseFor144.video(timestamp, input_file_url, bucket_name),
        promiseForThumbnail.video(timestamp, input_file_url, bucket_name)
    ]).then((data) => {
        console.timeEnd("IN");
        res.sendStatus(200);
    }).catch((err) => {
        next(err);
    });

});





module.exports = router;