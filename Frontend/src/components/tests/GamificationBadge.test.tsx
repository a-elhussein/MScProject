import { render, screen, waitFor } from "@testing-library/react";
import GamificationBadge from "@/components/GamificationBadge";
import api from "@/lib/axios";
import { vi } from "vitest";

vi.mock("@/lib/axios");
const mockedApi = vi.mocked(api, { deep: true });

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

        render(<GamificationBadge />);

        await waitFor(() => {
            expect(screen.getByText(/🔥\s*5\s*Day Streak/i)).toBeInTheDocument();
            expect(screen.getByText(/⭐\s*Level\s*3/i)).toBeInTheDocument();
        });
    });

    it("handles API failure gracefully", async () => {
        mockedApi.get.mockRejectedValueOnce(new Error("Network Error"));

        render(<GamificationBadge />);

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

        render(<GamificationBadge />);

        await waitFor(() => {
            expect(screen.queryByText(/XP/i)).not.toBeInTheDocument();
        });
    });
});