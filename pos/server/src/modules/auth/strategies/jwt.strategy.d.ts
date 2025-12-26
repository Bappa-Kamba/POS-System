import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { AuthenticatedRequestUser } from '../types/authenticated-user.type';
interface JwtPayload {
    sub: string;
    username: string;
    role: string;
    branchId: string;
    assignedSubdivisionId?: string | null;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: JwtPayload): Promise<AuthenticatedRequestUser>;
}
export {};
