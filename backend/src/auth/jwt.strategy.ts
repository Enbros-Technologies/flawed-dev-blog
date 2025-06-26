import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret, 
    });
  }

  async validate(payload: any) {
    // This method is called after the token is successfully decoded and verified.
    // The 'payload' contains the data you signed into the token (e.g., sub, email).

    // You can fetch the user from the database based on the payload's sub (user ID)
    // to ensure the user still exists and is active.
    const user = await this.usersService.findOneById(payload.sub); // Assuming payload.sub is the user ID

    if (!user) {
      throw new UnauthorizedException();
    }
    // The user object returned here will be attached to the `req.user` object in your controllers.
    return user;
  }
}