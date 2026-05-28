import { PrismaClient, SequenceTrigger } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes (em ordem de dependência)
  await prisma.automationLog.deleteMany({});
  await prisma.automationRule.deleteMany({});
  await prisma.userWorkload.deleteMany({});
  await prisma.emailLog.deleteMany({});
  await prisma.leadSequenceProgress.deleteMany({});
  await prisma.emailSequenceStep.deleteMany({});
  await prisma.emailSequence.deleteMany({});
  await prisma.kanbanCard.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash password padrão
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Criar usuários de teste
  const admin = await prisma.user.create({
    data: {
      email: 'admin@advgd.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      phone: '11999999999',
    },
  });

  const lawyer = await prisma.user.create({
    data: {
      email: 'lawyer@advgd.com',
      password: hashedPassword,
      name: 'João Advogado',
      role: 'LAWYER',
      phone: '11988888888',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@advgd.com',
      password: hashedPassword,
      name: 'Maria Atendente',
      role: 'STAFF',
      phone: '11977777777',
    },
  });

  // Criar leads de teste
  const lead1 = await prisma.lead.create({
    data: {
      name: 'Carlos Silva',
      phone: '11987654321',
      email: 'carlos@email.com',
      cpf: '12345678900',
      category: 'PROCESS',
      status: 'INITIAL',
      source: 'WHATSAPP',
      responsibleId: lawyer.id,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: 'Ana Costa',
      phone: '11987654322',
      email: 'ana@email.com',
      cpf: '12345678901',
      category: 'BPC_LOAS',
      status: 'CONSULTING',
      source: 'WEBSITE',
      responsibleId: staff.id,
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      name: 'Pedro Oliveira',
      phone: '11987654323',
      email: 'pedro@email.com',
      cpf: '12345678902',
      category: 'RETIREMENT',
      status: 'INITIAL',
      source: 'PHONE',
      responsibleId: lawyer.id,
    },
  });

  const lead4 = await prisma.lead.create({
    data: {
      name: 'Marina Santos',
      phone: '11987654324',
      email: 'marina@email.com',
      cpf: '12345678903',
      category: 'CONSULTATION',
      status: 'INITIAL',
      source: 'WEBSITE',
      responsibleId: staff.id,
    },
  });

  // Criar cards no Kanban
  await prisma.kanbanCard.create({
    data: {
      leadId: lead1.id,
      sector: 'LEGAL',
      stage: 'todo',
      position: 0,
      responsibleId: lawyer.id,
      notes: 'Processo de divórcio em andamento',
    },
  });

  await prisma.kanbanCard.create({
    data: {
      leadId: lead2.id,
      sector: 'ADMINISTRATIVE',
      stage: 'doing',
      position: 1,
      responsibleId: staff.id,
      notes: 'Aguardando documentação do cliente',
    },
  });

  await prisma.kanbanCard.create({
    data: {
      leadId: lead3.id,
      sector: 'LEGAL',
      stage: 'todo',
      position: 2,
      responsibleId: lawyer.id,
      notes: 'Consulta aposentadoria',
    },
  });

  await prisma.kanbanCard.create({
    data: {
      leadId: lead4.id,
      sector: 'COMMERCIAL',
      stage: 'todo',
      position: 3,
      responsibleId: staff.id,
      notes: 'Primeira consulta marcada',
    },
  });

  // 🆕 Criar sequências de email (Passo 8)
  console.log('\n📧 Criando sequências de email...');

  const welcomeSequence = await prisma.emailSequence.create({
    data: {
      name: 'Sequência de Boas-vindas',
      description: 'Email de boas-vindas automático para novos leads',
      trigger: SequenceTrigger.LEAD_CREATED,
      isActive: true,
      priority: 1,
      steps: {
        create: [
          {
            stepNumber: 1,
            delayMinutes: 0,
            template: 'welcome',
            subject: '✅ Recebemos seu contato - ADVGD'
          },
          {
            stepNumber: 2,
            delayMinutes: 120,
            template: 'follow_up',
            subject: '📋 Próximas etapas - Seu processo legal'
          }
        ]
      }
    }
  });

  const bpcSequence = await prisma.emailSequence.create({
    data: {
      name: 'Sequência BPC/LOAS',
      description: 'Sequência específica para leads de BPC/LOAS',
      trigger: SequenceTrigger.CATEGORY_BPC_LOAS,
      triggerValue: 'BPC_LOAS',
      isActive: true,
      priority: 2,
      steps: {
        create: [
          {
            stepNumber: 1,
            delayMinutes: 0,
            template: 'welcome',
            subject: '🎯 Sua solicitação de BPC/LOAS'
          }
        ]
      }
    }
  });

  console.log('✅ Sequências de email criadas');

  // 🆕 Criar regras de automação e workload (Passo 10)
  console.log('\n⚙️ Criando regras de automação e workload...');

  // Inicializar workload para usuários
  await prisma.userWorkload.createMany({
    data: [
      {
        userId: lawyer.id,
        maxCapacity: 25,
        specialties: JSON.stringify(['PROCESS', 'RETIREMENT', 'BPC_LOAS']),
        activeLeads: 1,
        utilization: 4,
        isAvailable: true
      },
      {
        userId: staff.id,
        maxCapacity: 20,
        specialties: JSON.stringify(['CONSULTATION', 'BPC_LOAS']),
        activeLeads: 2,
        utilization: 10,
        isAvailable: true
      }
    ],
    skipDuplicates: true
  });

  // Criar regras de automação
  await prisma.automationRule.createMany({
    data: [
      {
        name: 'Auto-assign high score leads',
        description: 'Atribuir automaticamente leads com score > 70',
        trigger: 'LEAD_SCORE_ABOVE',
        triggerValue: '70',
        action: 'ASSIGN_TO_USER',
        isActive: true,
        priority: 10
      },
      {
        name: 'Marcar para revisão baixo score',
        description: 'Marcar para revisão leads com score < 30',
        trigger: 'LEAD_SCORE_BELOW',
        triggerValue: '30',
        action: 'MARK_FOR_REVIEW',
        actionValue: 'Score baixo - revisar qualidade',
        isActive: true,
        priority: 5
      },
      {
        name: 'Trigger sequência BPC/LOAS',
        description: 'Disparar sequência automática para leads BPC/LOAS',
        trigger: 'CATEGORY_MATCH',
        triggerValue: 'BPC_LOAS',
        action: 'TRIGGER_SEQUENCE',
        sequenceId: bpcSequence.id,
        isActive: true,
        priority: 8
      }
    ],
    skipDuplicates: true
  });

  console.log('✅ Regras de automação e workload criados');

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('');
  console.log('📋 Usuários criados:');
  console.log(`
  ADMIN:
    Email: ${admin.email}
    Password: 123456
    
  LAWYER:
    Email: ${lawyer.email}
    Password: 123456
    
  STAFF:
    Email: ${staff.email}
    Password: 123456
  `);
  console.log('');
  console.log('📌 Leads criados:');
  console.log(`
  - ${lead1.name} (${lead1.category}) - Legal
  - ${lead2.name} (${lead2.category}) - Administrativo
  - ${lead3.name} (${lead3.category}) - Legal
  - ${lead4.name} (${lead4.category}) - Comercial
  `);
}

main()
  .catch((error) => {
    console.error('Erro ao fazer seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
