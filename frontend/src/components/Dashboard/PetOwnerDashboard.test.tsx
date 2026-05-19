import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import PetOwnerDashboard from "@/components/Dashboard/PetOwnerDashboard";
import { __TESTING__ } from "react-i18next";

// Mock React Query hooks — they return empty data by default
vi.mock("@/hooks/use-pets", () => ({
  usePets: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-appointments", () => ({
  useAppointments: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-vaccinations", () => ({
  useUpcomingVaccinations: () => ({
    data: [],
    isLoading: false,
  }),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock child components to isolate dashboard translation testing
vi.mock("@/components/Pet/PetManagement", () => ({
  default: () => <div data-testid="pet-management">PetManagement</div>,
}));

vi.mock("@/components/Appointment/AppointmentScheduling", () => ({
  default: () => <div data-testid="appointment-scheduling">AppointmentScheduling</div>,
}));

vi.mock("@/components/Medical/PetMedicalRecords", () => ({
  default: () => <div data-testid="medical-records">PetMedicalRecords</div>,
}));

vi.mock("@/components/Notification/NotificationBell", () => ({
  default: () => <div data-testid="notification-bell">NotificationBell</div>,
}));

vi.mock("@/components/LanguageSwitcher", () => ({
  default: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}));

const mockUser = {
  id: "user-1",
  email: "owner@test.com",
  fullName: "John Doe",
  userType: "pet_owner" as const,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("PetOwnerDashboard — translated strings", () => {
  const onLogout = vi.fn();

  beforeEach(() => {
    __TESTING__.setLanguage("en");
    vi.clearAllMocks();
  });

  const renderDashboard = () =>
    render(<PetOwnerDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

  it("renders the welcome message via translation key", () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.welcome", { exact: false })
    ).toBeInTheDocument();
  });

  it("renders the 'Sign Out' button via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.signOut")).toBeInTheDocument();
  });

  it("renders the Overview tab via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.overview")).toBeInTheDocument();
  });

  it("renders the My Pets tab via translation key", () => {
    renderDashboard();
    const myPetsElements = screen.getAllByText("[en] dashboard.myPets");
    expect(myPetsElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Appointments tab via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.appointments")).toBeInTheDocument();
  });

  it("renders the Medical Records tab via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.medicalRecords")).toBeInTheDocument();
  });

  it("renders stat card labels via translation keys", async () => {
    renderDashboard();
    const myPetsElements = screen.getAllByText("[en] dashboard.myPets");
    expect(myPetsElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("[en] dashboard.upcoming")).toBeInTheDocument();
    expect(screen.getByText("[en] dashboard.completed")).toBeInTheDocument();
    expect(screen.getByText("[en] dashboard.overdueVaccines")).toBeInTheDocument();
  });

  it("renders the Upcoming Appointments section title via translation key", async () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.upcomingAppointments")
    ).toBeInTheDocument();
  });

  it("renders the Schedule New button via translation key", async () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.scheduleNew")).toBeInTheDocument();
  });

  it("renders the no upcoming appointments empty state via translation key", async () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.noUpcomingAppointments")
    ).toBeInTheDocument();
  });

  it("renders the Recent Medical History title via translation key", async () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.recentMedicalHistory")
    ).toBeInTheDocument();
  });

  it("renders the no medical history empty state via translation key", async () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.noMedicalHistory")
    ).toBeInTheDocument();
  });
});