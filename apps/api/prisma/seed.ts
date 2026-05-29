import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seed do banco de dados...');

  const users = [
    {
      email: 'admin@superbom.local',
      name: 'Administrador Principal',
      password: 'Admin@123',
      role: 'ADMIN',
    },
    {
      email: 'gerente@superbom.local',
      name: 'Gerente Operacional',
      password: 'Gerente@123',
      role: 'GERENTE',
    },
    {
      email: 'supervisor@superbom.local',
      name: 'Supervisor de Turno',
      password: 'Supervisor@123',
      role: 'SUPERVISOR',
    },
    {
      email: 'caixa1@superbom.local',
      name: 'Operador Caixa 1',
      password: 'Caixa@123',
      role: 'CAIXA',
    },
    {
      email: 'caixa2@superbom.local',
      name: 'Operador Caixa 2',
      password: 'Caixa@123',
      role: 'CAIXA',
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const existing = await prisma.user.findUnique({
      where: { email: u.email },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          passwordHash,
          role: u.role,
        },
      });
      console.log(`Usuário criado: ${u.email} (${u.role})`);
    } else {
      console.log(`Usuário já existe: ${u.email}`);
    }
  }

  console.log('Seed do banco de dados concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed do banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
