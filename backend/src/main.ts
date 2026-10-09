import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    // Enable CORS for local dev and production domains
    app.enableCors({
        origin: [
            'http://localhost:4200',
            'https://doodle.deibert.me',
            process.env.FRONTEND_URL || 'http://localhost:4200'
        ],
        credentials: true
    })

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true
        })
    )

    const port = process.env.PORT || 3000
    await app.listen(port, '127.0.0.1')
    console.log(`🚀 Server running on http://127.0.0.1:${port}`)
}

bootstrap()
