import { and, type SQL } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";

export function withConditions<T extends PgSelect>(qb: T, conditions: SQL[]) {
  return qb.where(and(...conditions));
}

export interface Point {
  lat: number;
  lon: number;
}

export const geography = customType<{ data: Point; driverData: string }>({
  dataType() {
    return "geography(point)";
  },
  toDriver(value: Point): string {
    return `POINT(${value.lon} ${value.lat})`;
  },
  fromDriver(value: string): Point {
    let offset = 0;
    const buffer = Buffer.from(value, "hex");
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    const byteOrder = buffer[offset];
    offset += 1;

    const isLittleEndian = byteOrder === 1;
    const geomType = view.getUint32(offset, isLittleEndian);
    offset += 4;

    // SRID flag
    if (geomType & 0x20000000) {
      offset += 4;
    }

    if ((geomType & 0xffff) !== 1) {
      throw new Error("Unsupported geometry type");
    }

    const lon = view.getFloat64(offset, isLittleEndian);
    offset += 8;
    const lat = view.getFloat64(offset, isLittleEndian);

    return { lat, lon };
  },
});
