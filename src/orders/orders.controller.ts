import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard, JwtPayload } from 'src/auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: Request & { user: JwtPayload },
    @Body() body: CreateOrderDto,
  ) {
    return this.ordersService.create(body, req.user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: Request & { user: JwtPayload }) {
    return this.ordersService.findAll(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Req() req: Request & { user: JwtPayload }, @Param('id') id: number) {
    return this.ordersService.findOne(id, req.user.sub);
  }
}
