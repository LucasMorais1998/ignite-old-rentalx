import { SpecificationsRepositoryInMemory } from '@modules/cars/repositories/in-memory/SpecificationsRepositoryInMemory';
import { makeSpecification } from '@shared/__tests__/factories/makeSpecification';
import { AppError } from '@shared/errors/AppError';
import { CreateSpecificationUseCase } from './CreateSpecificationUseCase';

let createSpecificationUseCase: CreateSpecificationUseCase;
let specificationsRepositoryInMemory: SpecificationsRepositoryInMemory;

describe('Create Specification Use Case', () => {
  beforeEach(() => {
    specificationsRepositoryInMemory = new SpecificationsRepositoryInMemory();

    specificationsRepositoryInMemory = ({
      findByName: jest.fn(),
      create: jest.fn(),
    } as unknown) as SpecificationsRepositoryInMemory;

    createSpecificationUseCase = new CreateSpecificationUseCase(
      specificationsRepositoryInMemory
    );
  });

  it('should be able to create a new specification', async () => {
    const newSpecification = {
      name: 'Specification Test',
      description: 'Specification description test',
    };

    const newSpecificationCreated = makeSpecification(newSpecification);

    (<jest.Mock>specificationsRepositoryInMemory.create).mockResolvedValue(
      newSpecificationCreated
    );

    await createSpecificationUseCase.execute(newSpecification);

    expect(specificationsRepositoryInMemory.create).toHaveBeenCalledWith({
      name: newSpecification.name,
      description: newSpecification.description,
    });
  });

  it('should not be able to create a new specification with a name that already exists', async () => {
    expect(async () => {
      const newSpecification = {
        name: 'Specification Test',
        description: 'Specification description test',
      };

      const existingSpecification = makeSpecification(newSpecification);

      (<jest.Mock>(
        specificationsRepositoryInMemory.findByName
      )).mockResolvedValue(existingSpecification);

      await createSpecificationUseCase.execute(newSpecification);
    }).rejects.toBeInstanceOf(AppError);
  });

  it.each([[''], [undefined], [null]])(
    'should not be able to create a new specification if name is %p',
    async (specificationName: any) => {
      await expect(
        createSpecificationUseCase.execute({
          name: specificationName,
          description: 'Specification description test',
        })
      ).rejects.toBeInstanceOf(AppError);
    }
  );

  it.each([[''], [undefined], [null]])(
    'should not be able to create a new specification if name is %p',
    async (specificationDescription: any) => {
      await expect(
        createSpecificationUseCase.execute({
          name: 'Specification Test',
          description: specificationDescription,
        })
      ).rejects.toBeInstanceOf(AppError);
    }
  );
});
