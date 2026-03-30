import { describe, expect, it } from "vitest";
import { mapCdekStatusToOrderStatus } from "@/lib/cdek";

describe("mapCdekStatusToOrderStatus", () => {
  it("maps processing codes", () => {
    expect(mapCdekStatusToOrderStatus("CREATED")).toBe("PROCESSING");
    expect(mapCdekStatusToOrderStatus("RECEIVED_AT_SHIPMENT_WAREHOUSE")).toBe("PROCESSING");
  });

  it("maps shipped codes", () => {
    expect(mapCdekStatusToOrderStatus("IN_TRANSIT")).toBe("SHIPPED");
    expect(mapCdekStatusToOrderStatus("SHIPPED")).toBe("SHIPPED");
  });

  it("maps delivered", () => {
    expect(mapCdekStatusToOrderStatus("DELIVERED")).toBe("DELIVERED");
  });

  it("returns null for unknown", () => {
    expect(mapCdekStatusToOrderStatus("UNKNOWN_CODE_XYZ")).toBeNull();
  });
});
