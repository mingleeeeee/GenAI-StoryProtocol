const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const OpenAI  = require('openai');
const multer = require('multer');
const base64 = require('base64-stream');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const port = 5000;
const openai = new OpenAI({apiKey:'KEY'});

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'thisisasecret', resave: false, saveUninitialized: true }));

// Route to handle initial page load 
app.get('/', (req, res) => {
    // Respond with the index.html file
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

app.post('/saveImage', (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      throw new Error('Image data is missing in the request body.');
    }

    // Extract the base64-encoded image data
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const imageData = Buffer.from(base64Data, 'base64');

    // Generate a unique filename based on the current timestamp
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const filename = `public/mask/masked_image_${timestamp}.png`;
    const savePath = filename //path.join('static', filename);

    // Save the image to the server
    fs.writeFile(savePath, imageData, (err) => {
      if (err) {
        console.error('Error saving image:', err);
        return res.status(500).json({ error: 'Error saving image.' });
      }

      // Store the saved image path in the session
      req.session.mask_image = savePath;

      // Respond with the URL of the saved image
      const savedImageUrl = `/${filename}`;
      return res.status(200).json({ message: 'Image saved successfully.', imageUrl: savedImageUrl });
    });
  } catch (err) {
    console.error('Error in /saveImage route:', err);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
});


app.post('/recreateImage', async (req, res) => {
  try {
    console.log(`ori: ${req.session.ori_image}`)
    console.log(`mask: ${req.session.mask_image}`)

    const { prompt } = req.body;
    const ori_image = req.session.ori_image;
    const mask_image = req.session.mask_image;

    const response = await openai.images.edit({
      model: 'dall-e-2',
      image: fs.createReadStream(ori_image),
      mask: fs.createReadStream(mask_image),
      prompt: prompt,
      n: 1,
      size: '256x256',
    });

    const image_url = response.data[0].url;
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const gen_image_filename = `gen_${timestamp}.png`;
    const gen_image_path = `public/asset/${gen_image_filename}`//path.join('static', gen_image_filename);

    const imageResponse = await axios.get(image_url, { responseType: 'arraybuffer' });
    fs.writeFileSync(gen_image_path, imageResponse.data);

    const image = await loadImage(gen_image_path);
    const canvas = createCanvas(248, 248);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, 248, 248);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(gen_image_path, buffer);
    // update origin image 
    req.session.ori_image = gen_image_path;
    const gen_image_url = `asset/${gen_image_filename}`;
    res.json({ img_filename: gen_image_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Error recreating image: ${err.message}` });
  }
});
// Endpoint to set a session variable
app.post('/setSession', (req, res) => {
    req.session.ori_image = 'public/image/chiikawa_rgba.png'; // Set your session variable here
    console.log('set origin');
    if (req.session.mask_image) {
        // Clear mask_image session variable
        delete req.session.mask_image;
        // Set ori_image session variable
        console.log('mask cleared');
      }
    res.sendStatus(200);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
