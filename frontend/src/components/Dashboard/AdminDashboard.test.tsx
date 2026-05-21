import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import AdminDashboard from "@/components/Dashboard/AdminDashboard";
import { __TESTING__ } from "react-i18next";

// Mock React Query hooks — they return empty data by default
const mockUseUsers = vi.fn(() => ({
  data: { users: [] },
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}));

const mockUseAppointments = vi.fn(() => ({
  data: [],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}));

const mockUseUpdateAppointment = vi.fn(() => ({
  mutate: vi.fn(),
  mutateAsync: vi.fn(),
  isPending: false,
}));

const mockUsePets = vi.fn(() => ({
  data: [],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}));

vi.mock("@/hooks/use-users", () => ({
  useUsers: () => mockUseUsers(),
}));

vi.mock("@/hooks/use-appointments", () => ({
  useAppointments: () => mockUseAppointments(),
  useUpdateAppointment: () => mockUseUpdateAppointment(),
}));

vi.mock("@/hooks/use-pets", () => ({
  usePets: () => mockUsePets(),
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

describe("AdminDashboard — error handling", () => {
  const onLogout = vi.fn();

  beforeEach(() => {
    __TESTING__.setLanguage("en");
    vi.clearAllMocks();
    mockUseUsers.mockReturnValue({
      data: { users: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseAppointments.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseUpdateAppointment.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
    });
    mockUsePets.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("shows Connection Error when users query fails", () => {
    mockUseUsers.mockReturnValue({
      data: { users: [] },
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(<AdminDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Connection Error")).toBeInTheDocument();
    expect(screen.getByText("Unable to load data from the server.")).toBeInTheDocument();
  });

  it("shows Connection Error when appointments query fails", () => {
    mockUseAppointments.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(<AdminDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Connection Error")).toBeInTheDocument();
  });

  it("shows Connection Error when pets query fails", () => {
    mockUsePets.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(<AdminDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Connection Error")).toBeInTheDocument();
  });

  it("shows Retry button that calls refetch for all failed queries", () => {
    const refetchUsers = vi.fn();
    const refetchAppointments = vi.fn();
    const refetchPets = vi.fn();
    mockUseUsers.mockReturnValue({
      data: { users: [] },
      isLoading: false,
      isError: true,
      refetch: refetchUsers,
    });
    mockUseAppointments.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: refetchAppointments,
    });
    mockUsePets.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: refetchPets,
    });

    render(<AdminDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    retryButton.click();
    expect(refetchUsers).toHaveBeenCalled();
    expect(refetchAppointments).toHaveBeenCalled();
    expect(refetchPets).toHaveBeenCalled();
  });

  it("does NOT show error banner when all queries succeed", () => {
    render(<AdminDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

    expect(screen.queryByText("Connection Error")).not.toBeInTheDocument();
  });
});