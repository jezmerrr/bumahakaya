import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider, useStore } from "./store";
import { seedReports, seedComments } from "@/data/seed";

function CommentProbe() {
  const { comments, addComment } = useStore();
  const thread = comments.filter((c) => c.reportId === "r-001");
  return (
    <div>
      <span data-testid="thread-count">{thread.length}</span>
      <span data-testid="first-text">{thread[0]?.text ?? ""}</span>
      <button onClick={() => addComment("r-001", "my new comment")}>add</button>
    </div>
  );
}

function Probe() {
  const { reports, addReport } = useStore();
  return (
    <div>
      <span data-testid="count">{reports.length}</span>
      <span data-testid="first-note">{reports[0]?.note ?? ""}</span>
      <span data-testid="first-id">{reports[0]?.id ?? ""}</span>
      <span data-testid="first-source">{reports[0]?.source ?? ""}</span>
      <button
        onClick={() =>
          addReport({
            lat: 14.56,
            lng: 120.99,
            streetName: "Agno St",
            severity: "Impassable",
            waterLevel: "Waist+",
            passable: false,
            note: "hello flood",
          })
        }
      >
        add
      </button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("store", () => {
  it("hydrates reports from seed when localStorage is empty", () => {
    render(
      <StoreProvider>
        <Probe />
      </StoreProvider>,
    );
    expect(screen.getByTestId("count").textContent).toBe(
      String(seedReports.length),
    );
  });

  it("addReport prepends a community report and persists it", async () => {
    render(
      <StoreProvider>
        <Probe />
      </StoreProvider>,
    );
    await userEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("first-note").textContent).toBe("hello flood");
    expect(screen.getByTestId("first-id").textContent).not.toBe("");
    expect(screen.getByTestId("first-source").textContent).toBe("community");
    expect(localStorage.getItem("bk.reports.v1")).toContain("hello flood");
  });

  it("seeds comments and adds a new one, persisting it", async () => {
    render(
      <StoreProvider>
        <CommentProbe />
      </StoreProvider>,
    );
    const seededForR1 = seedComments.filter((c) => c.reportId === "r-001")
      .length;
    expect(screen.getByTestId("thread-count").textContent).toBe(
      String(seededForR1),
    );
    await userEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("thread-count").textContent).toBe(
      String(seededForR1 + 1),
    );
    expect(screen.getByTestId("first-text").textContent).toBe("my new comment");
    expect(localStorage.getItem("bk.comments.v1")).toContain("my new comment");
  });

  it("falls back to seed when localStorage is corrupted", () => {
    localStorage.setItem("bk.reports.v1", "{ broken json");
    render(
      <StoreProvider>
        <Probe />
      </StoreProvider>,
    );
    expect(screen.getByTestId("count").textContent).toBe(
      String(seedReports.length),
    );
  });
});
