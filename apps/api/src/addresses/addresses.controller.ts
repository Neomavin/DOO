import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user addresses' })
  async findByUser(@Request() req) {
    return this.addressesService.findByUser(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create address' })
  async create(@Request() req, @Body() body: any) {
    return this.addressesService.create(req.user.id, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  async update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.addressesService.update(id, req.user.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  async delete(@Request() req, @Param('id') id: string) {
    return this.addressesService.delete(id, req.user.id);
  }
}
