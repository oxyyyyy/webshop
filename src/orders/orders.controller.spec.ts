import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

describe('OrdersController', () => {
  let controller: OrdersController;

  const mockOrdersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  // fake request with JWT payload
  const mockRequest = (userId: number) => ({ user: { sub: userId } }) as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return orders for the authenticated user', async () => {
      const orders = [{ id: 1, total: 100 }];
      mockOrdersService.findAll.mockResolvedValue(orders);

      const result = await controller.findAll(mockRequest(42));

      expect(result).toEqual(orders);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith(42);
    });
  });

  describe('findOne', () => {
    it('should return an order by id for the authenticated user', async () => {
      const order = { id: 1, total: 100 };
      mockOrdersService.findOne.mockResolvedValue(order);

      const result = await controller.findOne(mockRequest(42), 1);

      expect(result).toEqual(order);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(1, 42);
    });
  });

  describe('create', () => {
    it('should create an order for the authenticated user', async () => {
      const dto = { items: [{ productId: 1, quantity: 2 }] };
      const order = { id: 1, total: 159.98 };
      mockOrdersService.create.mockResolvedValue(order);

      const result = await controller.create(mockRequest(42), dto);

      expect(result).toEqual(order);
      expect(mockOrdersService.create).toHaveBeenCalledWith(dto, 42);
    });
  });
});
