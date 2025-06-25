import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsController } from "./posts.controller";
import { Post } from "./post.entity";
import { UsersModule } from "src/users/users.module";


@Module({
    imports: [
        TypeOrmModule.forFeature([Post]),
        UsersModule,
    ],
    controllers: [PostsController],
    providers: [PostsService]
})

export class PostsModule {}