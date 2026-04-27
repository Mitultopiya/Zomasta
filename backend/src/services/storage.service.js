const fs = require("fs/promises");
const path = require("path");
const ImageKit = require("imagekit");

const imagekitConfig = {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
};

const hasImageKitConfig = Object.values(imagekitConfig).every(Boolean);
const imagekit = hasImageKitConfig ? new ImageKit(imagekitConfig) : null;

function getFileExtension(originalName, mimeType) {
    const extensionFromName = path.extname(originalName || '');

    if (extensionFromName) {
        return extensionFromName.toLowerCase();
    }

    const mimeExtensionMap = {
        'video/mp4': '.mp4',
        'video/webm': '.webm',
        'video/quicktime': '.mov'
    };

    return mimeExtensionMap[mimeType] || '';
}

async function uploadFile(file, options = {}) {
    const {
        fileName,
        originalName = '',
        mimeType = '',
        baseUrl = ''
    } = options;

    const extension = getFileExtension(originalName, mimeType);
    const resolvedFileName = `${fileName}${extension}`;

    if (imagekit) {
        return imagekit.upload({
            file,
            fileName: resolvedFileName
        });
    }

    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const normalizedBaseUrl = (baseUrl || process.env.SERVER_URL || '').replace(/\/$/, '');

    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, resolvedFileName), file);

    return {
        url: normalizedBaseUrl
            ? `${normalizedBaseUrl}/uploads/${resolvedFileName}`
            : `/uploads/${resolvedFileName}`
    };
}

module.exports = {
    uploadFile
};
