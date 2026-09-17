import { expect, vi, describe, it } from "vitest";
import { render } from "@solidjs/testing-library";
import { WorklogForm } from "./WorklogForm";
import { testWorklog } from "@/test/fixtures";
import { TestContext } from "@/test/TestContext";
import { WorklogFormView } from "@/test/WorklogFormView";
import { TestTimeAPI } from "@/test/TestTimeAPI";

describe("WorklogForm", () => {
  it("has correct defaults", () => {
    const { container } = render(() => (
      <TestContext>
        <WorklogForm
          worklog={() => undefined}
          labels={() => []}
          onLabelsCreated={vi.fn()}
          onSubmitted={vi.fn()}
          expanded={() => false}
          setExpanded={vi.fn()}
        />
      </TestContext>
    ));

    const received = new WorklogFormView(container);
    expect(received.values()).toEqual({
      id: "NaN",
      duration: "1 hour",
      time: "00:00",
      name: "",
      notes: "",
      labels: [],
    });
  });

  it("populates from an existing worklog", () => {
    const worklog = testWorklog({
      id: 1,
      duration: "2 hours",
      time: "2026-08-25T07:00:00.000Z", //UTC will be converted
      name: "Test",
      notes: "Test notes",
      labels: [
        { id: 1, name: "test" },
        { id: 2, name: "test 2" },
      ],
    });
    const { container } = render(() => (
      <TestContext>
        <WorklogForm
          worklog={() => worklog}
          labels={() => []}
          onLabelsCreated={vi.fn()}
          onSubmitted={vi.fn()}
          expanded={() => false}
          setExpanded={vi.fn()}
        />
      </TestContext>
    ));

    const received = new WorklogFormView(container);
    expect(received.values()).toEqual({
      id: "1",
      duration: "2 hours",
      time: "07:00",
      name: "Test",
      notes: "Test notes",
      labels: ["test", "test 2"],
    });
  });

  describe("updates existing worklog", () => {
    const worklog = testWorklog({ id: 1 });
    const $post = vi.fn();
    const { container } = render(() => (
      <TestContext
        api={{ worklog: { $post } }}
        time={new TestTimeAPI("America/Denver", "2020-01-01T01:00")}
      >
        <WorklogForm
          worklog={() => worklog}
          labels={() => []}
          onLabelsCreated={vi.fn()}
          onSubmitted={vi.fn()}
          expanded={() => false}
          setExpanded={vi.fn()}
        />
      </TestContext>
    ));

    const form = new WorklogFormView(container);

    it("updates the worklog", () => {
      form.setValues({
        name: "Test",
        duration: "2 hours",
        time: "01:00",
        notes: "Test notes",
        labels: [
          { input: "test", select: "Create test" },
          { input: "test 2", select: "Create test 2" },
        ],
      });

      expect(form.values()).toEqual({
        id: "1",
        duration: "2 hours",
        time: "01:00",
        name: "Test",
        notes: "Test notes",
        labels: ["test", "test 2"],
      });
    });

    it("posts the updated worklog", () => {
      form.submit();
      expect($post).toHaveBeenCalledExactlyOnceWith({
        json: {
          duration: "1 hour",
          id: 1,
          labels: [{ name: "test" }, { name: "test 2" }],
          name: "Test work",
          notes: "Test notes",
          time: "2020-01-01T05:30:00-07:00",
        },
      });
    });
  });
});
