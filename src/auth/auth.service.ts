import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, Note } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from 'argon2';
import { AuthDTO } from "./dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()

export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService, 
        private configService: ConfigService, 
    ){

    }
    async signup(authDTO: AuthDTO){
        const hashedPassword = await argon.hash(authDTO.password)
        try {
            const user = await this.prismaService.user.create({
                data: {
                    email: authDTO.email,
                    hashedPassword,
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                }
            })

            return this.signToken(user.id, user.email);
        } catch (err) {
            if(err.code == 'P2002') {
                throw new ForbiddenException('This email already exists')
            }
        }
    }

    async login(authDTO: AuthDTO){
        const user = await this.prismaService.user.findUnique({
            where: {
                email: authDTO.email,    
            }
        })
        if(!user) {
            throw new ForbiddenException('User not found')
        }

        const passwordMatched = await argon.verify(
            user.hashedPassword,
            authDTO.password
        )

        if(!passwordMatched) {
            throw new ForbiddenException('Incorrect password')
        }

        return this.signToken(user.id, user.email);
    }

    async signToken(userId: number, email: string): Promise<{access_token: string}> {
        const payload = {
            sub: userId,
            email
        }

        const secret = this.configService.get('JWT_SECRET')

        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '15m',
            secret: secret,
        })
        
        return {
            access_token: token
        }
    }
}