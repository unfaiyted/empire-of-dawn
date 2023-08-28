# Empire of Dawn
## Introduction

This is a node javascript app that takes two audiobooks and combines them for a Tandem Read for the books
Empire of Storms and Tower of Dawn


[Tandem Reading Guide](https://static1.squarespace.com/static/6112908a65261430ce25ff1f/t/641260317608292c669bb9c5/1678925874092/Tandem+Guide.png)

## Installation
This has only been tested with Audiobook files (M4b). If you want to run this you'll need to have you own copies of those files.

1. Clone the repo
2. Install the dependencies
```bash
npm install
```
3. Create a folder called `audiobooks` in the root directory
4. Copy your audiobook files into the `audiobooks` folder
5. Run the app
```bash
npm start
```
6. The combined audiobook will be in the `output` folder
7. Enjoy!

## How it works
This will take and split the audiobook into mp3 files at each chapter. 
It will then recombine them into the order of the Tandem Reading Guide (above).
It takes and creates new chapter info based on the combined books duration of each chapter.

## Notes 
- This is a very rough app that I made for myself. It's not very user friendly and I don't plan on making it so.
- I'm not sure if this will work with other audiobooks. I'm not sure if the chapter names are the same for other versions of the books.
