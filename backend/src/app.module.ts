import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Post } from './posts/post.entity';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

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