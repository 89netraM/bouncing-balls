import "jasmine";
import fc, { Arbitrary } from "fast-check";
import { Vector } from "./Vector";

/**
 * Returns an arbitrary for Vectors in the given range.
 *
 * @param minMaxX Max value, or min and max value.
 * @param minMaxY Max value, or min and max value.
 */
export function arbitraryVector(minMaxX: [number, number?], minMaxY: [number, number?]): Arbitrary<Vector> {
	return fc.tuple(
		fc.float(...minMaxX),
		fc.float(...minMaxY)
	).map(t => new Vector(...t));
}

describe("Normalized Vectors", () => {
	it("should have a length of 1", () => {
		fc.assert(
			fc.property(arbitraryVector([-100, 100], [-100, 100]), v => {
				const normalized = v.normalized;
				expect(normalized.length).toBeCloseTo(1);
			})
		);
	});
});

describe("Vector angles", () => {
	describe("relative to self", () => {
		it("should be in the first quadrant", () => {
			fc.assert(
				fc.property(arbitraryVector([100], [100]), v => {
					const angle = v.angle();
					expect(angle).toBeGreaterThanOrEqual(0, `for vector ${v.toString()}`);
					expect(angle).toBeLessThanOrEqual(Math.PI / 2, `for vector ${v.toString()}`);
				})
			);
		});
		it("should be in the second quadrant", () => {
			fc.assert(
				fc.property(arbitraryVector([-100, 0], [100]), v => {
					const angle = v.angle();
					expect(angle).toBeGreaterThanOrEqual(Math.PI / 2, `for vector ${v.toString()}`);
					expect(angle).toBeLessThanOrEqual(Math.PI, `for vector ${v.toString()}`);
				})
			);
		});
		it("should be in the first negative quadrant", () => {
			fc.assert(
				fc.property(arbitraryVector([100], [-100, 0]), v => {
					const angle = v.angle();
					expect(angle).toBeLessThanOrEqual(0, `for vector ${v.toString()}`);
					expect(angle).toBeGreaterThanOrEqual(-Math.PI / 2, `for vector ${v.toString()}`);
				})
			);
		});
		it("should be in the second negative quadrant", () => {
			fc.assert(
				fc.property(arbitraryVector([-100, 0], [-100, 0]), v => {
					const angle = v.angle();
					expect(angle).toBeLessThanOrEqual(-Math.PI / 2, `for vector ${v.toString()}`);
					expect(angle).toBeGreaterThanOrEqual(-Math.PI, `for vector ${v.toString()}`);
				})
			);
		});
	});

	describe("relative to other", () => {
		it("should be in the first quadrant", () => {
			fc.assert(
				fc.property(arbitraryVector([100], [100]), arbitraryVector([100], [100]), (a, b) => {
					const angle = a.angle(b);
					expect(angle).toBeGreaterThanOrEqual(-Math.PI / 2, `for vectors ${a.toString()} and ${b.toString()}`);
					expect(angle).toBeLessThanOrEqual(Math.PI / 2, `for vectors ${a.toString()} and ${b.toString()}`);
				})
			);
		});
		it("should be in the second quadrant", () => {
			fc.assert(
				fc.property(arbitraryVector([100], [100]), arbitraryVector([-100, 0], [100]), (a, b) => {
					const angle = a.angle(b);
					expect(angle).toBeGreaterThanOrEqual(0, `for vectors ${a.toString()} and ${b.toString()}`);
					expect(angle).toBeLessThanOrEqual(Math.PI, `for vectors ${a.toString()} and ${b.toString()}`);
				})
			);
		});
		it("should be in the first negative quadrant", () => {
			fc.assert(
				fc.property(arbitraryVector([100], [100]), arbitraryVector([100], [-100, 0]), (a, b) => {
					const angle = a.angle(b);
					expect(angle).toBeGreaterThanOrEqual(-Math.PI, `for vectors ${a.toString()} and ${b.toString()}`);
					expect(angle).toBeLessThanOrEqual(0, `for vectors ${a.toString()} and ${b.toString()}`);
				})
			);
		});
		it("should be in the second negative quadrant", () => {
			fc.assert(
				fc.property(arbitraryVector([100], [100]), arbitraryVector([-100, 0], [-100, 0]), (a, b) => {
					const angle = a.angle(b);

					if (angle < 0) {
						expect(angle).toBeGreaterThanOrEqual(-Math.PI, `for vectors ${a.toString()} and ${b.toString()}`);
						expect(angle).toBeLessThanOrEqual(-Math.PI / 2, `for vectors ${a.toString()} and ${b.toString()}`);
					}
					else {
						expect(angle).toBeLessThanOrEqual(Math.PI, `for vectors ${a.toString()} and ${b.toString()}`);
						expect(angle).toBeGreaterThanOrEqual(Math.PI / 2, `for vectors ${a.toString()} and ${b.toString()}`);
					}
				})
			);
		});
	});
});

describe("Rotating Vectors", () => {
	it("should never change its length", () => {
		fc.assert(
			fc.property(arbitraryVector([-100, 100], [-100, 100]), fc.float(-Math.PI, Math.PI), (before, rotation) => {
				const after = before.rotate(rotation);
				expect(after.length).toBeCloseTo(before.length);
			})
		);
	});

	it("should produce a Vector relative at the given angle", () => {
		fc.assert(
			fc.property(arbitraryVector([-100, 100], [-100, 100]), fc.float(-Math.PI, Math.PI), (before, rotation) => {
				const after = before.rotate(rotation);
				expect((before.angle(after) + 2 * Math.PI) % (2 * Math.PI)).toBeCloseTo((rotation + 2 * Math.PI) % (2 * Math.PI));
			})
		);
	});
});