import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Product } from 'src/products/product.entity';
import { OrderItem } from './order-item.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrderRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockProductRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  const mockOrderItemRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return orders for a user', async () => {
      const orders = [{ id: 1, total: 100 }];
      mockOrderRepository.find.mockResolvedValue(orders);

      const result = await service.findAll(1);

      expect(result).toEqual(orders);
      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['items'],
      });
    });
  });

  describe('findOne', () => {
    it('should return an order if found', async () => {
      const order = { id: 1, total: 100 };
      mockOrderRepository.findOne.mockResolvedValue(order);

      const result = await service.findOne(1, 42);

      expect(result).toEqual(order);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, user: { id: 42 } },
        relations: ['user', 'items'],
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, 42)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an order and deduct stock', async () => {
      const product = { id: 1, name: 'Keyboard', price: 79.99, stock: 10 };
      const orderItem = { product, quantity: 2, price: 79.99 };
      const order = {
        id: 1,
        items: [orderItem],
        total: 159.98,
        user: { id: 42 },
      };

      mockProductRepository.findOneBy.mockResolvedValue({ ...product });
      mockProductRepository.save.mockResolvedValue({ ...product, stock: 8 });
      mockOrderItemRepository.create.mockReturnValue(orderItem);
      mockOrderRepository.create.mockReturnValue(order);
      mockOrderRepository.save.mockResolvedValue(order);

      const result = await service.create(
        { items: [{ productId: 1, quantity: 2 }] },
        42,
      );

      expect(result).toEqual(order);
      expect(mockProductRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 8 }),
      );
      expect(mockOrderRepository.save).toHaveBeenCalledWith(order);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({ items: [{ productId: 999, quantity: 1 }] }, 42),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const product = { id: 1, name: 'Keyboard', price: 79.99, stock: 1 };
      mockProductRepository.findOneBy.mockResolvedValue(product);

      await expect(
        service.create({ items: [{ productId: 1, quantity: 5 }] }, 42),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
