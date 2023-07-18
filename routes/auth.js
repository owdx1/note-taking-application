const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const accessTokenValidator = require('../middlewares/accessTokenValidator');
const refreshTokenValidator = require('../middlewares/refreshTokenValidator');
require('dotenv').config();

// *-

    router.post('/register' , async (req , res) => {

        try {

            const {email , password1 , password2 , address , postalcode , country , firstname , lastname , city, phoneNumber} = req.body;
            //alınan bu değerlerin trimlenmesi gerek ve null olmamaları gerek bunlara da bakmak lazım
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
            const phoneNumberRegex = /^(05)[0-9][0-9][\s]([0-9]){3}[\s]([0-9]){2}[\s]([0-9]){2}/
            if(password1 !== password2 ) {
                return res.json({message: 'Şifreler eşleşmiyor.'});
            }
            if(password1.length < 6){
                return res.json({message: 'Şifre uzunluğu 6 dan büyük olmalıdır.'});
            }
            
            if (!emailRegex.test(email)) {
                return res.status(400).json({message: 'Geçerli bir e-posta adresi giriniz.'});
            }
            
            if (!passwordRegex.test(password1)) {
                return res.status(400).json({message: 'Şifre en az 6 karakter uzunluğunda , en az 1 harf ve rakam içermelidir.'});
            }
            if(country === ""){
                return res.status(400).json({message: 'Lütfen geçerli bir ülke giriniz.'})
            } 
            if(city === ""){
                return res.status(400).json({message: 'Lütfen geçerli bir şehir giriniz.'})
            }
            if(firstname === ""){
                return res.status(400).json({message: 'Lütfen geçerli bir isim giriniz.'})
            }
            if(lastname === ""){
                return res.status(400).json({message: 'Lütfen geçerli bir soyisim giriniz.'})
            }
            if(!phoneNumberRegex.test(phoneNumber)){
                return res.status(400).json({message: 'Lütfen geçerli bir telefon numarası giriniz'});
            }





            const customer = await pool.query('SELECT * FROM customers WHERE email = $1' , [email]);
            if(customer.rows.length !== 0){
                return res.status(409).json({message : "There is already a customer with same email"});
            }

            const genRound = 10;
            const genSalt = await bcrypt.genSalt(genRound)
            const bcryptPassword = await bcrypt.hash(password1 , genSalt);

            await pool.query('INSERT INTO customers (first_name, last_name, email, address, city, postal_code, country, password)  VALUES ($1, $2,$3,$4,$5,$6,$7,$8)', 
                [firstname, lastname, email, address, city, postalcode, country, bcryptPassword]);

            return res.status(200).json({message: 'Registered successfully!'});

            //auto-login işlemleri kaldırıldı

            
        } catch (error) {
            console.error(error);
            return res.status(500).send('Server error');
        }
    });


router.post('/login' , async (req , res) =>{


    try {
        const {email , password} = req.body;
    
        const customer = await pool.query(`SELECT * FROM customers WHERE email = $1` , [email]);

        
        if(customer.rows.length !== 0){
            
            const isValid = await bcrypt.compare(password , customer.rows[0].password);
            

            if(!isValid){
            
                return res.status(401).json({message: 'Yanlış kullanıcı adı veya şifre'});
            }
        }

        const payload = {
            email: customer.rows[0].email,
            id: customer.rows[0].customer_id,
        
        }
        
        const accessToken = jwt.sign(payload , process.env.ACCESS_TOKEN_SECRET , {expiresIn: "1hr"});
        const refreshToken = jwt.sign(payload , process.env.REFRESH_TOKEN_SECRET);

        const refreshTokenInDatabase = await pool.query('SELECT * from refresh_tokens where customer_id = $1' , [customer.rows[0].customer_id]);

        if(refreshTokenInDatabase.rows.length !== 0){
             await pool.query('DELETE FROM refresh_tokens WHERE customer_id = $1' , [customer.rows[0].customer_id]);

        }

        await pool.query('INSERT INTO refresh_tokens (customer_id, refreshtoken) values ($1 , $2)' , [customer.rows[0].customer_id , refreshToken])
        // refresh_tokens isimli table'da, her kullanıcı için sadece 1 refresh token tutmak istediğimden dolayı , eğer refreshtoken varsa
        // siliyoruz. Her halükarda ise yeni refresh tokenimizi database'e gönderiyoruz.
        

        return res.status(200).json({message: 'Başarıyla giriş yapıldı! ' , accessToken: accessToken});
        

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
        
    }
})

router.get('/logout', accessTokenValidator, refreshTokenValidator, async (req , res) =>{

        const {id}  = req.customer;
        
    try {
        
        await pool.query('DELETE FROM refresh_tokens WHERE customer_id = $1' , [id])

        return res.status(200).send('Logged out successfully');
        
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }

})


module.exports = router;