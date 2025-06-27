import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ 
        description: 'The name of the user'
    })
    name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ 
        description: 'The email address of the user' 
    })
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ 
        description: 'The password of the user' 
    })
    password: string;
}