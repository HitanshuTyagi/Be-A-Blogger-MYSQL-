# Be-A-Blogger: Backend Architecture Documentation

## Overview
Be-A-Blogger is a monolithic web application built using **Node.js** and **Express.js**. It uses **MySQL** as its relational database, with **Sequelize** serving as the Object-Relational Mapper (ORM). The application provides full Create, Read, Update, and Delete (CRUD) support for blog posts, comments, and user profiles, along with authentication and a contact email system.

## Technology Stack
- **Runtime Environment:** Node.js
- **Web Framework:** Express.js (v5.1.0)
- **Database:** MySQL
- **ORM:** Sequelize (v6.37.8)
- **Template Engine:** EJS (v3.1.10)
- **Authentication:** Custom Session-based authentication using `express-session`, `connect-session-sequelize` (for storing sessions in DB), and `bcryptjs` (for password hashing).
- **File Uploads:** Multer (v2.0.2)
- **Email Service:** Nodemailer (v7.0.6)
- **Other Utilities:** `connect-flash` (for temporary session messages), `method-override` (to support PUT/DELETE from HTML forms), `slugify` (for SEO-friendly URLs).

## Application Structure

```text
e:\Be-A-Blogger\
├── app.js               # Application entry point, server setup, middleware config
├── config/
│   └── database.js      # Sequelize configuration to connect to MySQL
├── controllers/         # (Optional) Functions handling business logic for routes
├── models/              # Sequelize model definitions (Database schema)
│   ├── User.js          # User schema
│   ├── Post.js          # Post schema
│   └── Comment.js       # Comment schema
├── routes/              # Express route definitions
│   ├── index.js         # Public core routes (Home, Search, About)
│   ├── auth.js          # Authentication routes (Login, Register, Logout)
│   ├── posts.js         # Post management routes (CRUD operations, Comments, Likes)
│   └── users.js         # User profile routes
├── views/               # EJS templates for frontend rendering
└── public/              # Static assets (CSS, JS, images, uploads folder)
```

## Database Schema Model (Sequelize)

### 1. `User` Model
Represents registered bloggers/readers on the platform.
- `id`: Integer, Primary Key, Auto-increment
- `username`: String, Not null, Unique
- `email`: String, Not null, Unique, Validated as email
- `password`: String, Not null (Hashed via `bcryptjs`)
- `bio`: Text, Nullable
- `profileImage`: String, Nullable (URL/Path to uploaded image)
- **Hooks:** Hashes password `beforeCreate` and `beforeUpdate`. Includes instance method `comparePassword()` for login.

### 2. `Post` Model
Represents a blog post authored by a User.
- `id`: Integer, Primary Key, Auto-increment
- `title`: String, Not null
- `slug`: String, Unique (Generated from title)
- `content`: Text, Not null
- `tags`: JSON array (Default `[]`)
- `category`: String
- `image`: String (URL/Path to uploaded image)
- `likes`: JSON array (Stores user IDs of users who liked the post)
- `authorId`: Integer, Foreign Key -> `User.id`
- **Hooks:** Generates SEO-friendly slug using `slugify` `beforeValidate`.

### 3. `Comment` Model
Represents a comment on a specific Post.
- `id`: Integer, Primary Key, Auto-increment
- `text`: Text, Not null
- `authorName`: String
- `postId`: Integer, Foreign Key -> `Post.id`
- `authorId`: Integer (Nullable), Foreign Key -> `User.id` (Enables anonymous or authenticated comments)

### Associations (Relationships)
- **One-to-Many (`User` -> `Post`)**: A `User` has many `Post`s. A `Post` belongs to a single `User` as its `author`.
- **One-to-Many (`Post` -> `Comment`)**: A `Post` has many `Comment`s. Deleting a `Post` cascades and deletes associated `Comment`s.
- **One-to-Many (`User` -> `Comment`)**: A `User` has many `Comment`s. A `Comment` optionally belongs to a `User` as its `author`.

## Core Mechanisms
1. **Authentication & Authorization:** 
   Managed via session cookies. When logged in, `req.session.user` holds the user object data. Middleware `requireLogin` ensures an active session exists before allowing access to protected routes (like creating posts or editing profiles).
2. **File Uploads:**
   Handled by `multer`, which streams file uploads (blog cover images, profile images) directly into `public/uploads/` and assigns unique timestamps to filenames to prevent collisions.
3. **Mailing System:**
   Powered by `nodemailer`, integrated into the Contact post controller inside `app.js`. It validates variables from `.env` (`EMAIL_USER`, `EMAIL_PASS`) to interface with Gmail app passwords and dispatch messages.
4. **Flash Messaging:**
   Utilizes `connect-flash` to temporarily store success/error messages in the session, which are immediately passed to `res.locals` and cleared upon rendering the EJS templates.
