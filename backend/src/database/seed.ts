import bcrypt from 'bcrypt';
import pool from '../config/database.js';

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create demo users
    const passwordHash = await bcrypt.hash('password123', 10);

    // Super Admin
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, user_type, access_level)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@petcare.com', passwordHash, 'Admin User', '555-0001', 'administrator', 'super_admin']
    );

    // Veterinarian
    const vetResult = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, user_type, specialization, license_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE SET id = users.id
       RETURNING id`,
      ['vet@petcare.com', passwordHash, 'Dr. Sarah Johnson', '555-0002', 'veterinarian', 'General Practice', 'VET-12345']
    );

    // Pet Owner
    const ownerResult = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, user_type, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET id = users.id
       RETURNING id`,
      ['owner@petcare.com', passwordHash, 'John Smith', '555-0003', 'pet_owner', '123 Main St, Anytown, USA']
    );

    if (ownerResult.rows.length > 0 && vetResult.rows.length > 0) {
      const ownerId = ownerResult.rows[0].id;
      const vetId = vetResult.rows[0].id;

      // Create demo pet
      const petResult = await pool.query(
        `INSERT INTO pets (owner_id, name, species, breed, age, weight, color, gender, microchip_id, allergies)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [ownerId, 'Max', 'Dog', 'Golden Retriever', 5, 32.5, 'Golden', 'Male', 'CHIP123456', ['Pollen', 'Dust']]
      );

      if (petResult.rows.length > 0) {
        const petId = petResult.rows[0].id;

        // Create vaccination record
        await pool.query(
          `INSERT INTO vaccinations (pet_id, vaccine, date, next_due, administered_by)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [petId, 'Rabies', new Date('2024-01-15'), new Date('2025-01-15'), vetId]
        );

        // Create appointment
        await pool.query(
          `INSERT INTO appointments (pet_id, owner_id, veterinarian_id, appointment_type, date, time, reason, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT DO NOTHING`,
          [petId, ownerId, vetId, 'Checkup', new Date('2025-02-01'), '10:00', 'Annual checkup', 'scheduled']
        );

        // Create medication
        await pool.query(
          `INSERT INTO medications (pet_id, name, dosage, start_date, prescribed_by, active)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [petId, 'Heartgard Plus', '1 tablet monthly', new Date('2024-01-01'), vetId, true]
        );
      }
    }

    console.log('✓ Database seeding completed successfully');
    console.log('\nDemo accounts:');
    console.log('- Admin: admin@petcare.com / password123');
    console.log('- Vet: vet@petcare.com / password123');
    console.log('- Owner: owner@petcare.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
