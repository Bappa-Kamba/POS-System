import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto, FindAllBranchesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBranchDto: CreateBranchDto) {
    const branch = await this.branchesService.create(createBranchDto);
    return {
      success: true,
      data: branch,
      message: 'Branch created successfully',
    };
  }

  @Get()
  async findAll(@Query() findAllBranchesDto: FindAllBranchesDto) {
    const result = await this.branchesService.findAll(findAllBranchesDto);
    return {
      success: true,
      ...result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const branch = await this.branchesService.findOne(id);
    return {
      success: true,
      data: branch,
    };
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: string) {
    const statistics = await this.branchesService.getStatistics(id);
    return {
      success: true,
      data: statistics,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    const branch = await this.branchesService.update(id, updateBranchDto);
    return {
      success: true,
      data: branch,
      message: 'Branch updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const branch = await this.branchesService.remove(id);
    return {
      success: true,
      data: branch,
      message: 'Branch deleted successfully',
    };
  }
}
