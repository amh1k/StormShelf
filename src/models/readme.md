Users
-----
id (PK)
username
email
password_hash
role ('user' | 'admin')

Books
-----
id (PK)
title
author
description
isbn
genre
published_date
cover_image_url

Reviews
-------
id (PK)
user_id (FK -> Users)
book_id (FK -> Books)
rating (1-5)
comment
created_at
