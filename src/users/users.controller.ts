import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // FLAW: Sensitive Data Exposure - This endpoint returns the user hash.
    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a single user by ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'The user details (excluding sensitive information).',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found.',
    })
    findOne(@Param('id') id: string) {
        return this.usersService.findOneById(+id);
    }
}