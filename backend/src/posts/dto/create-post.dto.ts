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