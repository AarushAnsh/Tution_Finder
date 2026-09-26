import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  },
  ensureProfile: () => Promise.resolve({ role: "parent" }),
  getProfile: () => Promise.resolve(null),
}));

jest.mock("./lib/api", () => ({
  getApprovedTeachers: () => Promise.resolve([]),
  isAdminEmail: () => false,
}));

test("renders Pathshala home", async () => {
  render(<App />);
  expect(await screen.findByText(/Home tutors in Motihari/i)).toBeInTheDocument();
});
