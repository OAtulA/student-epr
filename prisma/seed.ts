import { db } from '../lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding database...')

  // Create disciplines
  const disciplines = ['CSE', 'IT', 'ECE', 'EEE', 'ML', 'DS']
  
  for (const disciplineName of disciplines) {
    await db.discipline.upsert({
      where: { name: disciplineName },
      update: {},
      create: { name: disciplineName },
    })
  }
  console.log('✅ Disciplines created')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  await db.user.upsert({
    where: { email: 'admin@epr.com' },
    update: {},
    create: {
      email: 'admin@epr.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created (admin@epr.com / admin123)')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })