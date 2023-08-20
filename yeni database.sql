CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(255)
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    category_id INTEGER,
    price DECIMAL(10, 2),
    discount DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    isProductOfTheWeek boolean DEFAULT false,
    bestSeller integer DEFAULT 0,
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
    orderStatus integer DEFAULT 0,
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
    color varchar(25),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE colors(
    color_id SERIAL PRIMARY KEY,
    color varchar(25)

);
CREATE TABLE sizes(
    size_id SERIAL PRIMARY KEY,
    size varchar(25)
);

CREATE TABLE feature (
    feature_id SERIAL PRIMARY KEY,
    product_id INTEGER,
    size_id integer ,
    color_id integer,
    quantity INTEGER,
    featureUrl varchar(100),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (color_id) REFERENCES colors(color_id),
    FOREIGN KEY (size_id) REFERENCES sizes(size_id)
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




insert into products(product_name,category_id,price,description)
values('Forma',1,500,'iyi bir takımdır');
insert into products(product_name,category_id,price,description)
values('damatlık',1,1500,'iyi bir takımdır');
insert into products(product_name,category_id,price,description)
values('Forma',1,400,'iyi bir formadır');

insert into products(product_name,category_id,price,description)
values('tshirt',2,150,'iyi bir thirttür');
insert into products(product_name,category_id,price,description)
values('gömlek',2,250,'iyi bir gömlektir');
insert into products(product_name,category_id,price,description)
values('atlet',2,100,'iyi bir atlettir');

insert into products(product_name,category_id,price,description)
values('Short',3,300,'iyi bir shorttur');
insert into products(product_name,category_id,price,description)
values('pantolon',3,450,'iyi bir pantolondur');
insert into products(product_name,category_id,price,description)
values('esofman',3,200,'iyi bir esofmandır');

insert into products(product_name,category_id,price,description)
values('düz tesettur',4,700,'iyi bir tesetturdur');
insert into products(product_name,category_id,price,description)
values('desenli tesettur',4,850,'iyi bir tesetturdur');

insert into products(product_name,category_id,price,description)
values('cizgili bone',5,200,'iyi bir bone');
insert into products(product_name,category_id,price,description)
values('düz bone',5,150,'iyi bir bone');
insert into products(product_name,category_id,price,description)
values('desenli bone',5,175,'iyi bir bone');

insert into products(product_name,category_id,price,description)
values('terlik',6,500,'iyi bir terlik');
insert into products(product_name,category_id,price,description)
values('ayakkabı',6,830,'iyi bir ayakkabı');
insert into products(product_name,category_id,price,description)
values('bot',6,1300,'iyi bir bot');





 


insert into colors(color)
values('beyaz');
insert into colors(color)
values('acik_mavi');
insert into colors(color)
values('parlament_mavisi');
insert into colors(color)
values('turkuaz');
insert into colors(color)
values('duman_grisi');
insert into colors(color)
values('gri');
insert into colors(color)
values('lacivert');
insert into colors(color)
values('petrol_mavisi');
insert into colors(color)
values('petrol_yesili');
insert into colors(color)
values('kuf_yesili');
insert into colors(color)
values('benetton_yesili');
insert into colors(color)
values('ameliyathane_yesili');
insert into colors(color)
values('pembe');
insert into colors(color)
values('lila');
insert into colors(color)
values('mor');
insert into colors(color)
values('fuchsia');
insert into colors(color)
values('kirmizi');
insert into colors(color)
values('siyah');
insert into colors(color)
values('saks_mavisi');
insert into colors(color)
values('fistik_yesili');
insert into colors(color)
values('bordo');
insert into colors(color)
values('nar_cicegi');
insert into colors(color)
values('fume');
insert into colors(color)
values('murdum');
insert into colors(color)
values('acik_petrol_yesili');
insert into colors(color)
values('avci_yesili');
insert into colors(color)
values('ozel_mor');
insert into colors(color)
values('su_yesili');
insert into colors(color)
values('visne');
insert into colors(color)
values('leylak');
insert into colors(color)
values('sari');
insert into colors(color)
values('hardal');
insert into colors(color)
values('kiremit');
insert into colors(color)
values('gul_kurusu');
insert into colors(color)
values('somon');
insert into colors(color)
values('haki');
insert into colors(color)
values('menekse');
insert into colors(color)
values('kot_mavisi');
insert into colors(color)
values('bej');
insert into colors(color)
values('kahverengi');
insert into colors(color)
values('kum_rengi');
insert into colors(color)
values('turuncu_turkuaz');
insert into colors(color)
values('mint_yesili');

insert into colors(color)
values('mavi');
insert into colors(color)
values('krem');
insert into colors(color)
values('antep_fistigi');



insert into sizes(size)
values('XXS');
insert into sizes(size)
values('XS');
insert into sizes(size)
values('S');
insert into sizes(size)
values('M');
insert into sizes(size)
values('L');
insert into sizes(size)
values('XL');
insert into sizes(size)
values('XXL');
insert into sizes(size)
values('36');
insert into sizes(size)
values('37');
insert into sizes(size)
values('38');
insert into sizes(size)
values('39');
insert into sizes(size)
values('40');
insert into sizes(size)
values('41');
insert into sizes(size)
values('42');
insert into sizes(size)
values('43');
insert into sizes(size)
values('44');
insert into sizes(size)
values('45');


insert into feature(product_id,quantity,size_id,color_id)
values(1,5,1,1);
insert into feature(product_id,quantity,size_id,color_id)
values(1,7,2,2);
insert into feature(product_id,quantity,size_id,color_id)
values(1,9,3,3);
insert into feature(product_id,quantity,size_id,color_id)
values(1,10,4,4);

insert into feature(product_id,quantity,size_id,color_id)
values(1,5,1,5);
insert into feature(product_id,quantity,size_id,color_id)
values(1,7,2,6);
insert into feature(product_id,quantity,size_id,color_id)
values(1,9,3,7);
insert into feature(product_id,quantity,size_id,color_id)
values(1,10,4,8);

insert into feature(product_id,quantity,size_id,color_id)
values(1,5,1,9);
insert into feature(product_id,quantity,size_id,color_id)
values(1,7,2,10);
insert into feature(product_id,quantity,size_id,color_id)
values(1,9,3,11);
insert into feature(product_id,quantity,size_id,color_id)
values(1,10,4,12);





insert into feature(product_id,quantity,size_id,color_id)
values(2,15,1,1);
insert into feature(product_id,quantity,size_id,color_id)
values(2,8,1,2);
insert into feature(product_id,quantity,size_id,color_id)
values(2,12,1,3);
insert into feature(product_id,quantity,size_id,color_id)
values(2,5,1,4);

insert into feature(product_id,quantity,size_id,color_id)
values(2,15,3,1);
insert into feature(product_id,quantity,size_id,color_id)
values(2,8,3,3);
insert into feature(product_id,quantity,size_id,color_id)
values(2,12,4,4);
insert into feature(product_id,quantity,size_id,color_id)
values(2,5,4,7);

insert into feature(product_id,quantity,size_id,color_id)
values(2,15,5,8);
insert into feature(product_id,quantity,size_id,color_id)
values(2,8,5,10);
insert into feature(product_id,quantity,size_id,color_id)
values(2,12,6,15);
insert into feature(product_id,quantity,size_id,color_id)
values(2,5,7,18);





insert into feature(product_id,quantity,size_id,color_id)
values(3,5,1,5);
insert into feature(product_id,quantity,size_id,color_id)
values(3,15,1,8);
insert into feature(product_id,quantity,size_id,color_id)
values(3,25,1,16);
insert into feature(product_id,quantity,size_id,color_id)
values(3,5,1,21);

insert into feature(product_id,quantity,size_id,color_id)
values(3,5,2,3);
insert into feature(product_id,quantity,size_id,color_id)
values(3,15,2,7);
insert into feature(product_id,quantity,size_id,color_id)
values(3,25,2,17);
insert into feature(product_id,quantity,size_id,color_id)
values(3,5,2,12);

insert into feature(product_id,quantity,size_id,color_id)
values(3,5,3,11);
insert into feature(product_id,quantity,size_id,color_id)
values(3,15,3,16);
insert into feature(product_id,quantity,size_id,color_id)
values(3,25,3,20);
insert into feature(product_id,quantity,size_id,color_id)
values(3,5,3,23);

insert into feature(product_id,quantity,size_id,color_id)
values(4,15,1,1);
insert into feature(product_id,quantity,size_id,color_id)
values(4,12,1,5);
insert into feature(product_id,quantity,size_id,color_id)
values(4,14,1,18);
insert into feature(product_id,quantity,size_id,color_id)
values(4,11,1,15);

insert into feature(product_id,quantity,size_id,color_id)
values(4,15,2,6);
insert into feature(product_id,quantity,size_id,color_id)
values(4,12,2,14);
insert into feature(product_id,quantity,size_id,color_id)
values(4,14,2,19);
insert into feature(product_id,quantity,size_id,color_id)
values(4,11,2,26);

insert into feature(product_id,quantity,size_id,color_id)
values(4,15,6,15);
insert into feature(product_id,quantity,size_id,color_id)
values(4,12,6,12);
insert into feature(product_id,quantity,size_id,color_id)
values(4,14,4,26);
insert into feature(product_id,quantity,size_id,color_id)
values(4,11,5,2);



insert into feature(product_id,quantity,size_id,color_id)
values(5,8,4,2);
insert into feature(product_id,quantity,size_id,color_id)
values(5,7,4,18);
insert into feature(product_id,quantity,size_id,color_id)
values(5,12,5,19);
insert into feature(product_id,quantity,size_id,color_id)
values(5,13,5,21);

insert into feature(product_id,quantity,size_id,color_id)
values(5,8,5,12);
insert into feature(product_id,quantity,size_id,color_id)
values(5,7,6,11);
insert into feature(product_id,quantity,size_id,color_id)
values(5,12,6,9);
insert into feature(product_id,quantity,size_id,color_id)
values(5,13,6,2);
insert into feature(product_id,quantity,size_id,color_id)
values(5,8,7,2);
insert into feature(product_id,quantity,size_id,color_id)
values(5,7,7,8);
insert into feature(product_id,quantity,size_id,color_id)
values(5,12,7,11);
insert into feature(product_id,quantity,size_id,color_id)
values(5,13,7,18);



insert into feature(product_id,quantity,size_id,color_id)
values(6,25,1,2);
insert into feature(product_id,quantity,size_id,color_id)
values(6,15,1,12);
insert into feature(product_id,quantity,size_id,color_id)
values(6,10,2,4);
insert into feature(product_id,quantity,size_id,color_id)
values(6,14,2,14);

insert into feature(product_id,quantity,size_id,color_id)
values(6,25,3,6);
insert into feature(product_id,quantity,size_id,color_id)
values(6,15,3,16);
insert into feature(product_id,quantity,size_id,color_id)
values(6,10,3,20);
insert into feature(product_id,quantity,size_id,color_id)
values(6,14,4,8);

insert into feature(product_id,quantity,size_id,color_id)
values(6,25,4,18);
insert into feature(product_id,quantity,size_id,color_id)
values(6,15,4,20);
insert into feature(product_id,quantity,size_id,color_id)
values(6,10,5,10);
insert into feature(product_id,quantity,size_id,color_id)
values(6,14,5,15);



insert into feature(product_id,quantity,size_id,color_id)
values(7,5,7,14);
insert into feature(product_id,quantity,size_id,color_id)
values(7,5,7,24);
insert into feature(product_id,quantity,size_id,color_id)
values(7,5,7,7);
insert into feature(product_id,quantity,size_id,color_id)
values(7,5,6,6);

insert into feature(product_id,quantity,size_id,color_id)
values(7,5,6,12);
insert into feature(product_id,quantity,size_id,color_id)
values(7,5,6,18);
insert into feature(product_id,quantity,size_id,color_id)
values(7,5,6,24);
insert into feature(product_id,quantity,size_id,color_id)
values(7,5,5,5);

insert into feature(product_id,quantity,size_id,color_id)
values(7,5,5,15);
insert into feature(product_id,quantity,size_id,color_id)
values(7,5,4,15);
insert into feature(product_id,quantity,size_id,color_id)
values(7,5,3,15);
insert into feature(product_id,quantity,size_id,color_id)
values(7,5,2,15);




insert into feature(product_id,quantity,size_id,color_id)
values(8,5,1,2);
insert into feature(product_id,quantity,size_id,color_id)
values(8,15,1,15);
insert into feature(product_id,quantity,size_id,color_id)
values(8,8,1,20);
insert into feature(product_id,quantity,size_id,color_id)
values(8,5,2,20);

insert into feature(product_id,quantity,size_id,color_id)
values(8,5,2,13);
insert into feature(product_id,quantity,size_id,color_id)
values(8,15,2,11);
insert into feature(product_id,quantity,size_id,color_id)
values(8,8,3,11);
insert into feature(product_id,quantity,size_id,color_id)
values(8,5,3,6);

insert into feature(product_id,quantity,size_id,color_id)
values(8,5,3,18);
insert into feature(product_id,quantity,size_id,color_id)
values(8,15,4,16);
insert into feature(product_id,quantity,size_id,color_id)
values(8,8,4,17);
insert into feature(product_id,quantity,size_id,color_id)
values(8,5,5,18);




insert into feature(product_id,quantity,size_id,color_id)
values(9,15,4,12);
insert into feature(product_id,quantity,size_id,color_id)
values(9,25,4,18);
insert into feature(product_id,quantity,size_id,color_id)
values(9,15,4,23);
insert into feature(product_id,quantity,size_id,color_id)
values(9,5,5,12);

insert into feature(product_id,quantity,size_id,color_id)
values(9,15,5,13);
insert into feature(product_id,quantity,size_id,color_id)
values(9,25,5,17);
insert into feature(product_id,quantity,size_id,color_id)
values(9,15,6,19);
insert into feature(product_id,quantity,size_id,color_id)
values(9,5,7,19);

insert into feature(product_id,quantity,size_id,color_id)
values(9,15,1,21);
insert into feature(product_id,quantity,size_id,color_id)
values(9,25,2,21);
insert into feature(product_id,quantity,size_id,color_id)
values(9,15,3,19);
insert into feature(product_id,quantity,size_id,color_id)
values(9,5,3,20);




insert into feature(product_id,quantity,size_id,color_id)
values(10,24,5,5);
insert into feature(product_id,quantity,size_id,color_id)
values(10,13,5,4);
insert into feature(product_id,quantity,size_id,color_id)
values(10,15,6,6);

insert into feature(product_id,quantity,size_id,color_id)
values(10,24,6,5);
insert into feature(product_id,quantity,size_id,color_id)
values(10,13,6,3);
insert into feature(product_id,quantity,size_id,color_id)
values(10,15,7,1);

insert into feature(product_id,quantity,size_id,color_id)
values(10,24,1,7);
insert into feature(product_id,quantity,size_id,color_id)
values(10,13,1,17);
insert into feature(product_id,quantity,size_id,color_id)
values(10,15,2,20);




insert into feature(product_id,quantity,size_id,color_id)
values(11,18,1,2);
insert into feature(product_id,quantity,size_id,color_id)
values(11,15,2,4);

insert into feature(product_id,quantity,size_id,color_id)
values(11,18,3,6);
insert into feature(product_id,quantity,size_id,color_id)
values(11,15,3,7);

insert into feature(product_id,quantity,size_id,color_id)
values(11,18,4,8);
insert into feature(product_id,quantity,size_id,color_id)
values(11,15,5,10);

insert into feature(product_id,quantity,size_id,color_id)
values(12,5,3,3);
insert into feature(product_id,quantity,size_id,color_id)
values(12,12,4,4);
insert into feature(product_id,quantity,size_id,color_id)
values(12,10,5,5);

insert into feature(product_id,quantity,size_id,color_id)
values(12,5,6,6);
insert into feature(product_id,quantity,size_id,color_id)
values(12,12,6,7);
insert into feature(product_id,quantity,size_id,color_id)
values(12,10,7,7);

insert into feature(product_id,quantity,size_id,color_id)
values(12,5,1,12);
insert into feature(product_id,quantity,size_id,color_id)
values(12,12,2,20);
insert into feature(product_id,quantity,size_id,color_id)
values(12,10,3,11);




insert into feature(product_id,quantity,size_id,color_id)
values(13,5,1,12);
insert into feature(product_id,quantity,size_id,color_id)
values(13,7,1,15);
insert into feature(product_id,quantity,size_id,color_id)
values(13,8,2,15);

insert into feature(product_id,quantity,size_id,color_id)
values(13,5,2,18);
insert into feature(product_id,quantity,size_id,color_id)
values(13,7,3,18);
insert into feature(product_id,quantity,size_id,color_id)
values(13,8,3,14);

insert into feature(product_id,quantity,size_id,color_id)
values(13,5,7,5);
insert into feature(product_id,quantity,size_id,color_id)
values(13,7,5,7);
insert into feature(product_id,quantity,size_id,color_id)
values(13,8,2,8);



insert into feature(product_id,quantity,size_id,color_id)
values(14,5,3,6);
insert into feature(product_id,quantity,size_id,color_id)
values(14,16,3,16);
insert into feature(product_id,quantity,size_id,color_id)
values(14,12,3,22);

insert into feature(product_id,quantity,size_id,color_id)
values(14,5,1,15);
insert into feature(product_id,quantity,size_id,color_id)
values(14,16,2,15);
insert into feature(product_id,quantity,size_id,color_id)
values(14,12,4,15);

insert into feature(product_id,quantity,size_id,color_id)
values(14,5,1,26);
insert into feature(product_id,quantity,size_id,color_id)
values(14,16,2,20);
insert into feature(product_id,quantity,size_id,color_id)
values(14,12,6,12);



insert into feature(product_id,quantity,size_id,color_id)
values(15,5,8,1);
insert into feature(product_id,quantity,size_id,color_id)
values(15,25,9,2);
insert into feature(product_id,quantity,size_id,color_id)
values(15,15,10,3);

insert into feature(product_id,quantity,size_id,color_id)
values(15,5,11,4);
insert into feature(product_id,quantity,size_id,color_id)
values(15,25,12,6);
insert into feature(product_id,quantity,size_id,color_id)
values(15,15,13,7);

insert into feature(product_id,quantity,size_id,color_id)
values(15,5,14,8);
insert into feature(product_id,quantity,size_id,color_id)
values(15,25,15,9);
insert into feature(product_id,quantity,size_id,color_id)
values(15,15,16,10);

insert into feature(product_id,quantity,size_id,color_id)
values(16,20,8,11);
insert into feature(product_id,quantity,size_id,color_id)
values(16,25,9,12);
insert into feature(product_id,quantity,size_id,color_id)
values(16,15,10,13);
insert into feature(product_id,quantity,size_id,color_id)
values(16,10,11,14);

insert into feature(product_id,quantity,size_id,color_id)
values(16,20,12,15);
insert into feature(product_id,quantity,size_id,color_id)
values(16,25,13,16);
insert into feature(product_id,quantity,size_id,color_id)
values(16,15,14,17);
insert into feature(product_id,quantity,size_id,color_id)
values(16,10,15,18);

insert into feature(product_id,quantity,size_id,color_id)
values(16,20,16,19);
insert into feature(product_id,quantity,size_id,color_id)
values(16,25,17,20);
insert into feature(product_id,quantity,size_id,color_id)
values(16,15,16,21);
insert into feature(product_id,quantity,size_id,color_id)
values(16,10,15,22);

insert into feature(product_id,quantity,size_id,color_id)
values(17,15,14,23);
insert into feature(product_id,quantity,size_id,color_id)
values(17,20,13,24);
insert into feature(product_id,quantity,size_id,color_id)
values(17,12,12,5);

insert into feature(product_id,quantity,size_id,color_id)
values(17,15,11,6);
insert into feature(product_id,quantity,size_id,color_id)
values(17,20,10,7);
insert into feature(product_id,quantity,size_id,color_id)
values(17,12,9,8);

insert into feature(product_id,quantity,size_id,color_id)
values(17,15,8,2);
insert into feature(product_id,quantity,size_id,color_id)
values(17,20,9,3);
insert into feature(product_id,quantity,size_id,color_id)
values(17,12,10,4);

********************************************************************
FRONTENDDE KAYIT OLL
********************************************************************







