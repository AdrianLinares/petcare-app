-- PetCare Database Seed Script
-- Run this in your Neon SQL Editor to populate test data

-- ============================================
-- 1. CREATE USERS
-- ============================================
-- Password for all users: password123
-- Hash generated with bcrypt, rounds=10

INSERT INTO users (id, email, password_hash, full_name, phone, address, user_type, created_at, updated_at)
VALUES 
  -- Pet Owner
  ('550e8400-e29b-41d4-a716-446655440001', 
   'owner@petcare.com', 
   '$2b$10$rBV2x9vNXz0yZ8kK3SeEd8cLF2JR5.H8b7mLEoQfxHOXEfk6e2', 
   'John Smith', 
   '+1-555-0101', 
   '123 Pet Street, Boston, MA 02101', 
   'pet_owner',
   NOW(),
   NOW()),
  
  -- Veterinarian
  ('550e8400-e29b-41d4-a716-446655440002', 
   'vet@petcare.com', 
   '$2b$10$rBV2x9vNXz0yZ8kK3SeEd8cLF2JR5.H8b7mLEoQfxHOXEfk6e2', 
   'Dr. Sarah Johnson', 
   '+1-555-0102', 
   '456 Vet Avenue, Boston, MA 02102', 
   'veterinarian',
   NOW(),
   NOW()),
  
  -- Administrator
  ('550e8400-e29b-41d4-a716-446655440003', 
   'admin@petcare.com', 
   '$2b$10$rBV2x9vNXz0yZ8kK3SeEd8cLF2JR5.H8b7mLEoQfxHOXEfk6e2', 
   'Admin User', 
   '+1-555-0103', 
   '789 Admin Road, Boston, MA 02103', 
   'administrator',
   NOW(),
   NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. CREATE PETS
-- ============================================

INSERT INTO pets (id, owner_id, name, species, breed, date_of_birth, gender, weight, color, microchip_id, allergies, notes, created_at, updated_at)
VALUES 
  -- Pet 1: Buddy (Dog)
  ('650e8400-e29b-41d4-a716-446655440001',
   '550e8400-e29b-41d4-a716-446655440001',
   'Buddy',
   'Dog',
   'Golden Retriever',
   '2020-03-15',
   'Male',
   32.5,
   'Golden',
   'CHIP123456789',
   ARRAY['Peanuts', 'Chicken'],
   'Very friendly, loves playing fetch',
   NOW(),
   NOW()),
  
  -- Pet 2: Whiskers (Cat)
  ('650e8400-e29b-41d4-a716-446655440002',
   '550e8400-e29b-41d4-a716-446655440001',
   'Whiskers',
   'Cat',
   'Siamese',
   '2019-07-22',
   'Female',
   4.2,
   'Cream and Brown',
   'CHIP987654321',
   ARRAY[]::text[],
   'Indoor cat, shy around strangers',
   NOW(),
   NOW()),
  
  -- Pet 3: Max (Dog)
  ('650e8400-e29b-41d4-a716-446655440003',
   '550e8400-e29b-41d4-a716-446655440001',
   'Max',
   'Dog',
   'German Shepherd',
   '2018-11-10',
   'Male',
   38.0,
   'Black and Tan',
   'CHIP456789123',
   ARRAY['Beef'],
   'Guard dog, well trained',
   NOW(),
   NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. CREATE APPOINTMENTS
-- ============================================

INSERT INTO appointments (id, pet_id, owner_id, veterinarian_id, appointment_type, appointment_date, appointment_time, duration, reason, status, notes, created_at, updated_at)
VALUES 
  -- Upcoming appointment
  ('750e8400-e29b-41d4-a716-446655440001',
   '650e8400-e29b-41d4-a716-446655440001',
   '550e8400-e29b-41d4-a716-446655440001',
   '550e8400-e29b-41d4-a716-446655440002',
   'checkup',
   CURRENT_DATE + INTERVAL '3 days',
   '10:00',
   30,
   'Annual checkup and vaccination',
   'scheduled',
   NULL,
   NOW(),
   NOW()),
  
  -- Today's appointment
  ('750e8400-e29b-41d4-a716-446655440002',
   '650e8400-e29b-41d4-a716-446655440002',
   '550e8400-e29b-41d4-a716-446655440001',
   '550e8400-e29b-41d4-a716-446655440002',
   'consultation',
   CURRENT_DATE,
   '14:30',
   45,
   'Check skin condition',
   'scheduled',
   NULL,
   NOW(),
   NOW()),
  
  -- Past completed appointment
  ('750e8400-e29b-41d4-a716-446655440003',
   '650e8400-e29b-41d4-a716-446655440003',
   '550e8400-e29b-41d4-a716-446655440001',
   '550e8400-e29b-41d4-a716-446655440002',
   'vaccination',
   CURRENT_DATE - INTERVAL '15 days',
   '09:00',
   20,
   'Rabies vaccination',
   'completed',
   'Vaccination administered successfully',
   NOW(),
   NOW()),
  
  -- Another upcoming appointment
  ('750e8400-e29b-41d4-a716-446655440004',
   '650e8400-e29b-41d4-a716-446655440001',
   '550e8400-e29b-41d4-a716-446655440001',
   '550e8400-e29b-41d4-a716-446655440002',
   'surgery',
   CURRENT_DATE + INTERVAL '7 days',
   '08:00',
   120,
   'Dental cleaning',
   'scheduled',
   NULL,
   NOW(),
   NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. CREATE MEDICAL RECORDS
-- ============================================

INSERT INTO medical_records (id, pet_id, date, record_type, description, diagnosis, treatment, veterinarian_id, created_at, updated_at)
VALUES 
  ('850e8400-e29b-41d4-a716-446655440001',
   '650e8400-e29b-41d4-a716-446655440001',
   CURRENT_DATE - INTERVAL '30 days',
   'checkup',
   'Annual wellness examination',
   'Healthy, no issues detected',
   'Continue regular diet and exercise',
   '550e8400-e29b-41d4-a716-446655440002',
   NOW(),
   NOW()),
  
  ('850e8400-e29b-41d4-a716-446655440002',
   '650e8400-e29b-41d4-a716-446655440002',
   CURRENT_DATE - INTERVAL '45 days',
   'illness',
   'Upper respiratory infection',
   'Mild URI, fever present',
   'Antibiotics prescribed for 10 days',
   '550e8400-e29b-41d4-a716-446655440002',
   NOW(),
   NOW()),
  
  ('850e8400-e29b-41d4-a716-446655440003',
   '650e8400-e29b-41d4-a716-446655440003',
   CURRENT_DATE - INTERVAL '60 days',
   'injury',
   'Minor paw laceration',
   'Small cut on right front paw',
   'Wound cleaned and bandaged, pain medication given',
   '550e8400-e29b-41d4-a716-446655440002',
   NOW(),
   NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. CREATE VACCINATION RECORDS
-- ============================================

INSERT INTO vaccinations (id, pet_id, vaccine_name, vaccine_type, date_administered, next_due_date, veterinarian_id, notes, created_at, updated_at)
VALUES 
  ('950e8400-e29b-41d4-a716-446655440001',
   '650e8400-e29b-41d4-a716-446655440001',
   'Rabies',
   'Core',
   CURRENT_DATE - INTERVAL '15 days',
   CURRENT_DATE + INTERVAL '350 days',
   '550e8400-e29b-41d4-a716-446655440002',
   'Annual rabies vaccination',
   NOW(),
   NOW()),
  
  ('950e8400-e29b-41d4-a716-446655440002',
   '650e8400-e29b-41d4-a716-446655440001',
   'DHPP',
   'Core',
   CURRENT_DATE - INTERVAL '380 days',
   CURRENT_DATE - INTERVAL '15 days',
   '550e8400-e29b-41d4-a716-446655440002',
   'Overdue - needs booster',
   NOW(),
   NOW()),
  
  ('950e8400-e29b-41d4-a716-446655440003',
   '650e8400-e29b-41d4-a716-446655440002',
   'FVRCP',
   'Core',
   CURRENT_DATE - INTERVAL '200 days',
   CURRENT_DATE + INTERVAL '165 days',
   '550e8400-e29b-41d4-a716-446655440002',
   'Feline vaccine combination',
   NOW(),
   NOW()),
  
  ('950e8400-e29b-41d4-a716-446655440004',
   '650e8400-e29b-41d4-a716-446655440003',
   'Bordetella',
   'Non-Core',
   CURRENT_DATE - INTERVAL '100 days',
   CURRENT_DATE + INTERVAL '265 days',
   '550e8400-e29b-41d4-a716-446655440002',
   'Kennel cough prevention',
   NOW(),
   NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. CREATE MEDICATION RECORDS
-- ============================================

INSERT INTO medications (id, pet_id, medication_name, dosage, frequency, start_date, end_date, prescribed_by, notes, created_at, updated_at)
VALUES 
  -- Active medication
  ('a50e8400-e29b-41d4-a716-446655440001',
   '650e8400-e29b-41d4-a716-446655440002',
   'Amoxicillin',
   '250mg',
   'Twice daily',
   CURRENT_DATE - INTERVAL '3 days',
   CURRENT_DATE + INTERVAL '7 days',
   '550e8400-e29b-41d4-a716-446655440002',
   'Give with food',
   NOW(),
   NOW()),
  
  -- Past medication
  ('a50e8400-e29b-41d4-a716-446655440002',
   '650e8400-e29b-41d4-a716-446655440001',
   'Heartgard Plus',
   '1 chewable',
   'Monthly',
   CURRENT_DATE - INTERVAL '180 days',
   CURRENT_DATE - INTERVAL '30 days',
   '550e8400-e29b-41d4-a716-446655440002',
   'Heartworm prevention - completed course',
   NOW(),
   NOW()),
  
  -- Active long-term medication
  ('a50e8400-e29b-41d4-a716-446655440003',
   '650e8400-e29b-41d4-a716-446655440003',
   'Carprofen',
   '75mg',
   'Once daily',
   CURRENT_DATE - INTERVAL '60 days',
   CURRENT_DATE + INTERVAL '305 days',
   '550e8400-e29b-41d4-a716-446655440002',
   'Anti-inflammatory for arthritis',
   NOW(),
   NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. CREATE CLINICAL RECORDS
-- ============================================

INSERT INTO clinical_records (id, pet_id, appointment_id, date, symptoms, diagnosis, treatment, prescriptions, follow_up_date, veterinarian_id, notes, created_at, updated_at)
VALUES 
  ('b50e8400-e29b-41d4-a716-446655440001',
   '650e8400-e29b-41d4-a716-446655440002',
   '750e8400-e29b-41d4-a716-446655440003',
   CURRENT_DATE - INTERVAL '15 days',
   'Sneezing, runny nose, lethargy',
   'Upper respiratory infection',
   'Antibiotics and rest',
   'Amoxicillin 250mg twice daily for 10 days',
   CURRENT_DATE + INTERVAL '5 days',
   '550e8400-e29b-41d4-a716-446655440002',
   'Follow up to check recovery progress',
   NOW(),
   NOW()),
  
  ('b50e8400-e29b-41d4-a716-446655440002',
   '650e8400-e29b-41d4-a716-446655440003',
   NULL,
   CURRENT_DATE - INTERVAL '60 days',
   'Limping on right front paw',
   'Minor paw laceration',
   'Wound cleaning and bandaging',
   'Pain medication as needed',
   NULL,
   '550e8400-e29b-41d4-a716-446655440002',
   'Healed well, no follow-up needed',
   NOW(),
   NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 8. CREATE NOTIFICATIONS (Optional)
-- ============================================

INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at)
VALUES 
  ('c50e8400-e29b-41d4-a716-446655440001',
   '550e8400-e29b-41d4-a716-446655440001',
   'appointment_reminder',
   'Upcoming Appointment',
   'Buddy has a checkup scheduled in 3 days',
   false,
   NOW()),
  
  ('c50e8400-e29b-41d4-a716-446655440002',
   '550e8400-e29b-41d4-a716-446655440001',
   'vaccination_due',
   'Vaccination Overdue',
   'Buddy''s DHPP vaccination is overdue',
   false,
   NOW()),
  
  ('c50e8400-e29b-41d4-a716-446655440003',
   '550e8400-e29b-41d4-a716-446655440002',
   'appointment_today',
   'Today''s Appointments',
   'You have 1 appointment scheduled for today',
   false,
   NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify data was inserted
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Pets', COUNT(*) FROM pets
UNION ALL
SELECT 'Appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'Medical Records', COUNT(*) FROM medical_records
UNION ALL
SELECT 'Vaccinations', COUNT(*) FROM vaccinations
UNION ALL
SELECT 'Medications', COUNT(*) FROM medications
UNION ALL
SELECT 'Clinical Records', COUNT(*) FROM clinical_records
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;

-- Display created users
SELECT email, full_name, user_type FROM users ORDER BY user_type;
