import {
  Controller,
  Get,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { ProcessosService } from './processos.service';
import { ListProcessosQueryDto } from './dto/list-processos-query.dto';
import { ListProcessosResponseDto } from './dto/list-processos-response.dto';
import { ProcessoDetailDto } from './dto/processo-detail.dto';

@Controller('processos')
export class ProcessosController {
  constructor(private readonly processosService: ProcessosService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  listProcessos(
    @Query() query: ListProcessosQueryDto,
  ): ListProcessosResponseDto {
    try {
      return this.processosService.listProcessos(query);
    } catch (error) {
      throw new BadRequestException({
        code: 'INVALID_PARAMETER',
        message: error.message,
      });
    }
  }

  @Get(':numeroProcesso')
  getProcessoDetail(
    @Param('numeroProcesso') numeroProcesso: string,
  ): ProcessoDetailDto {
    return this.processosService.getProcessoDetail(numeroProcesso);
  }
}
