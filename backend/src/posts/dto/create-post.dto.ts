import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The title of the post',
    })
  title: string;

  // FLAW: Validation Bug - Content can be empty, which shouldn't be allowed.
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The content of the post',
  })
  content: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if the post is published',
    default: false,
  })
  published?: boolean;
}