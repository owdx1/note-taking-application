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

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(255)
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
    isOrdered boolean ,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    pattern varchar(100),
    price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE feature (
    feature_id SERIAL PRIMARY KEY,
    product_id INTEGER,
    size VARCHAR(20),
    size_i INTEGER,
    quantity INTEGER,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

create table refresh_tokens(
customer_id integer,
refreshtoken varchar(255),
primary key (customer_id , refrestoken), --> burada yazım hatası vardı refrestoken --> refreshtoken
foreign key (customer_id) references customers (customer_id)
)

******************************************************************************************************

alter table order_items
add column size varchar(20)

alter table order_items
add column size_i integer


insert into products(product_name,category_id,price,color,description)
values('Terlik',6,230,'siyah','iyi birr terlik')


insert into feature(product_id,size_i,quantity)
values(üsttekinin product_idsi,38,5)
