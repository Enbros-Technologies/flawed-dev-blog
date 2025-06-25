import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { User } from '../users/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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
    if (post.author.id !== user.id) {
      throw new UnauthorizedException('You are not authorized to update this post.');
    }

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