import { IsString, IsInt, IsOptional, IsBoolean, IsDateString, IsIn, Min, Max, MinLength } from 'class-validator';

export class CompleteProfileDto {
    // Basic Info
    @IsString()
    @MinLength(3)
    username: string;  // User chooses their username

    @IsString()
    @IsOptional()
    name?: string;

    @IsInt()
    @Min(18)
    @Max(100)
    @IsOptional()
    age?: number;

    @IsString()
    @IsOptional()
    bio?: string;

    // Preferences
    @IsString()
    @IsOptional()
    location?: string;

    @IsDateString()
    @IsOptional()
    moveInDate?: string;

    @IsInt()
    @IsOptional()
    budget?: number;

    @IsString()
    @IsOptional()
    @IsIn(['EUR', 'USD', 'MAD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'])
    currency?: string;

    // Lifestyle
    @IsBoolean()
    @IsOptional()
    smoker?: boolean;

    @IsBoolean()
    @IsOptional()
    quietHours?: boolean;

    @IsBoolean()
    @IsOptional()
    earlyBird?: boolean;

    @IsBoolean()
    @IsOptional()
    nightOwl?: boolean;

    @IsBoolean()
    @IsOptional()
    petFriendly?: boolean;

    @IsBoolean()
    @IsOptional()
    cooks?: boolean;

    @IsBoolean()
    @IsOptional()
    gamer?: boolean;

    @IsBoolean()
    @IsOptional()
    social?: boolean;

    @IsBoolean()
    @IsOptional()
    studious?: boolean;

    @IsBoolean()
    @IsOptional()
    clean?: boolean;
}
