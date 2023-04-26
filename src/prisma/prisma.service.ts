import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(configService: ConfigService) {
        super({
            datasources: {
                db: {
                    // url: "postgresql://postgres:123@localhost:5434/mydb?schema=public"
                    url: configService.get('DATABASE_URL')
                    
                }
            }
        })
        // console.log('configService: '+ JSON.stringify(configService.get('DATABASE_URL')));
    }
    cleanDatabase() {
        console.log('cleanDatabase');
        
        return this.$transaction([
            this.user.deleteMany(),
            this.note.deleteMany()
        ])
    }
}
