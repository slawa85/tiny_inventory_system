import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.findOne(id);
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storesService.remove(id);
  }
}
