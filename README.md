# blog-api
A complete REST API for a blogging platform built with NestJS, TypeORM, and PostgreSQL.
# Blog API - NestJS Project

> A complete REST API for a blogging platform built with NestJS, TypeORM, and PostgreSQL.

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green)
![NestJS](https://img.shields.io/badge/NestJS-10.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- 🔐 **JWT Authentication** - Secure user login with token-based auth
- 👤 **User Management** - Registration, login, profile management
- 📝 **Blog Posts CRUD** - Create, read, update, delete posts
- 🔒 **Protected Routes** - Role-based access control
- 📚 **Swagger Documentation** - Interactive API explorer
- 🗄️ **PostgreSQL Support** - TypeORM integration
- ⚡ **Watch Mode** - Auto-reload on file changes
- 🎯 **Type-Safe** - 100% TypeScript

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm v9+
- PostgreSQL 12+ (optional)
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Neeraj2004-20/blog-api.git
   cd blog-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

5. **Access the API**
   - API: http://localhost:3000/api
   - Docs: http://localhost:3000/api

[Full Installation Guide](./INSTALLATION.md)

## 📚 API Endpoints

### Authentication
```
POST   /auth/register          Register new user
POST   /auth/login             Login user
```

### Users
```
GET    /users/profile          Get user profile (Protected)
```

### Posts
```
POST   /posts                  Create post (Protected)
GET    /posts                  Get all published posts
GET    /posts/:id              Get single post
PATCH  /posts/:id              Update post (Protected)
PATCH  /posts/:id/publish      Publish post (Protected)
DELETE /posts/:id              Delete post (Protected)
GET    /posts/user/my-posts    Get user's posts (Protected)
```

## 📁 Project Structure

```
blog-api/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── jwt-auth.guard.ts
│   ├── users/
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── posts/
│   │   ├── entities/
│   │   │   └── post.entity.ts
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   └── posts.module.ts
│   ├── app.module.ts
│   └── main.ts
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env
├── .env.example
└── README.md
```

## 🛠️ Technologies Used

| Category | Technology |
|----------|-----------|
| Framework | NestJS 10.0 |
| Language | TypeScript 5.0 |
| Database | PostgreSQL / TypeORM |
| Authentication | JWT + Passport.js |
| Security | bcrypt |
| Documentation | Swagger/OpenAPI |
| Validation | class-validator |

## 💻 Development

### Running the application

```bash
# Development mode with watch
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Lint code
npm run lint
```

### Database Setup

**Option 1: Docker (Recommended)**
```bash
docker run --name blog-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:latest
```

**Option 2: Local PostgreSQL**
```bash
createdb blog_db
psql blog_db < schema.sql
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Protected routes with authentication guards
- ✅ User authorization (own resources only)
- ✅ Input validation with class-validator
- ✅ CORS enabled

## 📖 API Examples

### Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "john",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Create a Post (with token)
```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my blog post."
  }'
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📋 Roadmap

- [ ] Email verification
- [ ] Password reset
- [ ] User roles (admin, moderator)
- [ ] Post categories and tags
- [ ] Comments on posts
- [ ] Pagination
- [ ] Search functionality
- [ ] Rate limiting
- [ ] Caching with Redis
- [ ] File uploads

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 📞 Support

- 📖 [Full Documentation](./INSTALLATION.md)
- 🐛 [Report Issues](https://github.com/Neeraj2004-20/blog-api/issues)
- 💬 [Discussions](https://github.com/Neeraj2004-20/blog-api/discussions)
- 📧 Email: palamkarneeraj@gmail.com

## 👨‍💻 Author

**Your Name** - [GitHub](https://github.com/Neeraj2004-20)

## 🙏 Acknowledgments

- NestJS community
- TypeORM team
- Passport.js authentication library
- All contributors

---

**Made with ❤️ for the developer community**

