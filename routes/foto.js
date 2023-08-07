const photoRouter = require('express').Router();

const express = require('express');
const multer = require('multer');
const minioClient=require('../minio');




// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Handle file upload
photoRouter.post('/file', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileName = file.originalname;

  // Upload file to Minio
  minioClient.putObject('ecommerce', fileName, file.buffer, (err, etag) => {
    if (err) {
      console.error('Error uploading to Minio:', err);
      return res.status(500).send('Error uploading file.');
    }

    console.log('File uploaded to Minio:', etag);
    return res.status(200).send('File uploaded successfully.');
  });
});


module.exports = photoRouter;
