import { vi, Mock } from "vitest";

import { AppContext, AppContextValue } from "@/context";
import { ApiClient } from "@/api";
import { TestTimeAPI } from "@/test/TestTimeAPI";
import { splitProps, ParentComponent } from "solid-js";
import { jsonResponse, mockJSONRequest } from "./fixtures";

type MockedApi<T> = { [K in keyof T]?: Mock };

type ApiOverrides = {
  worklog?: MockedApi<ApiClient["worklog"]>;
  label?: MockedApi<ApiClient["label"]>;
};

type AppContextOverrides = {
  api?: ApiOverrides;
  time?: TestTimeAPI;
};

function testContext(overrides: AppContextOverrides): AppContextValue {
  const api = {
    worklog: {
      $post: mockJSONRequest({}),
      $delete: mockJSONRequest({}),
      $get: mockJSONRequest([]),
      ...overrides.api?.worklog,
    },
    label: {
      $get: mockJSONRequest([]),
      ...overrides.api?.label,
    },
  } as any;

  const time = overrides.time ?? new TestTimeAPI("UTC", "1970-01-01T00:00");

  return { api, time };
}

export const TestContext: ParentComponent<AppContextOverrides> = (props) => {
  const [_, overrides] = splitProps(props, ["children"]);
  const context = testContext(overrides);

  return (
    <AppContext.Provider value={context}>{props.children}</AppContext.Provider>
  );
};
