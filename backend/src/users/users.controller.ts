import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // FLAW: Sensitive Data Exposure - This endpoint returns the user hash.
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOneById(+id);
    }
}