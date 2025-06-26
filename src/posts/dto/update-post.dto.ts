import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";


export class UpdatePostDto {
    @ApiPropertyOptional({ 
        description: 'New title of the post', 
        minLength: 1, 
        maxLength: 255 
    })
    @IsOptional()
    @IsString()
    @Length(1, 255)
    title?: string;

    @ApiPropertyOptional({ 
        description: 'New content of the post' 
    })
    @IsOptional()
    @IsString()
    content?: string;
}