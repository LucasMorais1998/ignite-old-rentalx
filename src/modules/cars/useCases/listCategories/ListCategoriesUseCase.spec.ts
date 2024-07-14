import { CategoriesRepositoryInMemory } from '@modules/cars/repositories/in-memory/CategoriesRepositoryInMemory';
import { makeCategory } from '@shared/__tests__/factories/makeCategories';
import { ListCategoriesUseCase } from './ListCategoriesUseCase';

let listCategoriesUseCase: ListCategoriesUseCase;
let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;

describe('List Categories Use Case', () => {
  beforeEach(() => {
    categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();

    categoriesRepositoryInMemory = ({
      list: jest.fn(),
    } as unknown) as CategoriesRepositoryInMemory;

    listCategoriesUseCase = new ListCategoriesUseCase(
      categoriesRepositoryInMemory
    );
  });

  it('should be able to list categories', async () => {
    const expectedCategories = [makeCategory(), makeCategory()];

    (<jest.Mock>categoriesRepositoryInMemory.list).mockResolvedValue(
      expectedCategories
    );

    const result = await listCategoriesUseCase.execute();

    expect(categoriesRepositoryInMemory.list).toHaveBeenCalled();
    expect(result).toEqual(expectedCategories);
    expect(result).toHaveLength(2);
  });

  it('should return an empty list if there are no categories', async () => {
    (<jest.Mock>categoriesRepositoryInMemory.list).mockResolvedValue([]);

    const result = await listCategoriesUseCase.execute();

    expect(categoriesRepositoryInMemory.list).toHaveBeenCalled();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
