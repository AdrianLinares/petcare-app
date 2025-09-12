import { User, Pet, Appointment } from '../types';

export const initializeTestData = () => {
  // Versión actualizada de datos de prueba - v5
  const currentVersion = '2024-12-17-v5';
  
  // Verificar si ya están inicializados
  if (localStorage.getItem('testDataInitialized') === currentVersion) {
    console.log('✅ Test data already initialized');
    return;
  }

  console.log('🔄 Initializing test data...');

  // Limpiar datos existentes para evitar conflictos
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('pets_') || key.startsWith('appointments_') || key.startsWith('user_'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));

  // === USUARIOS DE PRUEBA ===

  // Propietarios de mascotas
  const petOwners: User[] = [
    {
      id: 'user_001',
      email: 'sarah.johnson@email.com',
      password: 'password123',
      fullName: 'Sarah Johnson',
      phone: '+1 (555) 123-4567',
      userType: 'pet_owner',
      createdAt: '2024-01-15T10:00:00Z',
      address: '123 Oak Street, Los Angeles, CA 90210'
    },
    {
      id: 'user_002',
      email: 'michael.chen@email.com',
      password: 'password123',
      fullName: 'Michael Chen',
      phone: '+1 (555) 234-5678',
      userType: 'pet_owner',
      createdAt: '2024-02-10T14:30:00Z',
      address: '456 Pine Avenue, Beverly Hills, CA 90212'
    },
    {
      id: 'user_003',
      email: 'emma.rodriguez@email.com',
      password: 'password123',
      fullName: 'Emma Rodriguez',
      phone: '+1 (555) 345-6789',
      userType: 'pet_owner',
      createdAt: '2024-03-05T09:15:00Z',
      address: '789 Maple Drive, Santa Monica, CA 90401'
    },
    {
      id: 'user_004',
      email: 'owner@petcare.com',
      password: 'owner123',
      fullName: 'Demo Pet Owner',
      phone: '+1 (555) 111-2222',
      userType: 'pet_owner',
      createdAt: '2024-01-01T12:00:00Z',
      address: '999 Demo Street, Test City, CA 90000'
    }
  ];

  // Veterinarios
  const veterinarians: User[] = [
    {
      id: 'vet_001',
      email: 'dr.martinez@petcare.com',
      password: 'vetpass123',
      fullName: 'Dr. Maria Martinez',
      phone: '+1 (555) 456-7890',
      userType: 'veterinarian',
      createdAt: '2024-01-01T08:00:00Z',
      specialization: 'General Practice',
      licenseNumber: 'VET-CA-12345'
    },
    {
      id: 'vet_002',
      email: 'dr.thompson@petcare.com',
      password: 'vetpass123',
      fullName: 'Dr. James Thompson',
      phone: '+1 (555) 567-8901',
      userType: 'veterinarian',
      createdAt: '2024-01-01T08:00:00Z',
      specialization: 'Surgery & Emergency Care',
      licenseNumber: 'VET-CA-67890'
    },
    {
      id: 'vet_003',
      email: 'vet@petcare.com',
      password: 'vet123',
      fullName: 'Dr. Sarah Johnson',
      phone: '+1 (555) 333-4444',
      userType: 'veterinarian',
      createdAt: '2024-01-01T08:00:00Z',
      specialization: 'Internal Medicine',
      licenseNumber: 'VET-CA-11111'
    }
  ];

  // Administradores
  const administrators: User[] = [
    {
      id: 'admin_001',
      email: 'admin@petcare.com',
      password: 'adminpass123',
      fullName: 'System Administrator',
      phone: '+1 (555) 999-0000',
      userType: 'administrator',
      createdAt: '2024-01-01T00:00:00Z',
      accessLevel: 'super_admin'
    },
    {
      id: 'admin_002',
      email: 'admin.elevated@petcare.com',
      password: 'adminpass123',
      fullName: 'Elevated Admin',
      phone: '+1 (555) 888-0000',
      userType: 'administrator',
      createdAt: '2024-01-01T00:00:00Z',
      accessLevel: 'elevated'
    },
    {
      id: 'admin_003',
      email: 'admin.standard@petcare.com',
      password: 'adminpass123',
      fullName: 'Standard Admin',
      phone: '+1 (555) 777-0000',
      userType: 'administrator',
      createdAt: '2024-01-01T00:00:00Z',
      accessLevel: 'standard'
    }
  ];

  // Guardar todos los usuarios
  const allUsers = [...petOwners, ...veterinarians, ...administrators];
  allUsers.forEach(user => {
    localStorage.setItem(`user_${user.email}`, JSON.stringify(user));
  });

  // === MASCOTAS DE PRUEBA ===

  // Mascotas de Sarah Johnson
  const sarahPets: Pet[] = [
    {
      id: 'pet_001',
      name: 'Max',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      weight: 30.5,
      color: 'Golden',
      gender: 'male',
      ownerId: 'sarah.johnson@email.com',
      conditions: ['Hip Dysplasia'],
      vaccinations: ['DHPP', 'Rabies', 'Bordetella'],
      notes: 'Very friendly and energetic. Loves swimming and playing fetch.',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'pet_002',
      name: 'Luna',
      species: 'cat',
      breed: 'Persian',
      age: 2,
      weight: 4.2,
      color: 'White',
      gender: 'female',
      ownerId: 'sarah.johnson@email.com',
      conditions: [],
      vaccinations: ['FVRCP', 'Rabies'],
      notes: 'Indoor cat, very calm and affectionate. Enjoys grooming sessions.',
      createdAt: '2024-01-20T10:00:00Z'
    }
  ];

  // Mascotas de Michael Chen
  const michaelPets: Pet[] = [
    {
      id: 'pet_003',
      name: 'Rocky',
      species: 'dog',
      breed: 'German Shepherd',
      age: 5,
      weight: 36.3,
      color: 'Black and Tan',
      gender: 'male',
      ownerId: 'michael.chen@email.com',
      conditions: ['ACL Injury'],
      vaccinations: ['DHPP', 'Rabies'],
      notes: 'Working dog background. Currently recovering from ACL surgery.',
      createdAt: '2024-02-10T14:30:00Z'
    }
  ];

  // Mascotas de Emma Rodriguez
  const emmaPets: Pet[] = [
    {
      id: 'pet_004',
      name: 'Bella',
      species: 'dog',
      breed: 'Labrador Mix',
      age: 1,
      weight: 15.9,
      color: 'Chocolate Brown',
      gender: 'female',
      ownerId: 'emma.rodriguez@email.com',
      conditions: [],
      vaccinations: ['DHPP', 'Rabies'],
      notes: 'Young energetic puppy. Still completing vaccination series.',
      createdAt: '2024-03-05T09:15:00Z'
    },
    {
      id: 'pet_005',
      name: 'Whiskers',
      species: 'cat',
      breed: 'Maine Coon',
      age: 4,
      weight: 6.8,
      color: 'Orange Tabby',
      gender: 'male',
      ownerId: 'emma.rodriguez@email.com',
      conditions: [],
      vaccinations: ['FVRCP', 'Rabies'],
      notes: 'Large, gentle cat. Indoor/outdoor access.',
      createdAt: '2024-03-10T09:15:00Z'
    }
  ];

  // Mascotas del usuario demo
  const demoPets: Pet[] = [
    {
      id: 'pet_006',
      name: 'Buddy',
      species: 'dog',
      breed: 'Beagle',
      age: 6,
      weight: 13.6,
      color: 'Tricolor',
      gender: 'male',
      ownerId: 'owner@petcare.com',
      conditions: ['Allergies'],
      vaccinations: ['DHPP', 'Rabies', 'Bordetella'],
      notes: 'Friendly beagle with seasonal allergies.',
      createdAt: '2024-01-01T12:00:00Z'
    }
  ];

  // Guardar mascotas por propietario
  localStorage.setItem('pets_sarah.johnson@email.com', JSON.stringify(sarahPets));
  localStorage.setItem('pets_michael.chen@email.com', JSON.stringify(michaelPets));
  localStorage.setItem('pets_emma.rodriguez@email.com', JSON.stringify(emmaPets));
  localStorage.setItem('pets_owner@petcare.com', JSON.stringify(demoPets));

  // === CITAS DE PRUEBA ===

  // Generar fechas futuras y pasadas
  const today = new Date();
  const futureDate1 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días
  const futureDate2 = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 días
  const pastDate1 = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // -7 días
  const pastDate2 = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000); // -14 días

  // Citas de Sarah Johnson
  const sarahAppointments: Appointment[] = [
    {
      id: 'apt_001',
      petId: 'pet_001',
      petName: 'Max',
      ownerId: 'sarah.johnson@email.com',
      veterinarian: 'Dr. Maria Martinez',
      type: 'Routine Checkup',
      date: futureDate1.toISOString(),
      time: '10:00',
      reason: 'Annual wellness exam and vaccination updates',
      notes: 'Check hip dysplasia progression',
      status: 'scheduled',
      createdAt: '2024-12-10T09:00:00Z'
    },
    {
      id: 'apt_002',
      petId: 'pet_002',
      petName: 'Luna',
      ownerId: 'sarah.johnson@email.com',
      veterinarian: 'Dr. Maria Martinez',
      type: 'Grooming',
      date: futureDate2.toISOString(),
      time: '14:00',
      reason: 'Professional grooming session',
      notes: 'Persian breed requires special grooming',
      status: 'scheduled',
      createdAt: '2024-12-12T14:00:00Z'
    },
    {
      id: 'apt_003',
      petId: 'pet_001',
      petName: 'Max',
      ownerId: 'sarah.johnson@email.com',
      veterinarian: 'Dr. Maria Martinez',
      type: 'Vaccination',
      date: pastDate1.toISOString(),
      time: '11:00',
      reason: 'DHPP booster vaccination',
      notes: 'Vaccination completed successfully',
      status: 'completed',
      diagnosis: 'Healthy, vaccination administered',
      treatment: 'DHPP vaccination',
      createdAt: '2024-12-01T10:00:00Z'
    }
  ];

  // Citas de Michael Chen
  const michaelAppointments: Appointment[] = [
    {
      id: 'apt_004',
      petId: 'pet_003',
      petName: 'Rocky',
      ownerId: 'michael.chen@email.com',
      veterinarian: 'Dr. James Thompson',
      type: 'Follow-up',
      date: futureDate1.toISOString(),
      time: '09:00',
      reason: 'Post-surgery ACL repair follow-up',
      notes: 'Check healing progress and adjust medication',
      status: 'scheduled',
      createdAt: '2024-12-10T08:00:00Z'
    },
    {
      id: 'apt_005',
      petId: 'pet_003',
      petName: 'Rocky',
      ownerId: 'michael.chen@email.com',
      veterinarian: 'Dr. James Thompson',
      type: 'Surgery',
      date: pastDate2.toISOString(),
      time: '15:00',
      reason: 'ACL repair surgery',
      notes: 'Surgery completed successfully',
      status: 'completed',
      diagnosis: 'ACL rupture',
      treatment: 'Surgical repair of ACL',
      createdAt: '2024-11-15T15:00:00Z'
    }
  ];

  // Citas de Emma Rodriguez
  const emmaAppointments: Appointment[] = [
    {
      id: 'apt_006',
      petId: 'pet_004',
      petName: 'Bella',
      ownerId: 'emma.rodriguez@email.com',
      veterinarian: 'Dr. Maria Martinez',
      type: 'Vaccination',
      date: futureDate1.toISOString(),
      time: '13:00',
      reason: 'Final puppy vaccination series',
      notes: 'Complete vaccination protocol',
      status: 'scheduled',
      createdAt: '2024-12-05T13:00:00Z'
    },
    {
      id: 'apt_007',
      petId: 'pet_005',
      petName: 'Whiskers',
      ownerId: 'emma.rodriguez@email.com',
      veterinarian: 'Dr. Maria Martinez',
      type: 'Routine Checkup',
      date: futureDate2.toISOString(),
      time: '16:00',
      reason: 'Annual wellness exam',
      notes: 'Check overall health and update vaccinations',
      status: 'scheduled',
      createdAt: '2024-12-14T16:00:00Z'
    },
    {
      id: 'apt_008',
      petId: 'pet_004',
      petName: 'Bella',
      ownerId: 'emma.rodriguez@email.com',
      veterinarian: 'Dr. Maria Martinez',
      type: 'Routine Checkup',
      date: pastDate1.toISOString(),
      time: '10:30',
      reason: 'Puppy wellness check',
      notes: 'Healthy development, weight on track',
      status: 'completed',
      diagnosis: 'Healthy puppy development',
      treatment: 'Routine examination',
      createdAt: '2024-12-01T10:30:00Z'
    }
  ];

  // Citas del usuario demo
  const demoAppointments: Appointment[] = [
    {
      id: 'apt_009',
      petId: 'pet_006',
      petName: 'Buddy',
      ownerId: 'owner@petcare.com',
      veterinarian: 'Dr. Sarah Johnson',
      type: 'Consultation',
      date: futureDate1.toISOString(),
      time: '11:30',
      reason: 'Allergy consultation',
      notes: 'Discuss allergy management options',
      status: 'scheduled',
      createdAt: '2024-12-01T12:00:00Z'
    }
  ];

  // Guardar citas por propietario
  localStorage.setItem('appointments_sarah.johnson@email.com', JSON.stringify(sarahAppointments));
  localStorage.setItem('appointments_michael.chen@email.com', JSON.stringify(michaelAppointments));
  localStorage.setItem('appointments_emma.rodriguez@email.com', JSON.stringify(emmaAppointments));
  localStorage.setItem('appointments_owner@petcare.com', JSON.stringify(demoAppointments));

  // Marcar como inicializado
  localStorage.setItem('testDataInitialized', currentVersion);

  // Log de resumen
  console.log('✅ Test data initialized successfully!');
  console.log('📊 Summary:');
  console.log(`- Users: ${allUsers.length} (${petOwners.length} pet owners, ${veterinarians.length} veterinarians, ${administrators.length} administrators)`);
  console.log(`- Pets: ${sarahPets.length + michaelPets.length + emmaPets.length + demoPets.length}`);
  console.log(`- Appointments: ${sarahAppointments.length + michaelAppointments.length + emmaAppointments.length + demoAppointments.length}`);
  console.log('');
  console.log('🔑 Demo Credentials:');
  console.log('Pet Owners:');
  console.log('- sarah.johnson@email.com / password123');
  console.log('- michael.chen@email.com / password123');
  console.log('- emma.rodriguez@email.com / password123');
  console.log('- owner@petcare.com / owner123');
  console.log('');
  console.log('Veterinarians:');
  console.log('- dr.martinez@petcare.com / vetpass123');
  console.log('- dr.thompson@petcare.com / vetpass123');
  console.log('- vet@petcare.com / vet123');
  console.log('');
  console.log('Administrators:');
  console.log('- admin@petcare.com / adminpass123 (Super Admin)');
  console.log('- admin.elevated@petcare.com / adminpass123 (Elevated Admin)');
  console.log('- admin.standard@petcare.com / adminpass123 (Standard Admin)');
};

// Función para limpiar todos los datos de prueba
export const clearTestData = () => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('pets_') || 
      key.startsWith('appointments_') || 
      key.startsWith('user_') ||
      key === 'testDataInitialized'
    )) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log('🗑️ Test data cleared');
};

// Función para verificar la integridad de los datos
export const verifyTestData = () => {
  const users = [];
  const pets = [];
  const appointments = [];
  
  // Contar usuarios
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('user_')) {
      users.push(key);
    } else if (key?.startsWith('pets_')) {
      pets.push(key);
    } else if (key?.startsWith('appointments_')) {
      appointments.push(key);
    }
  }
  
  console.log('🔍 Data verification:');
  console.log(`- User keys: ${users.length}`);
  console.log(`- Pet keys: ${pets.length}`);
  console.log(`- Appointment keys: ${appointments.length}`);
  console.log(`- Initialized: ${localStorage.getItem('testDataInitialized')}`);
  
  return {
    users: users.length,
    pets: pets.length,
    appointments: appointments.length,
    initialized: !!localStorage.getItem('testDataInitialized')
  };
};