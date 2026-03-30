# Be-A-Blogger: API Documentation

This document outlines the routes and endpoints available in the Be-A-Blogger application. 
*Note: Since this application renders server-side EJS views rather than acting purely as a REST/JSON API, many endpoints return HTML pages or HTTP redirects. JSON responses are explicitly noted.*

---

## 1. Authentication Routes (`/auth`)
Handles user registration, login, and session destruction.

### `GET /auth/register`
- **Description:** Renders the user registration form.
- **Response:** HTML template (`auth/register`).

### `POST /auth/register`
- **Description:** Registers a new user account.
- **Body Parameters (`application/x-www-form-urlencoded`):**
  - `username` (String): Chosen username.
  - `email` (String): Valid email address.
  - `password` (String): Raw password.
- **Action:** Hashes password, saves user in DB, creates session.
- **Response:** Redirects to `/` on success, or back to `/auth/register` on failure alongside an error flash message.

### `GET /auth/login`
- **Description:** Renders the login form.
- **Response:** HTML template (`auth/login`).

### `POST /auth/login`
- **Description:** Authenticates a user.
- **Body Parameters:**
  - `email` (String): User's email.
  - `password` (String): User's password.
- **Action:** Compares passwords. Sets `req.session.user`.
- **Response:** Redirects to `/` on success, or back to `/auth/login` on failure.

### `POST /auth/logout`
- **Description:** Logs out current user.
- **Action:** Destroys active session.
- **Response:** Redirects to `/`.

---

## 2. Post Management Routes (`/posts`)
Handles creation, retrieval, modification, and deletion of blog posts.
*Requires Login for mutation endpoints.*

### `GET /posts/new`
- **Description:** Renders the new post creation form.
- **Security:** Requires active session (`requireLogin`).
- **Response:** HTML template (`posts/new`).

### `POST /posts`
- **Description:** Creates a new blog post.
- **Security:** Requires active session (`requireLogin`).
- **Content-Type:** `multipart/form-data`
- **Body Parameters:**
  - `title` (String): Post title.
  - `content` (Text): Post body content.
  - `tags` (String): Comma-separated tags.
  - `category` (String): Post category.
  - `image` (File, Optional): Form field for cover image upload.
- **Response:** Redirects to the newly created post URL (`/posts/:slug`).

### `GET /posts/:slug`
- **Description:** Displays a specific blog post and its comments.
- **URL Parameters:** `slug` (String): The post slug.
- **Response:** HTML template (`posts/show`) containing post details and comments.

### `GET /posts/:id/edit`
- **Description:** Renders the form to edit an existing post.
- **Security:** Requires active session. User must be the post author.
- **URL Parameters:** `id` (Integer): Post ID.
- **Response:** HTML template (`posts/edit`).

### `PUT /posts/:id`
- **Description:** Updates an existing blog post. Uses `method-override` to simulate PUT via POST form.
- **Security:** Requires active session. User must be the post author.
- **Content-Type:** `multipart/form-data`
- **Body Parameters:**
  - Similar fields as `POST /posts`.
  - `removeImage` (Checkbox, Optional): If checked (`'on'`), deletes current cover image from database.
- **Response:** Redirects to the updated post URL (`/posts/:slug`).

### `DELETE /posts/:id`
- **Description:** Deletes a specific blog post and cascades to delete all associated comments. Uses `method-override`.
- **Security:** Requires active session. User must be the post author.
- **Response:** Redirects to `/posts` (or `/` practically) upon successful deletion.

### `POST /posts/:slug/comments`
- **Description:** Creates a new comment under a post.
- **URL Parameters:** `slug` (String): Post slug.
- **Body Parameters:**
  - `text` (String): Comment content.
  - `name` (String, Optional): Author alias (defaults to session username if logged in, or 'Anonymous').
- **Response:** Redirects back to the post URL (`/posts/:slug`).

### `POST /posts/:id/like`
- **Description:** Toggles the authenticated user's like on a target post.
- **Security:** Requires active session (`requireLogin`).
- **Response (JSON):** 
  ```json
  {
    "ok": true,
    "likes": 5
  }
  ```
  *(or `{"ok": false, "error": "message"}` on error).*

---

## 3. User Profile Routes (`/users`)
Handles profile data modifications.

### `GET /users/profile`
- **Description:** Renders the authenticated user's profile and lists their authored posts.
- **Security:** Requires active session (`requireLogin`).
- **Response:** HTML template (`users/profile`).

### `POST /users/profile`
- **Description:** Updates the active user's bio and uploaded profile image.
- **Security:** Requires active session (`requireLogin`).
- **Content-Type:** `multipart/form-data`
- **Body Parameters:**
  - `bio` (Text): Updated bio description.
  - `profileImage` (File, Optional): Form field for profile picture upload.
- **Response:** Redirects to `/users/profile`.

---

## 4. General / Utility Routes

### `GET /`
- **Description:** Home page. Fetches latest posts with optional search filter.
- **Query Parameters:** `q` (String, Optional): Search term to filter posts by title dynamically.
- **Response:** HTML template (`index`) containing posts.

### `GET /about`
- **Description:** Renders the informational About page.
- **Response:** HTML template (`utils/about`).

### `GET /contact`
- **Description:** Renders the Contact form page.
- **Response:** HTML template (`utils/contact`).

### `POST /contact`
- **Description:** Submission handler for the contact page; sends an email to the administrator using Nodemailer.
- **Body Parameters:**
  - `name` (String): Sender's name.
  - `email` (String): Sender's email.
  - `message` (Text): The contact message content.
- **Response:** Redirects back to `/contact` with success or error flash message.
