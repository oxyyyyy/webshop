import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/product.entity';
import { OrderItem } from './order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  findAll(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items'],
    });
  }

  async findOne(id: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async create(
    payload: {
      items: [{ productId: number; quantity: number }];
    },
    userId: number,
  ): Promise<Order> {
    const orderItems: OrderItem[] = [];
    for (const item of payload.items) {
      const product = await this.productRepository.findOneBy({
        id: item.productId,
      });
      const stock = product?.stock;
      const price = product?.price;

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      if (stock === undefined || stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product with ID ${item.productId}`,
        );
      }

      product.stock = product.stock - item.quantity;
      await this.productRepository.save(product);

      const orderItem = this.orderItemRepository.create({
        product,
        quantity: item.quantity,
        price: price || 0,
      });
      orderItems.push(orderItem);
    }

    const order = this.orderRepository.create({
      items: orderItems,
      total: orderItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      user: { id: userId },
    });
    return this.orderRepository.save(order);
  }
}
