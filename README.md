# StormShelf

StormShelf is a REST API for managing books, user accounts, favourites, and
reviews. It is built with TypeScript, Express, MongoDB, and Mongoose.

The API uses JWT-based authentication, role-based access control for book
management, and Cloudinary for cover image storage. Access and refresh tokens
can be returned in the response body and stored in HTTP-only cookies.

## Core features

- User registration, login, logout, token refresh, and password changes
- JWT authentication through cookies or bearer tokens
- Admin-only book creation, updates, and deletion
- Cover image uploads with Multer and Cloudinary
- Book search, genre filtering, sorting, and pagination
- Per-user favourites
- One review per user and book
- Average-rating and top-rated-book queries
- Strict TypeScript configuration with no implicit `any`

## Technology

- Node.js
- TypeScript
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens
- bcrypt
- Multer
- Cloudinary

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB instance
- A Cloudinary account

## Getting started

Clone the repository and install its dependencies:

```bash
git clone https://github.com/amh1k/StormShelf.git
cd StormShelf
npm install
```

Create a `.env` file in the project root:

```env
PORT=9000
URL=mongodb://127.0.0.1:27017
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

ACCESS_TOKEN_SECRET=replace-with-a-long-random-value
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=replace-with-another-long-random-value
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

`URL` should contain the MongoDB server address without a database name. The
application connects to the `stormshelf` database.

Start the development server:

```bash
npm run dev
```

The API is available at `http://localhost:9000` unless `PORT` is changed.

## Scripts

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Run the API in watch mode with `tsx`         |
| `npm run typecheck` | Check TypeScript without generating output   |
| `npm run build`     | Compile TypeScript into the `dist` directory |
| `npm start`         | Run the compiled application                 |
| `npm test`          | Run the current type-checking test command   |

For a production-style run:

```bash
npm run build
npm start
```

## API

All endpoints are prefixed with `/api/v1`.

### Health check

| Method | Endpoint       | Authentication | Description              |
| ------ | -------------- | -------------- | ------------------------ |
| `GET`  | `/healthcheck` | No             | Verify that the API runs |

### Users

| Method  | Endpoint                | Authentication | Description                       |
| ------- | ----------------------- | -------------- | --------------------------------- |
| `POST`  | `/user/register`        | No             | Create an account                 |
| `POST`  | `/user/login`           | No             | Log in and issue tokens           |
| `POST`  | `/user/refresh-token`   | No             | Exchange a refresh token          |
| `POST`  | `/user/logout`          | Yes            | Revoke the stored refresh token   |
| `PATCH` | `/user/change-password` | Yes            | Change the authenticated password |

Registration accepts:

```json
{
  "username": "reader",
  "email": "reader@example.com",
  "password": "change-me"
}
```

Login accepts a password and either an email address or username:

```json
{
  "email": "reader@example.com",
  "password": "change-me"
}
```

### Books

| Method   | Endpoint             | Authentication | Role  | Description           |
| -------- | -------------------- | -------------- | ----- | --------------------- |
| `GET`    | `/books/all-books`   | Yes            | Any   | List and filter books |
| `POST`   | `/books/create-book` | Yes            | Admin | Create a book         |
| `PATCH`  | `/books/:bookId`     | Yes            | Admin | Update a book         |
| `DELETE` | `/books/:bookId`     | Yes            | Admin | Delete a book         |

The list endpoint supports these query parameters:

| Parameter | Default | Description                           |
| --------- | ------- | ------------------------------------- |
| `page`    | `1`     | Page number                           |
| `limit`   | `10`    | Results per page                      |
| `query`   | —       | Search title, author, and description |
| `genre`   | —       | Filter by genre                       |

Book creation and updates use `multipart/form-data`. The cover image field is
named `coverImage`.

Example fields for creating a book:

```text
title
author
isbn
description
genre
publishedDate
coverImage
```

### Favourites

| Method   | Endpoint              | Authentication | Description                        |
| -------- | --------------------- | -------------- | ---------------------------------- |
| `GET`    | `/favourites/all`     | Yes            | List the current user's favourites |
| `POST`   | `/favourites/:bookId` | Yes            | Add a book to favourites           |
| `DELETE` | `/favourites/:bookId` | Yes            | Remove a book from favourites      |

The favourites list supports `page`, `limit`, `genre`, `sortBy`, and `order`.
`sortBy` accepts `createdAt` or `updatedAt`, while `order` accepts `asc` or
`desc`.

### Reviews

| Method   | Endpoint                   | Authentication | Description                         |
| -------- | -------------------------- | -------------- | ----------------------------------- |
| `POST`   | `/reviews/:bookId`         | Yes            | Review a book                       |
| `DELETE` | `/reviews/:bookId`         | Yes            | Delete the current user's review    |
| `GET`    | `/reviews/average-ratings` | Yes            | Get average ratings for all books   |
| `GET`    | `/reviews/top-rating`      | Yes            | Get a paginated top-rated book list |

A review rating must be between 1 and 5:

```json
{
  "rating": 5,
  "description": "Worth reading."
}
```

The top-rated endpoint supports `page` and `limit`.

## Authentication

Protected routes accept an access token from either:

- The `accessToken` HTTP-only cookie
- The `Authorization: Bearer <token>` header

Login and token refresh set `accessToken` and `refreshToken` cookies. Cookies
are marked `secure` when `NODE_ENV=production`.

New accounts receive the `user` role. Book creation, updates, and deletion
require a user whose role is `admin`. Promoting a user is currently an
administrative database operation.

## Response format

Successful responses use a common envelope:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "success": true
}
```

Errors are represented by `ApiError`, which includes an HTTP status code,
message, success flag, and optional error details.

## Project structure

```text
src/
├── controllers/   Request handling and application logic
├── db/            MongoDB connection
├── middleware/    Authentication, authorization, and uploads
├── models/        Mongoose schemas and TypeScript model types
├── routes/        Express route definitions
├── types/         Global type augmentation
├── utils/         API responses, errors, async handling, and Cloudinary
├── app.ts         Express application setup
└── index.ts       Process entry point
```

## TypeScript design

The project uses strict TypeScript settings, including `noImplicitAny` and
`noUncheckedIndexedAccess`.

Request handlers declare their route parameters, request bodies, and query
strings through a generic async-handler utility:

```ts
asyncHandler<Params, ResponseBody, RequestBody, Query>(handler);
```

API responses use the generic `ApiResponse<T>` class, which keeps the response
envelope consistent while preserving the type of its `data` field. Express's
request type is also extended so authenticated handlers can access `req.user`
without falling back to `any`.

## Deployment notes

Before deploying:

1. Use strong, unrelated values for both JWT secrets.
2. Set `NODE_ENV=production`.
3. Set `CORS_ORIGIN` to the exact frontend origin.
4. Provide persistent MongoDB and Cloudinary credentials.
5. Run `npm run typecheck` and `npm run build`.
6. Serve the application behind HTTPS so secure cookies work correctly.

Temporary uploads are written to `public/temp` before being sent to
Cloudinary. Ensure that directory exists and is writable in the deployment
environment.

## Current limitations

- The repository does not yet include unit or integration tests; `npm test`
  currently runs the TypeScript checker.
- There is no public endpoint for assigning the admin role.
- API validation is implemented in controllers rather than through a
  dedicated schema-validation library.
- Rate limiting and centralized HTTP error middleware are not yet included.

## License

Licensed under the ISC License.
