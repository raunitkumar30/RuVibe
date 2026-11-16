const { ImageKit } = require("@imagekit/nodejs");

const ImageKitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFile(file) {
    // Convert Multer memory buffer to base64 string for ImageKit v7
    const filePayload = file.buffer ? file.buffer.toString("base64") : file;

    const result = await ImageKitClient.files.upload({
        file: filePayload,
        fileName: "music_" + Date.now() + (file.originalname ? "_" + file.originalname.replace(/\s+/g, "_") : ".mp3"),
        folder: "spotify-clone/music",
    });

    return result;
}
module.exports = {
    uploadFile,
};