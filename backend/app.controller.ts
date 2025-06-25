
import { Controller, Get, Post, Body, Param, Put, Delete, Session } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('login')
  login(@Body() body: any, @Session() session: Record<string, any>) {
    return this.appService.login(body, session);
  }

  @Get('posts')
  getPosts() {
    return this.appService.getPosts();
  }

  @Post('posts')
  createPost(@Body() body: any, @Session() session: Record<string, any>) {
    return this.appService.createPost(body, session.userId);
  }

  @Put('posts/:id')
  updatePost(@Param('id') id: number, @Body() body: any) {
    return this.appService.updatePost(id, body);
  }

  @Delete('posts/:id')
  deletePost(@Param('id') id: number) {
    return this.appService.deletePost(id);
  }
}
