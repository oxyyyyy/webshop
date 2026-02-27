import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const query = { page: 1, limit: 10 };
      const expected = {
        data: [{ id: 1 }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockProductsService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(result).toEqual(expected);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = { id: 1, name: 'Keyboard', price: 79.99 };
      mockProductsService.findOne.mockResolvedValue(product);

      const result = await controller.findOne(1);

      expect(result).toEqual(product);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = { name: 'Mouse', description: 'Wireless', price: 29.99 };
      const product = { id: 1, ...dto };
      mockProductsService.create.mockResolvedValue(product);

      const result = await controller.create(dto);

      expect(result).toEqual(product);
      expect(mockProductsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updated = {
        id: 1,
        name: 'Keyboard',
        description: 'Mechanical',
        price: 89.99,
      };
      mockProductsService.update.mockResolvedValue(updated);

      const result = await controller.update(1, { price: 89.99 });

      expect(result).toEqual(updated);
      expect(mockProductsService.update).toHaveBeenCalledWith(1, {
        price: 89.99,
      });
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      mockProductsService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockProductsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
