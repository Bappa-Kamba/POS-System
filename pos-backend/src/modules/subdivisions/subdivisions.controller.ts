import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubdivisionsService } from './subdivisions.service';
import {
  CreateSubdivisionDto,
  UpdateSubdivisionDto,
  AssignSubdivisionDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subdivisions')
export class SubdivisionsController {
  constructor(private readonly subdivisionsService: SubdivisionsService) {}

  @Get()
  async findAll() {
    const subdivisions = await this.subdivisionsService.findAll();
    return {
      success: true,
      data: subdivisions,
    };
  }

  @Get('branch/:branchId')
  async findByBranch(@Param('branchId') branchId: string) {
    const subdivisions = await this.subdivisionsService.findByBranch(branchId);
    return {
      success: true,
      data: subdivisions,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const subdivision = await this.subdivisionsService.findOne(id);
    return {
      success: true,
      data: subdivision,
    };
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSubdivisionDto: CreateSubdivisionDto) {
    const subdivision =
      await this.subdivisionsService.create(createSubdivisionDto);
    return {
      success: true,
      data: subdivision,
      message: 'Subdivision created successfully',
    };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateSubdivisionDto: UpdateSubdivisionDto,
  ) {
    const subdivision = await this.subdivisionsService.update(
      id,
      updateSubdivisionDto,
    );
    return {
      success: true,
      data: subdivision,
      message: 'Subdivision updated successfully',
    };
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async toggleStatus(@Param('id') id: string) {
    const subdivision = await this.subdivisionsService.toggleStatus(id);
    return {
      success: true,
      data: subdivision,
      message: 'Subdivision status updated successfully',
    };
  }

  @Post(':id/assign-branch')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async assignToBranch(@Body() assignSubdivisionDto: AssignSubdivisionDto) {
    const branchSubdivision =
      await this.subdivisionsService.assignToBranch(assignSubdivisionDto);
    return {
      success: true,
      data: branchSubdivision,
      message: 'Subdivision assigned to branch successfully',
    };
  }

  @Delete(':id/remove-branch/:branchId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async removeFromBranch(
    @Param('id') subdivisionId: string,
    @Param('branchId') branchId: string,
  ) {
    const result = await this.subdivisionsService.removeFromBranch(
      branchId,
      subdivisionId,
    );
    return {
      success: true,
      data: result,
      message: 'Subdivision removed from branch successfully',
    };
  }

  @Get('branch/:branchId/details')
  async getBranchSubdivisions(@Param('branchId') branchId: string) {
    const subdivisions =
      await this.subdivisionsService.getBranchSubdivisions(branchId);
    return {
      success: true,
      data: subdivisions,
    };
  }
}
