import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories = [{ id: 1, name: 'Electronics' }];
      mockCategoriesService.findAll.mockResolvedValue(categories);

      const result = await controller.findAll();

      expect(result).toEqual(categories);
      expect(mockCategoriesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const category = { id: 1, name: 'Electronics' };
      mockCategoriesService.findOne.mockResolvedValue(category);

      const result = await controller.findOne(1);

      expect(result).toEqual(category);
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto = { name: 'Sports' };
      const category = { id: 5, ...dto };
      mockCategoriesService.create.mockResolvedValue(category);

      const result = await controller.create(dto);

      expect(result).toEqual(category);
      expect(mockCategoriesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updated = { id: 1, name: 'Tech' };
      mockCategoriesService.update.mockResolvedValue(updated);

      const result = await controller.update(1, { name: 'Tech' });

      expect(result).toEqual(updated);
      expect(mockCategoriesService.update).toHaveBeenCalledWith(1, {
        name: 'Tech',
      });
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      mockCategoriesService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockCategoriesService.remove).toHaveBeenCalledWith(1);
    });
  });
});
