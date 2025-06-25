
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async login(body: any, session: any) {
    const { email, password } = body;
    const user = await this.userRepo.findOneBy({ email, password });
    if (user) {
      session.userId = user.id;
      return { success: true };
    }
    return { success: false };
  }

  getPosts() {
    return this.postRepo.find(); // Includes drafts (bug)
  }

  createPost(body: any, userId: number) {
    const post = this.postRepo.create({ ...body, userId });
    return this.postRepo.save(post);
  }

  updatePost(id: number, body: any) {
    return this.postRepo.update(id, body); // No auth check (IDOR)
  }

  deletePost(id: number) {
    return this.postRepo.delete(id); // No auth check (IDOR)
  }
}
