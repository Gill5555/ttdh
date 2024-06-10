const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); // to use environment variables

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For parsing form data
app.use(express.static('htmlFiles')); // Serve static files from the 'htmlFiles' directory
app.use('/images', express.static('htmlFiles/images')); // Serve images from the 'public/images' directory

// MongoDB Atlas connection
const uri = `mongodb+srv://user_ttdh:${process.env.MONGO_PASSWORD}@cluster1.ff1kavs.mongodb.net/?retryWrites=true&w=majority&appName=cluster1`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB Atlas
client.connect()
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas!");

    // Define routes here
    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/htmlFiles/index.html'); // Serve the main HTML file
    });

    app.post('/submit', async (req, res) => {
      const { name, email, phone, message } = req.body;
      try {
        const collection = client.db('db').collection('ttdhweb');
        await collection.insertOne({ name, email, phone, message });
        res.redirect('/'); // Redirect to the same page
      
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });
 
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB Atlas', err);
  });

process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB client closed');
  process.exit(0);
});
