import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(params: ProductQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      sort = 'id',
      order = 'ASC',
    } = params;

    // 1. Base query with category join
    const query = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // 2. Filters (only applied if client sent them)
    if (search) {
      query.andWhere('product.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (category) {
      query.andWhere('category.id = :category', { category });
    }

    // 3. Sorting
    query.orderBy(`product.${sort}`, order);

    // 4. Pagination
    query.skip((page - 1) * limit).take(limit);

    // 5. Execute — gets both the data and total count
    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  create(data: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(data);
    return this.productsRepository.save(product);
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    await this.findOne(id); // throws if not found
    await this.productsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // throws if not found
    await this.productsRepository.delete(id);
  }
}
