import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Post } from 'generated/prisma';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        published: createPostDto.published || false,
        author: {
          connect: { id: user.id },
        },
      },
    });

    return post;
  }

  findAll(): Promise<Post[]> {
    // FLAW: API Bug - Returns all posts, including drafts, not just published ones.
    return this.prisma.post.findMany({ 
      include: { author: true },
    });
  }

  findOne(id: number): Promise<Post | null> {
    return this.prisma.post.findUnique({ 
      where: { id }, 
      include: { author: true },
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto, user: User) {
    const post = await this.findOne(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    // FLAW: IDOR - No check to see if the user owns the post.
    // A correct implementation would have a check like:
    if (post.authorId !== user.id) {
      throw new UnauthorizedException('You are not authorized to update this post.');
    }

    Object.assign(post, updatePostDto);
    return this.prisma.post.update({
      where: { id },
      data: {
        title: post.title,
        content: post.content,
        published: post.published,
      },
      include: { author: true }, // Include author information in the response
    })
  }

  async remove(id: number, user: User): Promise<void> {
    const post = await this.findOne(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    if (post.authorId !== user.id) {
      throw new UnauthorizedException('You are not authorized to delete this post.');
    }
    await this.prisma.post.delete({
      where: { id },
    });
    // Returns nothing, causing frontend to handle redirection poorly.
  }
}