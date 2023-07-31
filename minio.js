const Minio = require('minio');


const minioClient = new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,// Change this to the appropriate port if necessary
    useSSL: false, // Set to true if using SSL
    accessKey: 'XMbDPHcR5YwggUiVQ4r7',
    secretKey: '3C1ckdYT1PsVXG6LpojVOkdDgP9ODNrEPJxD319S',
  });



  module.exports = minioClient;