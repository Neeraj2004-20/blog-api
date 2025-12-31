// ============================================
// COMPLETE FOLDER STRUCTURE FOR NESTJS BLOG API
// ============================================

/*
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
├── .env
├── package.json
├── tsconfig.json
└── nest-cli.json
*/

// ============================================
// FILE: src/main.ts
// ============================================
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('A complete blog API with authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
  console.log('🚀 Application is running on: http://localhost:3000');
  console.log('📚 Swagger docs: http://localhost:3000/api');
}
bootstrap();

// ============================================
// FILE: src/app.module.ts
// ============================================
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'blog_db',
      autoLoadEntities: true,
      synchronize: true, // Set to false in production
    }),
    AuthModule,
    UsersModule,
    PostsModule,
  ],
})
export class AppModule {}

// ============================================
// FILE: src/auth/auth.module.ts
// ============================================
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}

// ============================================
// FILE: src/auth/auth.service.ts
// ============================================
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(email, username, hashedPassword);
    return this.login(user);
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}

// ============================================
// FILE: src/auth/auth.controller.ts
// ============================================
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: { email: string; username: string; password: string }) {
    return this.authService.register(body.email, body.username, body.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }
}

// ============================================
// FILE: src/auth/jwt.strategy.ts
// ============================================
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}

// ============================================
// FILE: src/auth/jwt-auth.guard.ts
// ============================================
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// ============================================
// FILE: src/users/users.module.ts
// ============================================
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

// ============================================
// FILE: src/users/users.service.ts
// ============================================
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(email: string, username: string, password: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = this.usersRepository.create({ email, username, password });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }
}

// ============================================
// FILE: src/users/users.controller.ts
// ============================================
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }
}

// ============================================
// FILE: src/users/entities/user.entity.ts
// ============================================
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Post } from '../../posts/entities/post.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}

// ============================================
// FILE: src/posts/posts.module.ts
// ============================================
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}

// ============================================
// FILE: src/posts/posts.service.ts
// ============================================
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(title: string, content: string, authorId: string): Promise<Post> {
    const post = this.postsRepository.create({ title, content, authorId });
    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({ where: { published: true } });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(id: string, title: string, content: string, userId: string): Promise<Post> {
    const post = await this.findOne(id);
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }
    post.title = title;
    post.content = content;
    return this.postsRepository.save(post);
  }

  async publish(id: string, userId: string): Promise<Post> {
    const post = await this.findOne(id);
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only publish your own posts');
    }
    post.published = true;
    return this.postsRepository.save(post);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.findOne(id);
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    await this.postsRepository.remove(post);
  }

  async findUserPosts(userId: string): Promise<Post[]> {
    return this.postsRepository.find({ where: { authorId: userId } });
  }
}

// ============================================
// FILE: src/posts/posts.controller.ts
// ============================================
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  async create(
    @Body() body: { title: string; content: string },
    @Request() req,
  ) {
    return this.postsService.create(body.title, body.content, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published posts' })
  async findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by id' })
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  async update(
    @Param('id') id: string,
    @Body() body: { title: string; content: string },
    @Request() req,
  ) {
    return this.postsService.update(id, body.title, body.content, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a post' })
  async publish(@Param('id') id: string, @Request() req) {
    return this.postsService.publish(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.postsService.remove(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('user/my-posts')
  @ApiOperation({ summary: 'Get current user posts' })
  async getMyPosts(@Request() req) {
    return this.postsService.findUserPosts(req.user.userId);
  }
}

// ============================================
// FILE: src/posts/entities/post.entity.ts
// ============================================
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.posts, { eager: true })
  author: User;

  @Column()
  authorId: string;
}

// ============================================
// FILE: package.json
// ============================================
{
  "name": "blog-api",
  "version": "1.0.0",
  "description": "Blog API with NestJS and PostgreSQL",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/config": "^3.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^3.0.8",
    "@types/bcrypt": "^5.0.0",
    "typescript": "^5.0.0"
  }
}

// ============================================
// FILE: tsconfig.json
// ============================================
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}

// ============================================
// FILE: nest-cli.json
// ============================================
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src"
}

// ============================================
// FILE: .env
// ============================================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=blog_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

// ============================================
// FILE: .gitignore
// ============================================
# dependencies
/node_modules

# production
/dist
/build

# env
.env
.env.local

# logs
*.log
npm-debug.log*

# misc
.DS_Store
*.pem

// ============================================
// FILE: README.md
// ============================================
# Blog API - NestJS Project

A complete REST API for a blogging platform built with NestJS, TypeORM, and PostgreSQL.

## Features
- 🔐 JWT Authentication
- 👤 User Management
- 📝 Blog Posts CRUD
- 🔒 Protected Routes
- 📚 Swagger Documentation
- 🗄️ PostgreSQL Database

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup PostgreSQL Database
```bash
# Using Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Or install PostgreSQL locally
```

### 3. Configure Environment
Create `.env` file in root directory:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=blog_db
JWT_SECRET=your-secret-key
```

### 4. Run the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 5. Access API Documentation
Open browser: http://localhost:3000/api

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/profile` - Get user profile (Protected)

### Posts
- `POST /posts` - Create post (Protected)
- `GET /posts` - Get all published posts
- `GET /posts/:id` - Get single post
- `PATCH /posts/:id` - Update post (Protected)
- `PATCH /posts/:id/publish` - Publish post (Protected)
- `DELETE /posts/:id` - Delete post (Protected)
- `GET /posts/user/my-posts` - Get user's posts (Protected)

## Project Structure
```
src/
├── auth/           # Authentication module
├── users/          # Users module
├── posts/          # Posts module
├── app.module.ts   # Root module
└── main.ts         # Application entry point
```

## Technologies Used
- NestJS
- TypeORM
- PostgreSQL
- JWT
- Swagger
- Bcrypt

## License
MIT