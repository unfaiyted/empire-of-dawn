const fs = require('fs');
const { exec } = require('child_process');

// Convert MP3 to M4B
const convertToM4B = (inputFile, outputFile) => {
    // if output exists, skip
    if (fs.existsSync(outputFile)) {
        console.log('File already exists, skipping', outputFile);
        return Promise.resolve(outputFile);
    }

    return new Promise((resolve, reject) => {
        const cmd = `ffmpeg -i ${inputFile} -c:a aac -b:a 64k -f mp4 ${outputFile}`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error converting ${inputFile} to ${outputFile}:`, error);
                reject(error);
                return;
            }
            resolve(outputFile);
        });
    });
};

// Add chapters to M4B
const ticksToTimeString = (ticks) => {
    let milliseconds = ticks % 1000;
    ticks = (ticks - milliseconds) / 1000;

    let seconds = ticks % 60;
    ticks = (ticks - seconds) / 60;

    let minutes = ticks % 60;
    let hours = (ticks - minutes) / 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};



const addChaptersToM4B = (file, chapters) => {
    const metadataFile = 'chapters.txt';
    const chaptersContent = chapters.map((chapter, index) => {

        // Check if the time is in milliseconds and convert if needed
        let startTime = /^\d+$/.test(chapter.start) ? ticksToTimeString(chapter.start) : chapter.start;
        let endTime = /^\d+$/.test(chapter.end) ? ticksToTimeString(chapter.end) : chapter.end;

        const chapterNum = String(index + 1).padStart(2, '0');
        return `CHAPTER${chapterNum}=${startTime}
CHAPTER${chapterNum}NAME=${chapter.tags.title}`;
    }).join('\n\n'); // Ensure there are line breaks between chapter entries

    console.log('chaptersInfo', chaptersContent);

    fs.writeFileSync(metadataFile, chaptersContent);

    const outputFile = file.replace('.m4b', '_chapters.m4b');

    return new Promise((resolve, reject) => {
        const cmd = `MP4Box -add "${file}#audio" -chap "${metadataFile}" -new "${outputFile}"`;

        console.log(`Adding chapters to ${file}...`);
        console.log(cmd);

        exec(cmd, (error, stdout, stderr) => {
            fs.unlinkSync(metadataFile); // Uncomment this line if you want to delete the metadata file after the process.
            if (error) {
                console.error(`Error adding chapters to ${file}:`, error);
                reject(error);
                return;
            }
            resolve();
        });
    });
};

const convertAndAddChapters = async (inputFile, outputFile, mergedChapters) => {
    console.log('Converting to M4B...');
    return convertToM4B(inputFile, outputFile)
        .then(() => {
            console.log('Adding chapters...');
            return addChaptersToM4B(outputFile, mergedChapters);
        })
        .then(() => {
            console.log("M4B conversion with chapters completed successfully!");
        })
        .catch(error => {
            console.error("An error occurred:", error);
        });

}

module.exports = {
    convertAndAddChapters
}
