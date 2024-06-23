import { v4 as uuidV4 } from 'uuid';
import createConnection from '../index';

async function createSpecifications() {
  const connection = await createConnection('localhost');

  const specifications = [
    {
      id: uuidV4(),
      name: 'Conforto',
      description: 'Bancos de couro, sistema de aquecimento e ar condicionado de alta qualidade.',
      created_at: 'now()',
    },
    {
      id: uuidV4(),
      name: 'Segurança',
      description: 'Freios ABS, controle de tração, airbags frontais e laterais.',
      created_at: 'now()',
    },
    {
      id: uuidV4(),
      name: 'Tecnologia',
      description: 'Sistema de navegação GPS, conectividade Bluetooth, carregador sem fio para smartphones.',
      created_at: 'now()',
    },
  ];

  for (const specification of specifications) {
    await connection.query(
      `INSERT INTO specifications(id, name, description, created_at)
        values('${specification.id}', '${specification.name}', '${specification.description}', '${specification.created_at}')`
    );
  }

  await connection.close();
}

createSpecifications().then(() => console.log('Specifications created!'));
