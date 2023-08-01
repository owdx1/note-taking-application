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
/*
minioClient.fPutObject(bucketName, objectName, filePath, (err, etag) => {
    if (err) {
      return console.error('Error uploading photo: ', err);
    }
    console.log('Photo uploaded successfully. ETag: ', etag);
  });
 


  function listAllObjects() {
    const objectsList = [];
    const listStream = minioClient.listObjects(bucketName, '', true);
  
    listStream.on('data', (obj) => {
      objectsList.push(obj);
    });
  
    listStream.on('end', () => {
      console.log('List of Objects:');
      objectsList.forEach((obj) => {
        console.log(obj.name);
      });
    });
  
    listStream.on('error', (err) => {
      console.error('Error listing objects:', err);
    });
  }
  
  listAllObjects();

*/

photoRouter.get('/photos/:featureId', async (req, res) => {
    const featureId = req.params;
    //const imageNameResult=await pool.query('SELECT f.imageName from products p,feature f where f.feature_id=$1 And f.product_id=p.product_id',[feature_id]);
   // const imageName=imageNameResult.rows[0].imageUrl;
    const imageName='rasp.jpg'
  /*  if (!imageNameResult) {
      return res.status(404).json({ message: 'Product not found' });
    }
  */

    console.log('test');
  
    try {
      
       const bucket='ecommerce';
       const  key=imageName;
       const expire=31536000; // The URL will expire in 1 hour (you can adjust this as needed)
    
  
      const photoUrl = await minioClient.presignedGetObject(bucket,key,expire);
      console.log(photoUrl);
      res.status(200).json({ photoUrl ,imageName});
    } catch (err) {
      console.error('Error generating presigned URL:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  module.exports = photoRouter;