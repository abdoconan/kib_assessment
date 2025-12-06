import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { eq, is, or } from 'drizzle-orm';
import { DB_PROVIDER } from 'src/db/database.module';
import { User } from 'src/db/schema';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {

    constructor(@Inject(DB_PROVIDER) private db: any
                , @Inject(JwtService) private jwtService: JwtService
                , @Inject(RedisService) private redisService: RedisService
            ) {}

    async signUp(userData: CreateUserDto): Promise<UserResponseDto> {
        const { email, username, password, fullName } = userData;

        const existing = await this.db
        .select()
        .from(User)
        .where(
            or(
            eq(User.email, email),
            eq(User.username, username)
            )
        );

        if (existing.length) {
            throw new BadRequestException('email or username already exists');
        }

        const hashed = await bcrypt.hash(password, 10);
            const [inserted] = await this.db
            .insert(User)
            .values({
                email,
                username,
                password: hashed,
                fullName
            })
            .returning();
    
            const response: UserResponseDto = {
                id: inserted.id,
                email: inserted.email,
                username: inserted.username,
                fullName: inserted.fullName,
                createdAt: inserted.createdAt,
                updatedAt: inserted.updatedAt,
            };
            return response;
    }

    async login(dto: LoginDto): Promise<{ access_token: string }> {
        const { email, password } = dto;
        const key = `login:attempts:${email}`;

        const attempts = await this.redisService.get(key);
        if (attempts && parseInt(attempts) >= 5) {
        throw new UnauthorizedException("Too many login attempts. Please try again later.");
        }

        const result = await this.db
        .select()
        .from(User)
        .where(eq(User.email, email));

        if (result.length === 0) {
            await this.redisService.set(key, ((attempts ? parseInt(attempts) : 0) + 1).toString(), 3600);
            throw new UnauthorizedException("Invalid credentials");
        }

        const user = result[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            await this.redisService.set(key, ((attempts ? parseInt(attempts) : 0) + 1).toString(), 3600);
            throw new UnauthorizedException("Invalid credentials")
        }

        const payload = { sub: user.id, email: user.email, isAdmin: user.isAdmin };
        await this.redisService.del(key);
        return {
        access_token: await this.jwtService.signAsync(payload),
        };
    }

    async getAllUsers(): Promise<UserResponseDto[]> {
        return await this.db.select().from(User).execute().then((dbUsers: any[]) => {
            return dbUsers.map(({ password, ...rest }) => rest);
        });
    }

    



}
