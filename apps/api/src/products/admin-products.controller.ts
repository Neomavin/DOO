import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';

@ApiTags('admin-products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/products')
export class AdminProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @ApiOperation({ summary: 'List products filtered by status' })
    async list(@Query('status') status?: string) {
        // Use service method to fetch products by status (admin view)
        return this.productsService.findByStatus(status);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Approve or reject a product' })
    async updateStatus(@Param('id') id: string, @Body() dto: UpdateProductStatusDto) {
        return this.productsService.updateStatus(id, dto.status, dto.rejectionReason);
    }
}
