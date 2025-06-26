import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('posts')
@ApiTags('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The post has been successfully created.' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unuthorized access.' 
  })
  create(@Body() createPostDto: CreatePostDto, @Req() req) {
    return this.postsService.create(createPostDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all posts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'A list of all posts.',
  })
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single post by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The post details.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post not found.',
  })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The post has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post not found.',
  })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Req() req) {
    return this.postsService.update(+id, updatePostDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT, 
    description: 'The post has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post not found.',
  })
  remove(@Param('id') id: string, @Req() req) {
    // FLAW: Bad redirection bug trigger - returns nothing on success
    return this.postsService.remove(+id, req.user);
  }
}