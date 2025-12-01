# 📰 Django Blogging App

A full-featured **Blogging Platform** built with **Django REST Framework**, **PostgreSQL**, and **Docker**, featuring **JWT authentication**, **filters**, **nested comments**, **Celery background tasks** for email notifications, and an **admin dashboard** with advanced filtering.

---

## 🚀 Features

### 🔐 Authentication

* JWT-based authentication (Access & Refresh tokens).
* Token blacklisting & rotation support.
* Secure login, registration, and logout endpoints.

### 📝 Blogging System

* CRUD operations for posts.
* Only authors can edit or delete their posts.
* Nested comment system (reply to comments).
* Like/unlike functionality (one like per user per post).
* Full-text and partial search using **Postgres SearchVector**.

### 🔍 Filtering and Search

* Custom `PostFilter` class using `django-filter`.
* Filter posts by:

  * Title
  * Author email
  * Content
  * Date range
  * Likes range
  * Comments range
  * Has comments (boolean)
* Combined full-text search using `q` parameter.
* Admin filters for title, author, date, likes, and comments.

### 📨 Email Notifications (Celery + Redis)

* Uses **Celery** task queue and **Redis** as broker.
* Sends asynchronous email notifications when a user comments on a post.
* Background processing ensures non-blocking user experience.

### ⚙️ Admin Panel

* Custom admin filters and search for posts.
* Comment and Like management.
* Inline display of related comments & likes.

### 🐳 Dockerized Setup

* Complete Docker environment for local development.
* Containers:

  * `web` → Django + Gunicorn
  * `db` → PostgreSQL
  * `redis` → Redis server for Celery
  * `worker` → Celery worker
* Easy setup using `docker-compose`.

---

## 🧱 Tech Stack

| Layer                | Technology                                |
| -------------------- | ----------------------------------------- |
| **Backend**          | Django, Django REST Framework             |
| **Database**         | PostgreSQL                                |
| **Async Tasks**      | Celery, Redis                             |
| **Auth**             | JWT (SimpleJWT)                           |
| **Containerization** | Docker, Docker Compose                    |
| **Filtering/Search** | django-filters, SearchVector (PostgreSQL) |
| **Testing Tools**    | Postman, curl                             |

---

## 🧰 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/django-blog-app.git
cd django-blog-app
```

### 2️⃣ Create `.env` file

Example environment variables:

```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_NAME=blogdb
DATABASE_USER=bloguser
DATABASE_PASSWORD=blogpassword
DATABASE_HOST=db
DATABASE_PORT=5432
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_password
EMAIL_USE_TLS=True
```

### 3️⃣ Run with Docker Compose

```bash
docker-compose up --build
```

It will start:

* Django API
* PostgreSQL
* Redis
* Celery Worker

### 4️⃣ Run database migrations

```bash
docker-compose exec web python manage.py migrate
```

### 5️⃣ Create superuser

```bash
docker-compose exec web python manage.py createsuperuser
```

---

## 🔥 API Endpoints

| Method           | Endpoint                    | Description                            | Auth Required |
| ---------------- | --------------------------- | -------------------------------------- | ------------- |
| POST             | `/api/auth/register/`       | Register new user                      | ❌             |
| POST             | `/api/auth/login/`          | Obtain JWT token                       | ❌             |
| POST             | `/api/auth/token/refresh/`  | Refresh access token                   | ❌             |
| GET              | `/api/posts/`               | List all posts (with filters/search)   | ✅/❌           |
| GET              | `/api/posts/mine/`          | List posts by logged-in user           | ✅             |
| POST             | `/api/posts/create/`        | Create new post                        | ✅             |
| GET              | `/api/posts/<id>/`          | Get post detail (with nested comments) | ✅/❌           |
| PUT/PATCH        | `/api/posts/<id>/edit/`     | Update post (only author)              | ✅             |
| DELETE           | `/api/posts/<id>/edit/`     | Delete post (only author)              | ✅             |
| GET/POST         | `/api/posts/<id>/comments/` | List/Create comment                    | ✅             |
| PUT/PATCH/DELETE | `/api/comments/<id>/edit/`  | Edit/Delete comment (only author)      | ✅             |

---

## 🧮 Filters Usage Examples

### 1️⃣ Basic filters

```
GET /api/posts/?title=django
GET /api/posts/?author_email=user@example.com
GET /api/posts/?date_from=2025-10-01&date_to=2025-10-15
```

### 2️⃣ Range filters

```
GET /api/posts/?min_likes=5&max_likes=20
GET /api/posts/?min_comments=2
```

### 3️⃣ Boolean filters

```
GET /api/posts/?has_comments=true
```

### 4️⃣ Combined search

```
GET /api/posts/?q=how to django
```

---

## 🔄 Background Email Notification Example

When a user comments on a post, a Celery task is triggered:

```python
@shared_task
def send_comment_notification(post_id, comment_author):
    post = Post.objects.get(id=post_id)
    subject = f"New comment on your post '{post.title}'"
    message = f"{comment_author} commented on your post."
    send_mail(subject, message, EMAIL_HOST_USER, [post.author.email])
```

This task runs asynchronously using Redis as the message broker.

---

## 🧠 Key Concepts Implemented

* **Custom Permissions**: `IsAuthorOrReadOnly` to restrict edit/delete.
* **Django Filters** for range/date/boolean filtering.
* **SearchVector + SearchRank** for full-text search.
* **Celery tasks** for non-blocking email notifications.
* **Custom Admin filters** and UI enhancements.
* **Dockerized environment** for easy deployment.

---

## 🧑‍💻 Development Commands

```bash
# Run Celery Worker
docker-compose exec web celery -A core worker -l info

# Run Django Shell
docker-compose exec web python manage.py shell

# Collect static files (if needed)
docker-compose exec web python manage.py collectstatic
```

---

## 🧩 Project Structure

```
blog_project/
│
├── blog/                      # Main app
│   ├── models.py              # Post, Comment, Like models
│   ├── serializers.py         # DRF serializers
│   ├── views.py               # API endpoints
│   ├── filters.py             # Custom filters
│   ├── tasks.py               # Celery tasks for email
│   ├── admin.py               # Admin filters
│   ├── urls.py                # API routes
│
├── users/                     # Custom user model & auth
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│
├── core/
│   ├── settings.py
│   ├── celery.py
│   ├── urls.py
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```