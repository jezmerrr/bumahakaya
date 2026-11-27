import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider, useStore, withSeedPhotos } from "./store";
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

function RemoveProbe() {
  const { reports, comments, removeReport, removeComment } = useStore();
  return (
    <div>
      <span data-testid="reports">{reports.length}</span>
      <span data-testid="comments">{comments.length}</span>
      <button onClick={() => removeReport("r-002")}>del-report</button>
      <button onClick={() => removeComment("c-001")}>del-comment</button>
    </div>
  );
}

function UpdateProbe() {
  const { reports, updateReport } = useStore();
  const r2 = reports.find((r) => r.id === "r-002");
  return (
    <div>
      <span data-testid="desc">{r2?.description ?? ""}</span>
      <span data-testid="edited">{r2?.editedAt ?? ""}</span>
      <span data-testid="author">{r2?.author ?? ""}</span>
      <span data-testid="time">{r2?.timestamp ?? ""}</span>
      <button
        onClick={() =>
          updateReport("r-002", { description: "updated", severity: "Impassable" })
        }
      >
        update
      </button>
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

  it("removes a report and a comment, persisting both", async () => {
    render(
      <StoreProvider>
        <RemoveProbe />
      </StoreProvider>,
    );
    const reportsBefore = Number(screen.getByTestId("reports").textContent);
    const commentsBefore = Number(screen.getByTestId("comments").textContent);

    await userEvent.click(screen.getByText("del-report"));
    expect(Number(screen.getByTestId("reports").textContent)).toBe(
      reportsBefore - 1,
    );
    expect(localStorage.getItem("bk.reports.v1")).not.toContain("r-002");

    await userEvent.click(screen.getByText("del-comment"));
    expect(Number(screen.getByTestId("comments").textContent)).toBe(
      commentsBefore - 1,
    );
    expect(localStorage.getItem("bk.comments.v1")).not.toContain("c-001");
  });

  it("updateReport changes fields, marks it edited, and persists", async () => {
    render(
      <StoreProvider>
        <UpdateProbe />
      </StoreProvider>,
    );
    const postedAt = screen.getByTestId("time").textContent;
    expect(screen.getByTestId("edited").textContent).toBe("");

    await userEvent.click(screen.getByText("update"));
    expect(screen.getByTestId("desc").textContent).toBe("updated");
    expect(screen.getByTestId("edited").textContent).not.toBe("");
    // Author and original post time never change on edit.
    expect(screen.getByTestId("author").textContent).toBe("jramos");
    expect(screen.getByTestId("time").textContent).toBe(postedAt);

    const saved = JSON.parse(localStorage.getItem("bk.reports.v1") ?? "[]");
    const r2 = saved.find((r: { id: string }) => r.id === "r-002");
    expect(r2.description).toBe("updated");
    expect(r2.severity).toBe("Impassable");
    expect(r2.editedAt).toBeTruthy();
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

describe("withSeedPhotos", () => {
  // A copy of the sample posts saved before photos were added.
  const oldCopy = seedReports.map(({ photoUrl, photoCredit, ...r }) => {
    void photoUrl;
    void photoCredit;
    return r;
  });

  it("gives untouched sample posts their photo back", () => {
    const r1 = withSeedPhotos(oldCopy).find((r) => r.id === "r-001")!;
    expect(r1.photoUrl).toBe("/demo/flood-taft-estrada.jpg");
    expect(r1.photoCredit).toBe("Rammuel Balbuena / ARCHX");
  });

  it("leaves edited posts and the user's own photos alone", () => {
    const edited = oldCopy.map((r) =>
      r.id === "r-001" ? { ...r, editedAt: "2026-11-28T00:00:00Z" } : r,
    );
    expect(withSeedPhotos(edited).find((r) => r.id === "r-001")!.photoUrl).toBeUndefined();

    const mine = { ...oldCopy[0], id: "user-1", photoUrl: "data:image/jpeg;base64,AAA" };
    expect(withSeedPhotos([mine])[0].photoUrl).toBe("data:image/jpeg;base64,AAA");
  });
});
