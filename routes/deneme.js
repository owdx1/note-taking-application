const Minio = require('minio');
const photoRouter = require('express').Router();

const pool = require('../db');

const minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,// Change this to the appropriate port if necessary
    useSSL: false, // Set to true if using SSL
    accessKey: 'XMbDPHcR5YwggUiVQ4r7',
    secretKey: '3C1ckdYT1PsVXG6LpojVOkdDgP9ODNrEPJxD319S',
  });
  
  


  const bucketName = 'ecommerce';
  const objectName = 'deneme.png'; // Replace with the desired file name and extension
  const filePath = 'C:/Users/90539/OneDrive/Masaüstü/ecom2/note-taking-application/routes/deneme.png';

  const metaData = {
    'x-amz-acl': 'public-read', // Set the object to be publicly readable
  };

minioClient.fPutObject(bucketName, objectName, filePath, (err, etag) => {
    if (err) {
      return console.error('Error uploading photo: ', err);
    }
    
    console.log('Photo uploaded successfully. ETag: ', etag);
  });
 