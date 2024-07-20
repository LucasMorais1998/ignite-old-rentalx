import { CategoriesRepositoryInMemory } from '@modules/cars/repositories/in-memory/CategoriesRepositoryInMemory';
import { makeCategory } from '@shared/__tests__/factories/makeCategories';
import { ImportCategoryUseCase } from './ImportCategoryUseCase';

let importCategoryUseCase: ImportCategoryUseCase;
let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;

describe('Import Category Use Case', () => {
  beforeEach(() => {
    categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();

    categoriesRepositoryInMemory = ({
      findByName: jest.fn(),
      create: jest.fn(),
    } as unknown) as CategoriesRepositoryInMemory;

    importCategoryUseCase = new ImportCategoryUseCase(
      categoriesRepositoryInMemory
    );
  });

  it('should be able to import categories', async () => {
    const newCategories = [
      {
        name: 'Category Test 1',
        description: 'Category description test 1',
      },
      {
        name: 'Category Test 2',
        description: 'Category description test 2',
      },
      {
        name: 'Category Test 3',
        description: 'Category description test 3',
      },
    ];

    const newImportedCategories = [
      makeCategory(newCategories[0]),
      makeCategory(newCategories[1]),
      makeCategory(newCategories[2]),
    ];

    jest
      .spyOn(importCategoryUseCase as any, 'loadCategories')
      .mockResolvedValue(newCategories);

    (<jest.Mock>categoriesRepositoryInMemory.findByName).mockResolvedValue(
      null
    );

    (<jest.Mock>categoriesRepositoryInMemory.create).mockResolvedValue(
      newImportedCategories
    );

    await importCategoryUseCase.execute({
      path: 'fake/path/to/fake-file.csv',
    } as Express.Multer.File);

    newCategories.forEach((category) => {
      expect(categoriesRepositoryInMemory.findByName).toHaveBeenCalledWith(
        category.name
      );
    });

    newCategories.forEach((category) => {
      expect(categoriesRepositoryInMemory.create).toHaveBeenCalledWith(
        category
      );
    });
  });

  it('should not import existing categories', async () => {
    const existingCategories = [
      {
        name: 'Category Test 1',
        description: 'Category description test 1',
      },
      {
        name: 'Category Test 2',
        description: 'Category description test 2',
      },
      {
        name: 'Category Test 3',
        description: 'Category description test 3',
      },
    ];

    jest
      .spyOn(importCategoryUseCase as any, 'loadCategories')
      .mockResolvedValue(existingCategories);

    (<jest.Mock>categoriesRepositoryInMemory.findByName).mockResolvedValue({});

    (<jest.Mock>categoriesRepositoryInMemory.create).mockResolvedValue(
      undefined
    );

    await importCategoryUseCase.execute({
      path: 'fake/path/to/fake-file.csv',
    } as Express.Multer.File);

    existingCategories.forEach((category) => {
      expect(categoriesRepositoryInMemory.findByName).toHaveBeenCalledWith(
        category.name
      );
    });

    existingCategories.forEach((category) => {
      expect(categoriesRepositoryInMemory.create).not.toHaveBeenCalledWith(
        category
      );
    });
  });
});
