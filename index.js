const fs = require('fs');
const xml2js = require('xml2js');
const { exec } = require('child_process');
const util = require('util');
const stream = require('stream');
const async = require('async');
const ffmpeg = require('fluent-ffmpeg');
const {getChapters, mergeChaptersOrdered} = require("./chapters");
const {processMergedChapters} = require("./process");
const {convertAndAddChapters} = require("./convert");


const order = [
    "EOS CH1", "EOS CH2", "EOS CH3", "EOS CH4", "EOS CH5",
    "TOD CH1",
    "EOS CH6", "EOS CH7", "EOS CH8",
    "TOD CH2", "TOD CH3",
    "EOS CH9", "EOS CH10",
    "TOD CH4", "TOD CH5", "TOD CH6",
    "EOS CH11",
    "TOD CH7",
    "EOS CH12", "EOS CH13",
    "TOD CH8", "TOD CH9", "TOD CH10",
    "EOS CH14", "EOS CH15", "EOS CH16",
    "TOD CH11", "TOD CH12",
    "EOS CH17", "EOS CH18",
    "TOD CH13", "TOD CH14", "TOD CH15", "TOD CH16",
    "EOS CH19",
    "TOD CH17",
    "EOS CH20", "EOS CH21", "EOS CH22", "EOS CH23",
    "TOD CH18", "TOD CH19", "TOD CH20", "TOD CH21",
    "EOS CH24", "EOS CH25",
    "TOD CH22", "TOD CH23",
    "EOS CH26",
    "TOD CH24",
    "EOS CH27", "EOS CH28", "EOS CH29",
    "TOD CH25", "TOD CH26", "TOD CH27", "TOD CH28",
    "EOS CH30",
    "TOD CH29", "TOD CH30", "TOD CH31",
    "EOS CH31",
    "TOD CH32",
    "EOS CH32",
    "TOD CH33", "TOD CH34", "TOD CH35",
    "EOS CH33", "EOS CH34", "EOS CH35", "EOS CH36", "EOS CH37",
    "EOS CH38", "EOS CH39", "EOS CH40", "EOS CH41", "EOS CH42",
    "EOS CH43", "EOS CH44", "EOS CH45", "EOS CH46", "EOS CH47",
    "EOS CH48", "EOS CH49", "EOS CH50", "EOS CH51",
    "TOD CH36", "TOD CH37",
    "EOS CH52",
    "TOD CH38", "TOD CH39", "TOD CH40",
    "EOS CH53",
    "TOD CH41", "TOD CH42",
    "EOS CH54", "EOS CH55", "EOS CH56",
    "TOD CH43",
    "EOS CH57", "EOS CH58", "EOS CH59",
    "TOD CH44", "TOD CH45", "TOD CH46", "TOD CH47", "TOD CH48",
    "EOS CH60", "EOS CH61",
    "TOD CH49", "TOD CH50", "TOD CH51",
    "EOS CH62", "EOS CH63",
    "TOD CH52", "TOD CH53",
    "EOS CH64", "EOS CH65",
    "TOD CH54", "TOD CH55", "TOD CH56",
    "EOS CH66", "EOS CH67",
    "TOD CH57",
    "EOS CH68", "EOS CH69", "EOS CH70", "EOS CH71", "EOS CH72",
    "EOS CH73", "EOS CH74", "EOS CH75",
    "TOD CH58", "TOD CH59", "TOD CH60", "TOD CH61",
    "TOD CH62", "TOD CH63", "TOD CH64", "TOD CH65", "TOD CH66",
    "TOD CH67", "TOD CH68"
];
// exec('rm -rf ./output/*', (err, stdout, stderr) => {
//     if (err) {
//         console.log(err);
//     }
//     console.log(stdout);
//     console.log(stderr);
//     console.log('Removed old files');
// });
function parseChapters(data) {
    // Parse the chapter timings from the data
    // This is a placeholder and you'd need to implement this based on the ffmpeg output\
        console.log(data)
    console.log('CHAPTER PARSE ABOVE')
    return [];
}


const outputFolder = './output/';
const audiobookFolder = './audiobooks/';
// Path to the books
const bookA_file = audiobookFolder + "EOS.m4b";
const bookB_file = audiobookFolder + "TOD.m4b";
const combinedFile = outputFolder + "CombinedBook.mp3"
const combinedFileM4B = outputFolder + "CombinedBook.m4b"


Promise.all([getChapters(bookA_file), getChapters(bookB_file)])
    .then(([chaptersA, chaptersB]) => {

        const merged = mergeChaptersOrdered(order, chaptersA, chaptersB);
        // console.log(merged);


        processMergedChapters(merged, bookA_file, bookB_file, combinedFile).then(() =>
        {

            convertAndAddChapters(combinedFile, combinedFileM4B, merged).then(() => {
                console.log("M4B conversion with chapters completed successfully!");
            }).catch(error => {
                console.error("An error occurred:", error);
            });

        }).catch(error => {
            console.error("Error processing chapters:", error);
        });




    })
    .catch(error => {
        console.error("Error fetching chapters:", error);
    });

