//make a db for testing
//Everytime we run test, clean up data
//We must call request like we do with Postman
/**
Open prisma studio on "TEST" db
npx dotenv -e .env.test -- prisma studio

Open prisma studio on "TEST" db
npx dotenv -e .env -- prisma studio
*/
import {Test} from '@nestjs/testing'
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';

const PORT = 3334
describe('App EndToEnd tests', () => {
  let app: INestApplication
  let prismaService: PrismaService
  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = appModule.createNestApplication()
    app.useGlobalPipes(new ValidationPipe());
    await app.init()
    await app.listen(PORT)
    prismaService = app.get(PrismaService)
    await prismaService.cleanDatabase()
    pactum.request.setBaseUrl(`http://localhost:${PORT}`)
  })

  describe('Test Authentication', () => {
    describe('Signup', () => {
      it('should show error with empty email', () => {
        return pactum.spec()
          .post(`/auth/signup`)
          .withBody({
            email: '',
            password: 'a123'
          })
          .expectStatus(400)
          // .inspect()
      })
      it('should show error with invalid email format', () => {
        return pactum.spec()
          .post(`/auth/signup`)
          .withBody({
            email: 'testmail@gamil',
            password: 'a123'
          })
          .expectStatus(400)
          // .inspect()
      })
      it('should show error if password is empty', () => {
        return pactum.spec()
          .post(`/auth/signup`)
          .withBody({
            email: 'testmail@gamil.com',
            password: ''
          })
          .expectStatus(400)
          // .inspect()
      })
    })

    describe('Signup', () => {
      it('should Signup', () => {
        return pactum.spec()
          .post(`/auth/signup`)
          .withBody({
            email: 'testemail1@gmail.com',
            password: 'a123'
          })
          .expectStatus(201)
          // .inspect()
      })
    })

    describe('Login', () => {
      it('should Login', () => {
        return pactum.spec()
          .post(`/auth/login`)
          .withBody({
            email: 'testemail1@gmail.com',
            password: 'a123'
          })
          .expectStatus(201)
          // .inspect()
          .stores('access_token', 'access_token')
      })
    })
    describe('User', () => {
      describe('Get Detail User', () => {
        it('should get detail user', () => {
          return pactum.spec()
            .get(`/user/me`)
            .withHeaders({
              Authorization: 'Bearer $S{access_token}'
            })
            .expectStatus(200)
            // .inspect()
        })
      })
    })
  })

  afterAll(async () => {
    app.close()
  })
  it.todo('should PASS');
})

