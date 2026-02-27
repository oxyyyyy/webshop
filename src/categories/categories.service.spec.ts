import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories = [
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Books' },
      ];
      mockRepository.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toEqual(categories);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category if found', async () => {
      const category = { id: 1, name: 'Electronics' };
      mockRepository.findOneBy.mockResolvedValue(category);

      const result = await service.findOne(1);

      expect(result).toEqual(category);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save a category', async () => {
      const dto = { name: 'Electronics' };
      const category = { id: 1, ...dto };

      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(category);
      mockRepository.save.mockResolvedValue(category);

      const result = await service.create(dto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        name: 'Electronics',
      });
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(category);
      expect(result).toEqual(category);
    });

    it('should throw ConflictException if category name already exists', async () => {
      const dto = { name: 'Electronics' };
      mockRepository.findOneBy.mockResolvedValue({ id: 1, ...dto });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update and return the category', async () => {
      const existing = { id: 1, name: 'Electronics' };
      const updated = { id: 1, name: 'Tech' };

      mockRepository.findOneBy
        .mockResolvedValueOnce(existing) // findOne check
        .mockResolvedValueOnce(updated); // findOne after update
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, { name: 'Tech' });

      expect(mockRepository.update).toHaveBeenCalledWith(1, { name: 'Tech' });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Tech' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a category if it exists', async () => {
      mockRepository.findOneBy.mockResolvedValue({
        id: 1,
        name: 'Electronics',
      });
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
