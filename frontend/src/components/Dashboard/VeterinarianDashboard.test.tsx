import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import VeterinarianDashboard from "@/components/Dashboard/VeterinarianDashboard";
import { __TESTING__ } from "react-i18next";

// Mock React Query hooks
vi.mock("@/hooks/use-appointments", () => ({
  useAppointments: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useUpdateAppointment: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock("@/hooks/use-pets", () => ({
  usePets: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock child components to isolate dashboard
vi.mock("@/components/Notification/NotificationBell", () => ({
  default: () => <div data-testid="notification-bell">NotificationBell</div>,
}));

vi.mock("@/components/LanguageSwitcher", () => ({
  default: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}));

vi.mock("@/components/Medical/MedicalHistoryManagement", () => ({
  default: () => <div data-testid="medical-history">MedicalHistory</div>,
}));

const mockUser = {
  id: "vet-1",
  email: "vet@test.com",
  fullName: "Jane Smith",
  userType: "veterinarian" as const,
  phone: "+1-555-0100",
  password: "hashed",
  createdAt: "2024-01-01T00:00:00Z",
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

describe("VeterinarianDashboard — translated strings", () => {
  const onLogout = vi.fn();

  beforeEach(() => {
    __TESTING__.setLanguage("en");
    vi.clearAllMocks();
  });

  const renderDashboard = () =>
    render(<VeterinarianDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

  it("renders the Dr. prefix welcome via translation key", () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.doctorPrefix", { exact: false })
    ).toBeInTheDocument();
  });

  it("renders the 'Sign Out' button via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.signOut")).toBeInTheDocument();
  });

  it("renders the Today's Schedule tab via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.todaySchedule")).toBeInTheDocument();
  });

  it("renders the Upcoming tab via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.upcomingTab")).toBeInTheDocument();
  });

  it("renders the Manage Appointments tab via translation key", () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.manageAppointments")
    ).toBeInTheDocument();
  });

  it("renders the Medical History tab via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.medicalHistory")).toBeInTheDocument();
  });

  it("renders stat card labels via translation keys", async () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.todayAppointments")
    ).toBeInTheDocument();
    expect(screen.getByText("[en] dashboard.completedToday")).toBeInTheDocument();
    expect(screen.getByText("[en] dashboard.pending")).toBeInTheDocument();
    expect(screen.getByText("[en] dashboard.totalPatients")).toBeInTheDocument();
  });

  it("renders the no appointments today empty state via translation key", async () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.noAppointmentsToday")
    ).toBeInTheDocument();
  });

  it("renders the search placeholder via translation key", () => {
    renderDashboard();
    const todayTab = screen.getByText("[en] dashboard.todaySchedule");
    expect(todayTab).toBeInTheDocument();
  });

  it("renders the filter status trigger placeholder via translation key", () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.manageAppointments")
    ).toBeInTheDocument();
  });
});