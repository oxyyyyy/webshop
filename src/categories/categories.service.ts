import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async create(data: Partial<Category>): Promise<Category> {
    const existingCategory = await this.categoriesRepository.findOneBy({
      name: data.name,
    });
    if (existingCategory) {
      throw new ConflictException(
        `Category with name "${data.name}" already exists`,
      );
    }
    const category = this.categoriesRepository.create(data);
    return this.categoriesRepository.save(category);
  }

  async update(id: number, data: Partial<Category>): Promise<Category> {
    await this.findOne(id); // throws if not found
    await this.categoriesRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // throws if not found
    await this.categoriesRepository.delete(id);
  }
}
