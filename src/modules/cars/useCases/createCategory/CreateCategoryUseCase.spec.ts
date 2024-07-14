import { CategoriesRepositoryInMemory } from '@modules/cars/repositories/in-memory/CategoriesRepositoryInMemory';
import { makeCategory } from '@shared/__tests__/factories/makeCategories';
import { AppError } from '@shared/errors/AppError';
import { CreateCategoryUseCase } from './CreateCategoryUseCase';

let createCategoryUseCase: CreateCategoryUseCase;
let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;

describe('Create Category Use Case', () => {
  beforeEach(() => {
    categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();

    categoriesRepositoryInMemory = ({
      create: jest.fn(),
      findByName: jest.fn(),
    } as unknown) as CategoriesRepositoryInMemory;

    createCategoryUseCase = new CreateCategoryUseCase(
      categoriesRepositoryInMemory
    );
  });

  it('should be able to create a new category', async () => {
    const newCategory = {
      name: 'Category Test',
      description: 'Category description test',
    };

    const newCategoryCreated = makeCategory(newCategory);

    (<jest.Mock>categoriesRepositoryInMemory.create).mockResolvedValue(
      newCategoryCreated
    );

    await createCategoryUseCase.execute(newCategory);

    expect(categoriesRepositoryInMemory.create).toHaveBeenCalledWith({
      name: newCategory.name,
      description: newCategory.description,
    });
  });

  it('should not be able to create a new category with a name that already exists', async () => {
    expect(async () => {
      const newCategory = {
        name: 'Category Test',
        description: 'Category description test',
      };

      const existingCategory = makeCategory(newCategory);

      (<jest.Mock>categoriesRepositoryInMemory.findByName).mockResolvedValue(
        existingCategory
      );

      await createCategoryUseCase.execute(newCategory);
    }).rejects.toBeInstanceOf(AppError);
  });

  it.each([[''], [undefined], [null]])(
    'should not be able to create a new category if name is %p',
    async (categoryName: any) => {
      await expect(
        createCategoryUseCase.execute({
          name: categoryName,
          description: 'Category description test',
        })
      ).rejects.toBeInstanceOf(AppError);
    }
  );

  it.each([[''], [undefined], [null]])(
    'should not be able to create a new category if description is %p',
    async (categoryDescription: any) => {
      await expect(
        createCategoryUseCase.execute({
          name: 'Category Test',
          description: categoryDescription,
        })
      ).rejects.toBeInstanceOf(AppError);
    }
  );
});
