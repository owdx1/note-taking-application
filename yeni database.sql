CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(255)
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    category_id INTEGER,
    price DECIMAL(10, 2),
	color varchar(50),
    discount DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);



CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(255),
    postal_code VARCHAR(10),
    country VARCHAR(255),
    phone varchar(20),
    password varchar(255)
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    order_date TIMESTAMP DEFAULT NOW(),
    total_amount DECIMAL(10, 2),
    isOrdered boolean DEFAULT false,
    isAccepted boolean DEFAULT false,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    pattern varchar(100),
    price DECIMAL(10, 2),
	size varchar(25),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE feature (
    feature_id SERIAL PRIMARY KEY,
    product_id INTEGER,
    size_id integer ,
    color integer,
    quantity INTEGER,
    featureUrl varchar(100),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (color_id) REFERENCES colors(color_id),
    FOREIGN KEY (size_id) REFERENCES sizes(size_id)
);

CREATE TABLE colors(
    color_id SERIAL PRIMARY KEY,
    color varchar(25)

);
CREATE TABLE sizes(
    size_id SERIAL PRIMARY KEY,
    size varchar(25)
);

create table refresh_tokens(
customer_id integer,
refreshtoken varchar(255),
primary key (customer_id , refreshtoken), --> burada yazım hatası vardı refrestoken --> refreshtoken
foreign key (customer_id) references customers (customer_id)
);

******************************************************************************************************











insert into categories(category_name)
values('takim');
insert into categories(category_name)
values('tek-üst');
insert into categories(category_name)
values('tek-alt');
insert into categories(category_name)
values('tesettur');
insert into categories(category_name)
values('bone');
insert into categories(category_name)
values('terlik');




insert into products(product_name,category_id,price,color,description)
values('Forma',1,500,'mavi','iyi bir takımdır');
insert into products(product_name,category_id,price,color,description)
values('damatlık',1,1500,'siyah','iyi bir takımdır');
insert into products(product_name,category_id,price,color,description)
values('Forma',1,400,'beyaz','iyi bir formadır');

insert into products(product_name,category_id,price,color,description)
values('tshirt',2,150,'siyah','iyi bir thirttür');
insert into products(product_name,category_id,price,color,description)
values('gömlek',2,250,'mavi','iyi bir gömlektir');
insert into products(product_name,category_id,price,color,description)
values('atlet',2,100,'sarı','iyi bir atlettir');

insert into products(product_name,category_id,price,color,description)
values('Short',3,300,'kırmızı','iyi bir shorttur');
insert into products(product_name,category_id,price,color,description)
values('pantolon',3,450,'mavi','iyi bir pantolondur');
insert into products(product_name,category_id,price,color,description)
values('esofman',3,200,'beyaz','iyi bir esofmandır');

insert into products(product_name,category_id,price,color,description)
values('düz tesettur',4,700,'mavi','iyi bir tesetturdur');
insert into products(product_name,category_id,price,color,description)
values('desenli tesettur',4,850,'beyaz','iyi bir tesetturdur');

insert into products(product_name,category_id,price,color,description)
values('cizgili bone',5,200,'beyaz','iyi bir bone');
insert into products(product_name,category_id,price,color,description)
values('düz bone',5,150,'siyah','iyi bir bone');
insert into products(product_name,category_id,price,color,description)
values('desenli bone',5,175,'kırmızı','iyi bir bone');

insert into products(product_name,category_id,price,color,description)
values('terlik',6,500,'sarı','iyi bir terlik');
insert into products(product_name,category_id,price,color,description)
values('ayakkabı',6,830,'kırmızı','iyi bir ayakkabı');
insert into products(product_name,category_id,price,color,description)
values('bot',6,1300,'siyah','iyi bir bot');


insert into feature(product_id,size,quantity)
values(1,'XXL',5);
insert into feature(product_id,size,quantity)
values(1,'XL',7);
insert into feature(product_id,size,quantity)
values(1,'L',9);
insert into feature(product_id,size,quantity)
values(1,'S',10);

insert into feature(product_id,size,quantity)
values(2,'XXL',15);
insert into feature(product_id,size,quantity)
values(2,'XL',8);
insert into feature(product_id,size,quantity)
values(2,'L',12);
insert into feature(product_id,size,quantity)
values(2,'S',5);

insert into feature(product_id,size,quantity)
values(3,'XS',5);
insert into feature(product_id,size,quantity)
values(3,'M',15);
insert into feature(product_id,size,quantity)
values(3,'XL',25);
insert into feature(product_id,size,quantity)
values(3,'L',5);

insert into feature(product_id,size,quantity)
values(4,'XXL',15);
insert into feature(product_id,size,quantity)
values(4,'XL',12);
insert into feature(product_id,size,quantity)
values(4,'M',14);
insert into feature(product_id,size,quantity)
values(4,'S',11);

insert into feature(product_id,size,quantity)
values(5,'XXL',8);
insert into feature(product_id,size,quantity)
values(5,'XL',7);
insert into feature(product_id,size,quantity)
values(5,'XS',12);
insert into feature(product_id,size,quantity)
values(5,'S',13);

insert into feature(product_id,size,quantity)
values(6,'XXL',25);
insert into feature(product_id,size,quantity)
values(6,'XL',15);
insert into feature(product_id,size,quantity)
values(6,'M',10);
insert into feature(product_id,size,quantity)
values(6,'S',14);

insert into feature(product_id,size,quantity)
values(7,'XL',5);
insert into feature(product_id,size,quantity)
values(7,'L',5);
insert into feature(product_id,size,quantity)
values(7,'M',5);
insert into feature(product_id,size,quantity)
values(7,';S',5);

insert into feature(product_id,size,quantity)
values(8,'XXL',5);
insert into feature(product_id,size,quantity)
values(8,'XL',15);
insert into feature(product_id,size,quantity)
values(8,'XS',8);
insert into feature(product_id,size,quantity)
values(8,'M',5);

insert into feature(product_id,size,quantity)
values(9,'XXL',15);
insert into feature(product_id,size,quantity)
values(9,'XS',25);
insert into feature(product_id,size,quantity)
values(9,'M',15);
insert into feature(product_id,size,quantity)
values(9,'L',5);

insert into feature(product_id,size,quantity)
values(10,'XXL',24);
insert into feature(product_id,size,quantity)
values(10,'XL',13);
insert into feature(product_id,size,quantity)
values(10,'L',15);

insert into feature(product_id,size,quantity)
values(11,'XXL',18);
insert into feature(product_id,size,quantity)
values(11,'XL',15);

insert into feature(product_id,size,quantity)
values(12,'XS',5);
insert into feature(product_id,size,quantity)
values(12,'XXL',12);
insert into feature(product_id,size,quantity)
values(12,'M',10);

insert into feature(product_id,size,quantity)
values(13,'XXL',5);
insert into feature(product_id,size,quantity)
values(13,'XS',7);
insert into feature(product_id,size,quantity)
values(13,'M',8);

insert into feature(product_id,size,quantity)
values(14,'XXL',5);
insert into feature(product_id,size,quantity)
values(14,'XS',16);
insert into feature(product_id,size,quantity)
values(14,'M',12);

insert into feature(product_id,size_i,quantity)
values(15,39,5);
insert into feature(product_id,size_i,quantity)
values(15,40,25);
insert into feature(product_id,size_i,quantity)
values(15,41,15);

insert into feature(product_id,size_i,quantity)
values(16,41,20);
insert into feature(product_id,size_i,quantity)
values(16,39,25);
insert into feature(product_id,size_i,quantity)
values(16,40,15);
insert into feature(product_id,size_i,quantity)
values(16,42,10);

insert into feature(product_id,size_i,quantity)
values(17,41,15);
insert into feature(product_id,size_i,quantity)
values(17,40,20);
insert into feature(product_id,size_i,quantity)
values(17,42,12);

********************************************************************
FRONTENDDE KAYIT OLL
********************************************************************

insert into orders(customer_id,total_amount)
values(1,0);


insert into order_items(order_id,product_id,quantity,price,size)
values(1,1,2,1000,'S');
insert into order_items(order_id,product_id,quantity,price,size)
values(1,1,1,500,'XL');
insert into order_items(order_id,product_id,quantity,price,size)
values(1,2,3,4500,'XL');
insert into order_items(order_id,product_id,quantity,price,size)
values(1,14,4,700,'M');
insert into order_items(order_id,product_id,quantity,price,size_i)
values(1,15,2,1000,39);

UPDATE orders
SET isOrdered = true
WHERE order_id = 1;

insert into orders(customer_id,total_amount)
values(1,0);

insert into order_items(order_id,product_id,quantity,price,size)
values(2,1,2,1000,'S');
insert into order_items(order_id,product_id,quantity,price,size)
values(2,1,1,500,'XL');
insert into order_items(order_id,product_id,quantity,price,size)
values(2,2,3,4500,'XL');
insert into order_items(order_id,product_id,quantity,price,size)
values(2,14,4,700,'M');
insert into order_items(order_id,product_id,quantity,price,size_i)
values(2,15,2,1000,39);