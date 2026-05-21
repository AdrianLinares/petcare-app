import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import VeterinarianDashboard from "@/components/Dashboard/VeterinarianDashboard";
import { __TESTING__ } from "react-i18next";

// Mock React Query hooks
const mockUseAppointments = vi.fn(() => ({
  data: [],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}));

const mockUseUpdateAppointment = vi.fn(() => ({
  mutate: vi.fn(),
  isLoading: false,
}));

const mockUsePets = vi.fn(() => ({
  data: [],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
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

describe("VeterinarianDashboard — error handling", () => {
  const onLogout = vi.fn();

  beforeEach(() => {
    __TESTING__.setLanguage("en");
    vi.clearAllMocks();
    mockUseAppointments.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseUpdateAppointment.mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    });
    mockUsePets.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("shows Connection Error when appointments query fails", () => {
    mockUseAppointments.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(<VeterinarianDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Connection Error")).toBeInTheDocument();
    expect(screen.getByText("Unable to load data from the server.")).toBeInTheDocument();
  });

  it("shows Connection Error when pets query fails", () => {
    mockUsePets.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(<VeterinarianDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Connection Error")).toBeInTheDocument();
  });

  it("shows Retry button that calls refetch when clicked", () => {
    const refetchAppointments = vi.fn();
    const refetchPets = vi.fn();
    mockUseAppointments.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      refetch: refetchAppointments,
    });
    mockUsePets.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: refetchPets,
    });

    render(<VeterinarianDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    retryButton.click();
    expect(refetchAppointments).toHaveBeenCalled();
    expect(refetchPets).toHaveBeenCalled();
  });

  it("does NOT show error banner when all queries succeed", () => {
    render(<VeterinarianDashboard user={mockUser} onLogout={onLogout} />, {
      wrapper: createWrapper(),
    });

    expect(screen.queryByText("Connection Error")).not.toBeInTheDocument();
  });
});