// Loop over the merged chapters, generate temp files, and then concatenate them
const fs = require('fs');
const { exec } = require('child_process');

const processMergedChapters = async (chapters, bookA_file, bookB_file, combinedFile) => {
    const tempFiles = [];

    console.log('Processing chapters from both books...');
    for (const chapter of chapters) {
        console.log(`Processing chapter ${chapter.tags.title}...`);
        const bookFile = chapter.tags.title.startsWith("EOS") ? bookA_file : bookB_file;
        const tempFile = await extractChapterSegment(chapter, bookFile);
        tempFiles.push(tempFile);
    }

    console.log('All chapters processed, now concatenating...');
    await concatenateAudioFiles(tempFiles, combinedFile);

    // Optional: Clean up temporary files after concatenation
    /*  tempFiles.forEach(file => {
          fs.unlinkSync(file);
      });*/

    console.log("All chapters merged successfully into", combinedFile);
};


const extractChapterSegment = (chapter, book) => {
    return new Promise((resolve, reject) => {
        const outputFile = `./output/tempChapter_${chapter.tags.title.replace("CH","").replace(" ","_")}.mp3`;
        if(fs.existsSync(outputFile)) {
            console.log('File already exists, skipping', outputFile);
            resolve(outputFile);
            return;
        }

        const cmd = `ffmpeg -ss ${chapter.start_time} -i ${book} -t ${(chapter.end - chapter.start) / 1000} ${outputFile}`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(outputFile);
        });
    });
};


// Function to concatenate multiple audio files together
const concatenateAudioFiles = async (fileList, outputFile) => {
    console.log('Starting concatenation...');

    // If the outputFile doesn't exist, create it with the content of the first file
    if (!fs.existsSync(outputFile)) {
        fs.copyFileSync(fileList[0], outputFile);
        console.log(`Initialized ${outputFile} with ${fileList[0]}`);
        fileList.shift();  // Remove the first file from the list as it's already in the output
    }

    for (let file of fileList) {
        const tempMergedFile = 'tempMerged.mp3';

        // Create a temporary text file listing the current output and the next file to append
        const tempFileList = 'tempFileList.txt';
        const fileContent = `file '${outputFile}'\nfile '${file}'`;
        fs.writeFileSync(tempFileList, fileContent);

        // Use the concat filter of ffmpeg
        const cmd = `ffmpeg -f concat -safe 0 -i ${tempFileList} -c copy ${tempMergedFile}`;

        // Execute the ffmpeg command
        await new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });

        // Replace the original output file with the new merged file
        fs.renameSync(tempMergedFile, outputFile);

        // Logging details
        const appendedFileSize = fs.statSync(file).size;
        const newOutputFileSize = fs.statSync(outputFile).size;

        console.log(`Appended ${file} [${appendedFileSize} bytes] to ${outputFile}. New size: ${newOutputFileSize} bytes`);
    }

    console.log('Finished concatenation.');
};

module.exports = {
    processMergedChapters

}
