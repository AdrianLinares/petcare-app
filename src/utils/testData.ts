import { User, Pet, Appointment } from '../types';

export const initializeTestData = () => {
  // Force refresh test data to fix issues - version 4
  const currentVersion = '2024-08-17-v4';

  // Clear existing problematic data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('pets_') || key.startsWith('appointments_') || key.startsWith('user_'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));

  if (localStorage.getItem('testDataInitialized') === currentVersion) {
    return;
  }

  // Test User 1: Sarah Johnson
  const user1: User = {
    id: 'user_001',
    email: 'sarah.johnson@email.com',
    password: 'password123',
    fullName: 'Sarah Johnson',
    phone: '+1 (555) 123-4567',
    userType: 'pet_owner',
    createdAt: '2024-01-15T10:00:00Z',
    address: '123 Oak Street, Los Angeles, CA 90210'
  };

  // Test User 2: Michael Chen
  const user2: User = {
    id: 'user_002',
    email: 'michael.chen@email.com',
    password: 'password123',
    fullName: 'Michael Chen',
    phone: '+1 (555) 234-5678',
    userType: 'pet_owner',
    createdAt: '2024-02-10T14:30:00Z',
    address: '456 Pine Avenue, Beverly Hills, CA 90212'
  };

  // Test User 3: Emma Rodriguez
  const user3: User = {
    id: 'user_003',
    email: 'emma.rodriguez@email.com',
    password: 'password123',
    fullName: 'Emma Rodriguez',
    phone: '+1 (555) 345-6789',
    userType: 'pet_owner',
    createdAt: '2024-03-05T09:15:00Z',
    address: '789 Maple Drive, Santa Monica, CA 90401'
  };

  // Test Veterinarian
  const vet1: User = {
    id: 'vet_001',
    email: 'dr.martinez@petcare.com',
    password: 'vetpass123',
    fullName: 'Dr. Maria Martinez',
    phone: '+1 (555) 456-7890',
    userType: 'veterinarian',
    createdAt: '2024-01-01T08:00:00Z',
    specialization: 'General Practice',
    licenseNumber: 'VET-CA-12345'
  };

  const vet2: User = {
    id: 'vet_002',
    email: 'dr.thompson@petcare.com',
    password: 'vetpass123',
    fullName: 'Dr. James Thompson',
    phone: '+1 (555) 567-8901',
    userType: 'veterinarian',
    createdAt: '2024-01-01T08:00:00Z',
    specialization: 'Surgery & Emergency Care',
    licenseNumber: 'VET-CA-67890'
  };

  // Test Administrator
  const admin1: User = {
    id: 'admin-1',
    email: 'admin@petcare.com',
    password: 'adminpass123',
    fullName: 'Admin User',
    phone: '+1 (555) 999-0000',
    userType: 'administrator',
    createdAt: '2024-01-01T00:00:00Z',
    accessLevel: 'full',
    adminToken: 'ADM-2024-001'
  };

  // Store users
  localStorage.setItem('user_sarah.johnson@email.com', JSON.stringify(user1));
  localStorage.setItem('user_michael.chen@email.com', JSON.stringify(user2));
  localStorage.setItem('user_emma.rodriguez@email.com', JSON.stringify(user3));
  localStorage.setItem('user_dr.martinez@petcare.com', JSON.stringify(vet1));
  localStorage.setItem('user_dr.thompson@petcare.com', JSON.stringify(vet2));
  localStorage.setItem('user_admin@petcare.com', JSON.stringify(admin1));

  // Sarah's Pets
  const sarahPets: Pet[] = [
    {
      id: 'pet_001',
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      weight: 65,
      color: 'Golden',
      gender: 'Male',
      microchipId: 'MC001234567890',
      medicalHistory: [
        {
          date: '2024-01-15',
          type: 'Vaccination',
          description: 'Annual DHPP vaccination administered',
          veterinarian: 'Dr. Maria Martinez'
        },
        {
          date: '2023-12-10',
          type: 'Check-up',
          description: 'Routine health examination - excellent condition',
          veterinarian: 'Dr. Maria Martinez'
        },
        {
          date: '2023-08-20',
          type: 'Treatment',
          description: 'Treated for minor ear infection - fully recovered',
          veterinarian: 'Dr. James Thompson'
        }
      ],
      vaccinations: [
        { vaccine: 'DHPP', date: '2024-01-15', nextDue: '2025-01-15' },
        { vaccine: 'Rabies', date: '2023-06-15', nextDue: '2024-06-15' },
        { vaccine: 'Bordetella', date: '2023-12-01', nextDue: '2024-12-01' }
      ],
      allergies: ['Chicken', 'Beef'],
      medications: [],
      notes: 'Very friendly and energetic. Loves swimming and playing fetch.',
      ownerId: 'sarah.johnson@email.com'
    },
    {
      id: 'pet_002',
      name: 'Luna',
      species: 'Cat',
      breed: 'Persian',
      age: 2,
      weight: 8,
      color: 'White',
      gender: 'Female',
      microchipId: 'MC001234567891',
      medicalHistory: [
        {
          date: '2024-02-01',
          type: 'Spaying',
          description: 'Successful spaying procedure - recovery excellent',
          veterinarian: 'Dr. James Thompson'
        },
        {
          date: '2023-11-15',
          type: 'Vaccination',
          description: 'FVRCP vaccination administered',
          veterinarian: 'Dr. Maria Martinez'
        }
      ],
      vaccinations: [
        { vaccine: 'FVRCP', date: '2023-11-15', nextDue: '2024-11-15' },
        { vaccine: 'Rabies', date: '2023-07-10', nextDue: '2024-07-10' }
      ],
      allergies: [],
      medications: [],
      notes: 'Indoor cat, very calm and affectionate. Enjoys grooming sessions.',
      ownerId: 'sarah.johnson@email.com'
    }
  ];

  // Michael's Pets
  const michaelPets: Pet[] = [
    {
      id: 'pet_003',
      name: 'Rocky',
      species: 'Dog',
      breed: 'German Shepherd',
      age: 5,
      weight: 80,
      color: 'Black and Tan',
      gender: 'Male',
      microchipId: 'MC001234567892',
      medicalHistory: [
        {
          date: '2024-03-01',
          type: 'Surgery',
          description: 'ACL repair surgery - recovery progressing well',
          veterinarian: 'Dr. James Thompson'
        },
        {
          date: '2023-12-20',
          type: 'Check-up',
          description: 'Routine examination and blood work - all normal',
          veterinarian: 'Dr. Maria Martinez'
        }
      ],
      vaccinations: [
        { vaccine: 'DHPP', date: '2023-12-20', nextDue: '2024-12-20' },
        { vaccine: 'Rabies', date: '2023-05-15', nextDue: '2024-05-15' }
      ],
      allergies: [],
      medications: [
        { name: 'Carprofen', dosage: '75mg twice daily', startDate: '2024-03-01', endDate: '2024-04-01' }
      ],
      notes: 'Working dog background. Currently recovering from ACL surgery. Needs restricted activity.',
      ownerId: 'michael.chen@email.com'
    }
  ];

  // Emma's Pets
  const emmaPets: Pet[] = [
    {
      id: 'pet_004',
      name: 'Bella',
      species: 'Dog',
      breed: 'Labrador Mix',
      age: 1,
      weight: 35,
      color: 'Chocolate Brown',
      gender: 'Female',
      microchipId: 'MC001234567893',
      medicalHistory: [
        {
          date: '2024-03-10',
          type: 'Vaccination',
          description: 'Puppy vaccination series - 3rd round',
          veterinarian: 'Dr. Maria Martinez'
        },
        {
          date: '2024-02-15',
          type: 'Check-up',
          description: 'Puppy wellness exam - healthy and growing well',
          veterinarian: 'Dr. Maria Martinez'
        }
      ],
      vaccinations: [
        { vaccine: 'DHPP', date: '2024-03-10', nextDue: '2024-04-10' },
        { vaccine: 'Rabies', date: '2024-03-10', nextDue: '2025-03-10' }
      ],
      allergies: [],
      medications: [],
      notes: 'Young energetic puppy. Still completing vaccination series. Very social and trainable.',
      ownerId: 'emma.rodriguez@email.com'
    },
    {
      id: 'pet_005',
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Maine Coon',
      age: 4,
      weight: 15,
      color: 'Orange Tabby',
      gender: 'Male',
      microchipId: 'MC001234567894',
      medicalHistory: [
        {
          date: '2024-01-20',
          type: 'Dental Cleaning',
          description: 'Professional dental cleaning and examination',
          veterinarian: 'Dr. Maria Martinez'
        },
        {
          date: '2023-10-15',
          type: 'Check-up',
          description: 'Annual wellness exam - excellent health',
          veterinarian: 'Dr. Maria Martinez'
        }
      ],
      vaccinations: [
        { vaccine: 'FVRCP', date: '2023-10-15', nextDue: '2024-10-15' },
        { vaccine: 'Rabies', date: '2023-10-15', nextDue: '2024-10-15' }
      ],
      allergies: [],
      medications: [],
      notes: 'Large, gentle cat. Indoor/outdoor access. Regular dental care needed due to breed.',
      ownerId: 'emma.rodriguez@email.com'
    }
  ];

  // Store pets using email as key to match dashboard loading logic
  localStorage.setItem('pets_sarah.johnson@email.com', JSON.stringify(sarahPets));
  localStorage.setItem('pets_michael.chen@email.com', JSON.stringify(michaelPets));
  localStorage.setItem('pets_emma.rodriguez@email.com', JSON.stringify(emmaPets));

  // Sarah's Appointments
  const sarahAppointments: Appointment[] = [
    {
      id: 'apt_001',
      petId: 'pet_001',
      petName: 'Max',
      date: '2024-08-20',
      time: '10:00 AM',
      type: 'Annual Check-up',
      veterinarian: 'Dr. Maria Martinez',
      status: 'scheduled',
      notes: 'Annual wellness exam and vaccination updates',
      ownerId: 'sarah.johnson@email.com',
      createdAt: '2024-08-10T09:00:00Z'
    },
    {
      id: 'apt_002',
      petId: 'pet_002',
      petName: 'Luna',
      date: '2024-08-25',
      time: '2:00 PM',
      type: 'Grooming Consultation',
      veterinarian: 'Dr. Maria Martinez',
      status: 'scheduled',
      notes: 'Discuss grooming routine and skin care for Persian breed',
      ownerId: 'sarah.johnson@email.com',
      createdAt: '2024-08-12T14:00:00Z'
    },
    {
      id: 'apt_003',
      petId: 'pet_001',
      petName: 'Max',
      date: '2024-07-15',
      time: '11:00 AM',
      type: 'Vaccination',
      veterinarian: 'Dr. Maria Martinez',
      status: 'completed',
      notes: 'DHPP booster vaccination administered successfully',
      ownerId: 'sarah.johnson@email.com',
      createdAt: '2024-07-01T10:00:00Z'
    }
  ];

  // Michael's Appointments
  const michaelAppointments: Appointment[] = [
    {
      id: 'apt_004',
      petId: 'pet_003',
      petName: 'Rocky',
      date: '2024-08-22',
      time: '9:00 AM',
      type: 'Post-Surgery Follow-up',
      veterinarian: 'Dr. James Thompson',
      status: 'scheduled',
      notes: 'Check ACL repair healing progress, adjust medication if needed',
      ownerId: 'michael.chen@email.com',
      createdAt: '2024-08-10T08:00:00Z'
    },
    {
      id: 'apt_005',
      petId: 'pet_003',
      petName: 'Rocky',
      date: '2024-07-20',
      time: '3:00 PM',
      type: 'Surgery Follow-up',
      veterinarian: 'Dr. James Thompson',
      status: 'completed',
      notes: 'Good healing progress, continue current medication regimen',
      ownerId: 'michael.chen@email.com',
      createdAt: '2024-07-15T15:00:00Z'
    }
  ];

  // Emma's Appointments
  const emmaAppointments: Appointment[] = [
    {
      id: 'apt_006',
      petId: 'pet_004',
      petName: 'Bella',
      date: '2024-08-18',
      time: '1:00 PM',
      type: 'Puppy Vaccination',
      veterinarian: 'Dr. Maria Martinez',
      status: 'scheduled',
      notes: 'Final puppy vaccination series - 4th round',
      ownerId: 'emma.rodriguez@email.com',
      createdAt: '2024-08-05T13:00:00Z'
    },
    {
      id: 'apt_007',
      petId: 'pet_005',
      petName: 'Whiskers',
      date: '2024-08-30',
      time: '4:00 PM',
      type: 'Annual Check-up',
      veterinarian: 'Dr. Maria Martinez',
      status: 'scheduled',
      notes: 'Annual wellness exam and vaccination updates',
      ownerId: 'emma.rodriguez@email.com',
      createdAt: '2024-08-14T16:00:00Z'
    },
    {
      id: 'apt_008',
      petId: 'pet_004',
      petName: 'Bella',
      date: '2024-07-10',
      time: '10:30 AM',
      type: 'Puppy Check-up',
      veterinarian: 'Dr. Maria Martinez',
      status: 'completed',
      notes: 'Healthy puppy development, weight gain on track',
      ownerId: 'emma.rodriguez@email.com',
      createdAt: '2024-07-01T10:30:00Z'
    }
  ];

  // Store appointments using email as key to match dashboard loading logic
  localStorage.setItem('appointments_sarah.johnson@email.com', JSON.stringify(sarahAppointments));
  localStorage.setItem('appointments_michael.chen@email.com', JSON.stringify(michaelAppointments));
  localStorage.setItem('appointments_emma.rodriguez@email.com', JSON.stringify(emmaAppointments));

  // Mark test data as initialized with version
  localStorage.setItem('testDataInitialized', currentVersion);

  console.log('=== Test data initialized successfully! ===');
  console.log('Total Users Created: 6');
  console.log('Pet Owners (3):');
  console.log('1. Sarah Johnson (sarah.johnson@email.com) - Password: password123');
  console.log('2. Michael Chen (michael.chen@email.com) - Password: password123');
  console.log('3. Emma Rodriguez (emma.rodriguez@email.com) - Password: password123');
  console.log('Veterinarians (2):');
  console.log('1. Dr. Maria Martinez (dr.martinez@petcare.com) - Password: vetpass123');
  console.log('2. Dr. James Thompson (dr.thompson@petcare.com) - Password: vetpass123');
  console.log('Administrator (1):');
  console.log('1. System Administrator (admin@petcare.com) - Password: adminpass123');
  console.log('Total Appointments Created: 8 (3 completed, 5 scheduled, 0 cancelled)');
  console.log('localStorage keys created:');
  console.log('- User keys:', Object.keys(localStorage).filter(k => k.startsWith('user_')));
  console.log('- Appointment keys:', Object.keys(localStorage).filter(k => k.startsWith('appointments_')));
  console.log('- Pet keys:', Object.keys(localStorage).filter(k => k.startsWith('pets_')));
};