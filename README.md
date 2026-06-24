# StormShelf 📚

StormShelf is a TypeScript backend book management system built with Node.js, Express, and MongoDB. It provides a comprehensive API for managing book collections, user authentication, reviews, and favorites, with integrated image processing via Cloudinary.

## 🚀 Features

- **User Authentication**: Secure signup and login using JWT and Bcrypt.
- **Book Management**: Full CRUD operations for books, including image uploads.
- **Image Integration**: seamless image management using Cloudinary and Multer.
- **Favorites System**: Users can maintain a personalized list of favorite books.
- **Reviews & Ratings**: Integrated review system for users to share feedback on books.
- **Secure Architecture**: Middleware-based authentication and secure cookie handling.
- **Health Monitoring**: Built-in health check endpoints for system monitoring.

## 🛠️ Tech Stack

- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime Environment**: [Node.js](https://nodejs.org/)
- **Web Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/) & [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **File Uploads**: [Multer](https://github.com/expressjs/multer) & [Cloudinary](https://cloudinary.com/)
- **Utilities**: [Dotenv](https://github.com/motdotla/dotenv), [CORS](https://github.com/expressjs/cors), [Cookie-parser](https://github.com/expressjs/cookie-parser)

## 🏗️ Project Structure

```text
src/
├── controllers/    # Request handlers & business logic
├── db/             # Database connection configuration
├── middleware/     # Custom middleware (auth, etc.)
├── models/         # Mongoose schemas & models
├── routes/         # API endpoint definitions
├── utils/          # Helper functions (Cloudinary, Error handlers, etc.)
├── types/          # Express and project-wide type declarations
├── app.ts          # Express app configuration
└── index.ts        # Server entry point
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB account (Atlas or local)
- Cloudinary account

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd StormShelf
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add the following variables:

   ```env
   PORT=9000
   URL=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:5173

   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the application**:
   - For development (with automatic reload):
     ```bash
     npm run dev
     ```
   - Type-check the project:
     ```bash
     npm run typecheck
     ```
   - Build and run for production:
     ```bash
     npm run build
     npm start
     ```

## 🛣️ API Endpoints (v1)

### User Routes

- `POST /api/v1/user/register` - Create a new account
- `POST /api/v1/user/login` - Authenticate user
- `POST /api/v1/user/logout` - Clear authentication cookies

### Book Routes

- `GET /api/v1/books` - Retrieve all books
- `POST /api/v1/books` - Add a new book (Admin/Authorized)
- `GET /api/v1/books/:id` - Get details of a specific book

### Favorites Routes

- `GET /api/v1/favourites` - Get user's favorite books
- `POST /api/v1/favourites` - Add a book to favorites

### Reviews Routes

- `POST /api/v1/reviews` - Add a review to a book
- `GET /api/v1/reviews/:bookId` - Get reviews for a specific book

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
