import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './product.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated products with defaults', async () => {
      const products = [{ id: 1, name: 'Keyboard' }];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([products, 1]);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: products,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'product.category',
        'category',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'product.id',
        'ASC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should apply search filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ search: 'key' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'product.name ILIKE :search',
        { search: '%key%' },
      );
    });

    it('should apply category filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ category: 2 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'category.id = :category',
        { category: 2 },
      );
    });

    it('should apply custom pagination and sorting', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        page: 3,
        limit: 5,
        sort: 'price',
        order: 'DESC',
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'product.price',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      const product = { id: 1, name: 'Keyboard', price: 79.99 };
      mockRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(1);

      expect(result).toEqual(product);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['category'],
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save a product', async () => {
      const dto = { name: 'Mouse', description: 'Wireless', price: 29.99 };
      const product = { id: 1, ...dto };

      mockRepository.create.mockReturnValue(product);
      mockRepository.save.mockResolvedValue(product);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(product);
      expect(result).toEqual(product);
    });
  });

  describe('update', () => {
    it('should update and return the product', async () => {
      const existing = {
        id: 1,
        name: 'Keyboard',
        description: 'Mechanical',
        price: 79.99,
      };
      const updated = { ...existing, price: 89.99 };

      mockRepository.findOne
        .mockResolvedValueOnce(existing) // findOne check in update
        .mockResolvedValueOnce(updated); // findOne after update
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, { price: 89.99 });

      expect(mockRepository.update).toHaveBeenCalledWith(1, { price: 89.99 });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { price: 10 })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a product if it exists', async () => {
      const product = { id: 1, name: 'Keyboard' };
      mockRepository.findOne.mockResolvedValue(product);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
