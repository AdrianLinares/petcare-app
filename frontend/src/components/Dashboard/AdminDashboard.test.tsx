import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import AdminDashboard from "@/components/Dashboard/AdminDashboard";
import { __TESTING__ } from "react-i18next";

// Mock React Query hooks — they return empty data by default
vi.mock("@/hooks/use-users", () => ({
  useUsers: () => ({
    data: { users: [] },
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-appointments", () => ({
  useAppointments: () => ({
    data: [],
    isLoading: false,
  }),
  useUpdateAppointment: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-pets", () => ({
  usePets: () => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock child components
vi.mock("@/components/Notification/NotificationBell", () => ({
  default: () => <div data-testid="notification-bell">NotificationBell</div>,
}));

vi.mock("@/components/LanguageSwitcher", () => ({
  default: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}));

vi.mock("@/components/Admin/UserManagementDialogs", () => ({
  default: () => <div data-testid="user-management">UserManagement</div>,
}));

vi.mock("@/components/Medical/MedicalHistoryManagement", () => ({
  default: () => <div data-testid="medical-history">MedicalHistory</div>,
}));

// QueryClient wrapper for React Query context
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
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

const mockUser = {
  id: "admin-1",
  email: "admin@test.com",
  fullName: "Admin User",
  userType: "administrator" as const,
  phone: "+1-555-0100",
  password: "",
  createdAt: "2024-01-01T00:00:00Z",
};

describe("AdminDashboard — translated strings", () => {
  const onLogout = vi.fn();

  beforeEach(() => {
    __TESTING__.setLanguage("en");
    vi.clearAllMocks();
  });

  const renderDashboard = () =>
    render(<AdminDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

  it("renders the Admin title via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.adminTitle")).toBeInTheDocument();
  });

  it("renders the Administrator label via translation key", () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.administrator", { exact: false })
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

  it("renders the User Management tab via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.userManagement")).toBeInTheDocument();
  });

  it("renders the Appointments tab via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.appointments")).toBeInTheDocument();
  });

  it("renders the Medical History tab via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.medicalHistory")).toBeInTheDocument();
  });

  it("renders the Reports tab via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.reports")).toBeInTheDocument();
  });

  it("renders stat card labels via translation keys", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.totalUsers")).toBeInTheDocument();
    expect(screen.getByText("[en] dashboard.totalAppointments")).toBeInTheDocument();
    const completedElements = screen.getAllByText("[en] dashboard.completed");
    expect(completedElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("[en] dashboard.today")).toBeInTheDocument();
  });

  it("renders the User Distribution card title via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.userDistribution")).toBeInTheDocument();
  });

  it("renders the Pet Owners label via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.petOwners")).toBeInTheDocument();
  });

  it("renders the Veterinarians label via translation key", () => {
    renderDashboard();
    expect(screen.getByText("[en] dashboard.veterinarians")).toBeInTheDocument();
  });

  it("renders the Appointment Statistics card title via translation key", () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.appointmentStatistics")
    ).toBeInTheDocument();
  });

  it("renders the Recent Appointments card title via translation key", () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.recentAppointments")
    ).toBeInTheDocument();
  });

  it("renders the no recent appointments empty state via translation key", () => {
    renderDashboard();
    expect(
      screen.getByText("[en] dashboard.noRecentAppointments")
    ).toBeInTheDocument();
  });
});