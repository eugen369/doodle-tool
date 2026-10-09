import { IsString, IsOptional, IsArray, IsISO8601, MinLength } from 'class-validator'

export class CreatePollDto {
    @IsString()
    @MinLength(3)
    title!: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsString()
    timezone?: string = 'UTC'

    @IsArray()
    slots!: Array<{
        startsAt: string // ISO8601
        endsAt?: string
    }>
}

export class CreateUserSessionDto {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    timezone?: string
}
