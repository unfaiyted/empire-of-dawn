const fs = require('fs');
const xml2js = require('xml2js');
const { exec } = require('child_process');
const util = require('util');
const stream = require('stream');
const async = require('async');
const ffmpeg = require('fluent-ffmpeg');


const getChapters = (book) => {
    return new Promise((resolve, reject) => {
        exec(`ffprobe -print_format json -show_chapters -loglevel error ${book}`, (error, stdout, stderr) => {
            if (error) {
                console.error("Error fetching chapter info:", error);
                return;
            }
            let data = JSON.parse(stdout);
            let chapters = data.chapters;
            resolve(chapters);
        });
    });
}

function mergeChaptersOrdered(order, bookA, bookB) {
    const mergedChapters = [];
    let previousEndTime = 0;

    const getChapter = (bookPrefix, chapterNum, bookList) => {
        console.log(`${bookPrefix} CH${chapterNum}`)
        return bookList.find(ch => ch.tags.title === `Chapter ${chapterNum}`);
    };

    order.forEach(item => {
        const [bookPrefix, chapterPart] = item.split(" ");
        const chapterNum = chapterPart.substring(2);
        const chapter = bookPrefix === "EOS" ? getChapter(bookPrefix, chapterNum, bookA) : getChapter(bookPrefix, chapterNum, bookB);

        console.log(chapter);

        if (chapter) {
            const duration = chapter.end - chapter.start;
            mergedChapters.push({
                id: mergedChapters.length + 1,
                time_base: chapter.time_base,
                start: previousEndTime,
                start_time: (previousEndTime / 1000).toFixed(6),
                end: previousEndTime + duration,
                end_time: ((previousEndTime + duration) / 1000).toFixed(6),
                tags: { title: item }
            });
            previousEndTime = mergedChapters[mergedChapters.length - 1].end;
        }
    });

    return mergedChapters;
}


module.exports = {
    getChapters,
    mergeChaptersOrdered
}
