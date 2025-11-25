import { Controller, Get, Param, Query, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all restaurants' })
  async findAll() {
    return this.restaurantsService.findAll();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured restaurants' })
  async findFeatured() {
    return this.restaurantsService.findFeatured();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search restaurants' })
  async search(@Query('q') query: string) {
    return this.restaurantsService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID' })
  async findById(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Patch(':id/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant schedule' })
  async updateSchedule(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.restaurantsService.updateSchedule(id, updateScheduleDto);
  }
}
