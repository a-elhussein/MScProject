import { render, screen, waitFor } from "@testing-library/react";
import GamificationBadge from "@/components/GamificationBadge";
import api from "@/lib/axios";
import { vi } from "vitest";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

vi.mock("@/lib/axios");
const mockedApi = vi.mocked(api, { deep: true });


function renderWithClient(ui: React.ReactNode) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {retry: false},
        }
    });
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

afterEach(() => {
    vi.clearAllMocks();
});

describe("GamificationBadge", () => {
    it("renders XP, level, and streak on success", async () => {
        mockedApi.get.mockResolvedValueOnce({
            data: {data: {xp: 50, level: 3, currentStreak: 5,},
                errorExist: false,
                errorMessage: null,
            },
        });

        renderWithClient(<GamificationBadge />);

        await waitFor(() => {
            expect(screen.getByText(/🔥\s*5\s*Day Streak/i)).toBeInTheDocument();
            expect(screen.getByText(/⭐\s*Level\s*3/i)).toBeInTheDocument();
        });
    });

    it("handles API failure gracefully", async () => {
        mockedApi.get.mockRejectedValueOnce(new Error("Network Error"));

        renderWithClient(<GamificationBadge />);

        await waitFor(() => {
            expect(screen.queryByText(/XP/i)).not.toBeInTheDocument();
        });
    });

    it("handles missing data", async () => {
        mockedApi.get.mockResolvedValueOnce({
            data: {
                data: null,
                errorExist: true,
                errorMessage: "Gamification record not found",
            },
        });

        renderWithClient(<GamificationBadge />);

        await waitFor(() => {
            expect(screen.queryByText(/XP/i)).not.toBeInTheDocument();
        });
    });
});