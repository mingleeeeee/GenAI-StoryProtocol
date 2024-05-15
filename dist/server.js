"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const openai_1 = __importDefault(require("openai"));
const axios_1 = __importDefault(require("axios"));
const canvas_1 = require("canvas");
const config_1 = __importDefault(require("./config"));
const core_sdk_1 = require("@story-protocol/core-sdk");
const viem_1 = require("viem");
const aws_sdk_1 = require("aws-sdk");
const app = (0, express_1.default)();
const port = 5000;
const openai = new openai_1.default({ apiKey: config_1.default.OPENAI_API_KEY });
const NFTContractAddress = '0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F49';
const OwnerAddress = '0x76C787d210F5876FD124D5b9c156482a74eb00B5';
const NonCommercialSocialRemixingTermsId = 2;
const RPCProviderUrl = 'https://ethereum-sepolia-rpc.publicnode.com';
let accountAddress = null; // Global variable to store the account address
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json({ limit: '10mb' }));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use((0, express_session_1.default)({ secret: 'thisisasecret', resave: false, saveUninitialized: true }));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public', 'index.html'));
});
app.post('/saveImage', (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            throw new Error('Image data is missing in the request body.');
        }
        const base64Data = image.replace(/^data:image\/png;base64,/, '');
        const imageData = Buffer.from(base64Data, 'base64');
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const filename = `public/mask/masked_image_${timestamp}.png`;
        const savePath = filename;
        fs_1.default.writeFile(savePath, imageData, (err) => {
            if (err) {
                console.error('Error saving image:', err);
                return res.status(500).json({ error: 'Error saving image.' });
            }
            req.session.mask_image = savePath;
            const savedImageUrl = `/${filename}`;
            return res.status(200).json({ message: 'Image saved successfully.', imageUrl: savedImageUrl });
        });
    }
    catch (err) {
        console.error('Error in /saveImage route:', err);
        return res.status(500).json({ error: 'Internal Server Error.' });
    }
});
app.post('/recreateImage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt } = req.body;
        const ori_image = req.session.ori_image;
        const mask_image = req.session.mask_image;
        if (!ori_image || !mask_image) {
            throw new Error('Original image or mask image is missing.');
        }
        const response = yield openai.images.edit({
            model: 'dall-e-2',
            image: fs_1.default.createReadStream(ori_image),
            mask: fs_1.default.createReadStream(mask_image),
            prompt: prompt,
            n: 1,
            size: '256x256',
        });
        const image_url = response.data[0].url;
        if (!image_url) {
            throw new Error('Failed to get the image URL from the response.');
        }
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const gen_image_filename = `gen_${timestamp}.png`;
        const gen_image_path = `public/asset/${gen_image_filename}`;
        const imageResponse = yield axios_1.default.get(image_url, { responseType: 'arraybuffer' });
        fs_1.default.writeFileSync(gen_image_path, imageResponse.data);
        const image = yield (0, canvas_1.loadImage)(gen_image_path);
        const canvas = (0, canvas_1.createCanvas)(248, 248);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, 248, 248);
        const buffer = canvas.toBuffer('image/png');
        fs_1.default.writeFileSync(gen_image_path, buffer);
        const bucketName = 'ming-ip-asset';
        const imagePath = gen_image_path; // Path to your local image file
        const keyName = gen_image_filename; // Name to give the uploaded file in S3
        uploadImageToS3(bucketName, imagePath, keyName)
            .then((s3ObjectUrl) => {
            console.log('Uploaded image URL:', s3ObjectUrl);
        })
            .catch((error) => {
            console.error('Failed to upload image:', error);
        });
        req.session.ori_image = gen_image_path;
        const gen_image_url = `asset/${gen_image_filename}`;
        res.json({ gen_image_url: gen_image_url, gen_image_filename: gen_image_filename });
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err);
            res.status(500).json({ error: `Error recreating image: ${err.message}` });
        }
        else {
            console.error('Unexpected error', err);
            res.status(500).json({ error: 'Unexpected error' });
        }
    }
}));
app.post('/setSession', (req, res) => {
    req.session.ori_image = 'public/image/chiikawa_rgba.png';
    console.log('set origin');
    if (req.session.mask_image) {
        delete req.session.mask_image;
        console.log('mask cleared');
    }
    res.sendStatus(200);
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
// Example POST endpoint to receive data
app.post('/saveWalletAddress', (req, res) => {
    const { address } = req.body;
    if (!address) {
        return res.status(400).json({ error: 'Wallet address is missing in the request body.' });
    }
    console.log('Received wallet address:', address);
    accountAddress = address;
    // Process the received data (e.g., save to database, perform actions, etc.)
    // Respond with a success message or data
    res.status(200).json({ message: 'Address received successfully.', receivedValue: address });
});
app.post('/registerIP', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (accountAddress) {
            const { IPid, derivativeTokenId } = req.body;
            const config = {
                transport: (0, viem_1.http)(RPCProviderUrl),
                account: accountAddress, // the account address from above
                chainId: 'sepolia'
            };
            console.log(`Start to mint liscense at account address: ${config.account}`);
            console.log(`IPid: ${IPid}`);
            console.log(`OwnerAddress: ${OwnerAddress}`);
            const client = core_sdk_1.StoryClient.newClient(config);
            const mintLicenseResponse = yield client.license.mintLicenseTokens({
                licenseTermsId: NonCommercialSocialRemixingTermsId,
                licensorIpId: IPid,
                receiver: OwnerAddress,
                amount: 1,
                txOptions: { waitForTransaction: true },
            });
            console.log(`License Token minted at transaction hash ${mintLicenseResponse.txHash}, License ID: ${mintLicenseResponse.licenseTokenId}`);
            console.log(`Start to register IP asset`);
            console.log(`TokenID: ${derivativeTokenId}`);
            console.log(`Contract address: ${NFTContractAddress}`);
            const registeredIpAssetDerivativeResponse = yield client.ipAsset.register({
                nftContract: NFTContractAddress,
                tokenId: derivativeTokenId,
                txOptions: { waitForTransaction: true },
            });
            console.log(`Derivative IPA created at transaction hash ${registeredIpAssetDerivativeResponse.txHash}, IPA ID: ${registeredIpAssetDerivativeResponse.ipId}`);
            const linkDerivativeResponse = yield client.ipAsset.registerDerivativeWithLicenseTokens({
                childIpId: registeredIpAssetDerivativeResponse.ipId,
                licenseTokenIds: [mintLicenseResponse.licenseTokenId],
                txOptions: { waitForTransaction: true },
            });
            console.log(`Derivative IPA linked to parent at transaction hash ${linkDerivativeResponse.txHash}`);
            res.status(200).send('Ethereum logic executed successfully.');
        }
        else {
            console.log('No Wallet Address. IP asset register failed.');
        }
    }
    catch (error) {
        if (error instanceof viem_1.ContractFunctionExecutionError) {
            const cause = error.cause
                .walk()
                .message.split(":")[2]
                .split("\n")[0]
                .trim();
            return sentenceCase(cause);
        }
        console.error('Error executing Ethereum logic:', error);
        res.status(500).send('Internal Server Error');
    }
}));
// AWS S3 configuration
const s3 = new aws_sdk_1.S3({
    accessKeyId: config_1.default.accessKeyId,
    secretAccessKey: config_1.default.secretAccessKey,
    region: config_1.default.region
});
// Function to upload an image to S3
function uploadImageToS3(bucketName, imagePath, keyName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Read the image file
            const fileContent = fs_1.default.readFileSync(imagePath);
            // Set S3 upload parameters
            const params = {
                Bucket: bucketName,
                Key: keyName,
                Body: fileContent,
                ContentType: 'image/png', // Modify based on your file type
                ACL: 'public-read' // Set object ACL to public-read
            };
            // Upload file to S3
            const data = yield s3.upload(params).promise();
            console.log('File uploaded successfully:', data.Location);
            return data.Location; // Return the S3 object URL
        }
        catch (error) {
            console.error('Error uploading file to S3:', error);
            throw error; // Rethrow the error for higher-level handling
        }
    });
}
// Example configuration for custom transport (replace with actual implementation)
function custom(provider) {
    // Implement custom transport based on provider (MetaMask, etc.)
    return provider;
}
function sentenceCase(cause) {
    throw new Error('Function not implemented.');
}
