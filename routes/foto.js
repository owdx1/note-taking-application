const photoRouter = require('express').Router();

const express = require('express');
const multer = require('multer');
const minioClient=require('../minio');
const adminTokenValidator = require('../middlewares/adminTokenValidator');
const categories = {

  1:'takim',
  
  2:'tek-ust',
  3:'tek-alt',
  4:'tesettur',
  5:'bone',
  6:'terlik',
};



// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Handle file upload
photoRouter.post('/file' ,upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileName = file.originalname;
  const firstLetter = fileName.charAt(0).toLowerCase();
  const bucketName = categories[firstLetter];
  console.log(firstLetter);
  console.log(bucketName);
  console.log("file nameeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", fileName);
  // Upload file to Minio
  minioClient.putObject(bucketName, fileName, file.buffer, (err, etag) => {
    if (err) {
      console.error('Error uploading to Minio:', err);
      return res.status(500).send('Error uploading file.');
    }

    console.log('File uploaded to Minio:', etag);
    return res.status(200).send({message:'File uploaded successfully.'});
  });
});


module.exports = photoRouter;
