# Flawed Dev Blog Codebase

This document contains the complete code for the `flawed-dev-blog` project, separated into backend and frontend sections.

---

## 1. Backend (NestJS)

### `backend/package.json`
```json
{
  "name": "flawed-backend",
  "version": "0.0.1",
  "description": "A flawed NestJS backend for assessment.",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.2",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.11.5",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.20"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "ts-loader": "^9.4.3",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  }
}
```

### `backend/src/app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { User } from './users/user.entity';
import { Post } from './posts/post.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password', // Change as needed
      database: 'flawed_dev_blog',
      entities: [User, Post],
      synchronize: true, // Not for production!
    }),
    AuthModule,
    UsersModule,
    PostsModule,
  ],
})
export class AppModule {}
```

### `backend/src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  // FLAW: Improper error handling - No detailed exception filters configured.
  // FLAW: Missing basic security headers (would need helmet or similar).

  await app.listen(3001);
}
bootstrap();
```

### `backend/src/auth/auth.controller.ts`
```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: Record<string, any>) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
```

### `backend/src/auth/auth.service.ts`
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userDto: any) {
    return this.usersService.create(userDto);
  }
}
```

### `backend/src/posts/dto/create-post.dto.ts`
```typescript
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  // FLAW: Validation Bug - Content can be empty, which shouldn't be allowed.
  @IsString()
  @IsOptional()
  content: string;
}
```

### `backend/src/posts/posts.controller.ts`
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req) {
    return this.postsService.create(createPostDto, req.user);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Req() req) {
    return this.postsService.update(+id, updatePostDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    // FLAW: Bad redirection bug trigger - returns nothing on success
    return this.postsService.remove(+id, req.user);
  }
}
```

### `backend/src/posts/posts.service.ts`
```typescript
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from '../users/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  create(createPostDto: CreatePostDto, user: User) {
    const post = this.postsRepository.create({
      ...createPostDto,
      author: user,
    });
    return this.postsRepository.save(post);
  }

  findAll() {
    // FLAW: API Bug - Returns all posts, including drafts, not just published ones.
    return this.postsRepository.find({ relations: ['author'] });
  }

  findOne(id: number) {
    return this.postsRepository.findOne({ where: { id }, relations: ['author'] });
  }

  async update(id: number, updatePostDto: UpdatePostDto, user: User) {
    const post = await this.findOne(id);
    if (!post) {
      throw new NotFoundException();
    }
    
    // FLAW: IDOR - No check to see if the user owns the post.
    // A correct implementation would have a check like:
    // if (post.author.id !== user.id) {
    //   throw new UnauthorizedException();
    // }

    Object.assign(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  async remove(id: number, user: User) {
    const post = await this.findOne(id);
    if (!post) {
        throw new NotFoundException();
    }
    if (post.author.id !== user.id) {
        throw new UnauthorizedException();
    }
    await this.postsRepository.delete(id);
    // Returns nothing, causing frontend to handle redirection poorly.
  }
}
```

### `backend/src/users/users.controller.ts`
```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // FLAW: Sensitive Data Exposure - This endpoint returns the user hash.
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOneById(+id);
    }
}
```

### `backend/src/users/users.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    
    const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
    });
    
    const savedUser = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser;
    return result;
  }

  findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }
  
  // This method intentionally returns the full user object, including the hash.
  findOneById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
```

---

## 2. Frontend (Next.js)

### `frontend/package.json`
```json
{
  "name": "flawed-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "postcss": "^8",
    "tailwindcss": "^3.4.1"
  }
}
```

### `frontend/pages/index.js`
```javascript
import axios from 'axios';
import Link from 'next/link';

export default function HomePage({ posts }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Dev-Blog</h1>
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="p-4 border rounded shadow">
            <Link href={`/posts/${post.id}`}>
              <h2 className="text-2xl font-bold hover:text-blue-600">{post.title}</h2>
            </Link>
            <p className="text-gray-600">by {post.author?.email || 'Unknown'}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        {/* FLAW: Pagination Bug - This is hardcoded and doesn't reflect reality. */}
        <p>Page 1 of 1</p>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const res = await axios.get('http://localhost:3001/posts');
    return { props: { posts: res.data } };
  } catch (error) {
    return { props: { posts: [] } };
  }
}
```

### `frontend/pages/posts/[id].js`
```javascript
import axios from 'axios';

export default function PostPage({ post }) {
  if (!post) return <p>Post not found.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-600 mb-4">by {post.author?.email}</p>
      
      {/* FLAW: Stored XSS - Content is rendered without sanitization. */}
      <div 
        className="prose lg:prose-xl" 
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const { id } = context.params;
    const res = await axios.get(`http://localhost:3001/posts/${id}`);
    return { props: { post: res.data } };
  } catch (error) {
    return { props: { post: null } };
  }
}
```

### `frontend/pages/posts/edit/[id].js`
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function EditPostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Fetch post data on component mount
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:3001/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        setTitle(res.data.title);
        setContent(res.data.content);
    })
    .catch(err => {
        // This is where the IDOR flaw can be seen.
        // Even if the post belongs to another user, the API returns it.
        console.error("Could not fetch post, but API might have returned it anyway.", err);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        // IDOR vulnerability is triggered here if a user edits another user's post URL
        await axios.patch(`http://localhost:3001/posts/${id}`, 
            { title, content },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        router.push(`/posts/${id}`);
    } catch (err) {
        console.error("Failed to update post", err);
        alert("Failed to update post. Check console.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const token = localStorage.getItem('token');
    try {
        await axios.delete(`http://localhost:3001/posts/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // FLAW: Bad Redirection Bug - Pushing to a page that doesn't exist.
        router.push('/post-deleted-successfully');
    } catch (err) {
        console.error("Failed to delete post", err);
        alert("Failed to delete post.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Edit Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content (HTML allowed)</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="10" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
        <div className="flex justify-between">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Changes</button>
            {/* FLAW: UI/UX Bug - Delete button has primary action styling. */}
            <button type="button" onClick={handleDelete} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Delete Post</button>
        </div>
      </form>
    </div>
  );
}
