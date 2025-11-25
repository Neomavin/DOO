import { IsString, IsIn, IsOptional } from 'class-validator';

export class UpdateProductStatusDto {
    @IsString()
    @IsIn(['PENDING', 'APPROVED', 'REJECTED'], {
        message: 'Status must be PENDING, APPROVED, or REJECTED',
    })
    status: string;

    @IsOptional()
    @IsString()
    rejectionReason?: string;
}
