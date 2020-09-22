import "jasmine";
import { Vector } from "./Vector";

describe("Normalized Vectors", () => {
	it("should have a length of 1", () => {
		for (let i = 0; i < 10; i++) {
			const v = new Vector(
				Math.random() * 20 - 10,
				Math.random() * 20 - 10
			).normalized;
			expect(v.length).toBeCloseTo(1);
		}
	});
});

describe("Vector angles", () => {
	describe("relative to self", () => {
		it("should be in the first quadrant", () => {
			for (let i = 0; i < 10; i++) {
				const v = new Vector(
					Math.random() * 10,
					Math.random() * 10
				);
				const angle = v.angle();
				expect(angle).toBeGreaterThanOrEqual(0);
				expect(angle).toBeLessThanOrEqual(Math.PI / 2);
			}
		});
		it("should be in the second quadrant", () => {
			for (let i = 0; i < 10; i++) {
				const v = new Vector(
					Math.random() * -10,
					Math.random() * 10
				);
				const angle = v.angle();
				expect(angle).toBeGreaterThanOrEqual(Math.PI / 2);
				expect(angle).toBeLessThanOrEqual(Math.PI);
			}
		});
		it("should be in the first negative quadrant", () => {
			for (let i = 0; i < 10; i++) {
				const v = new Vector(
					Math.random() * 10,
					Math.random() * -10
				);
				const angle = v.angle();
				expect(angle).toBeLessThanOrEqual(0);
				expect(angle).toBeGreaterThanOrEqual(-Math.PI / 2);
			}
		});
		it("should be in the second negative quadrant", () => {
			for (let i = 0; i < 10; i++) {
				const v = new Vector(
					Math.random() * -10,
					Math.random() * -10
				);
				const angle = v.angle();
				expect(angle).toBeLessThanOrEqual(-Math.PI / 2);
				expect(angle).toBeGreaterThanOrEqual(-Math.PI);
			}
		});
	});

	describe("relative to other", () => {
		it("should be in the first quadrant", () => {
			for (let i = 0; i < 10; i++) {
				const a = new Vector(
					Math.random() * 10,
					Math.random() * 10
				);
				const b = new Vector(
					Math.random() * 10,
					Math.random() * 10
				);
				const angle = a.angle(b);
				expect(angle).toBeGreaterThanOrEqual(-Math.PI / 2);
				expect(angle).toBeLessThanOrEqual(Math.PI / 2);
			}
		});
		it("should be in the second quadrant", () => {
			for (let i = 0; i < 10; i++) {
				const a = new Vector(
					Math.random() * 10,
					Math.random() * 10
				);
				const b = new Vector(
					Math.random() * -10,
					Math.random() * 10
				);
				const angle = a.angle(b);
				expect(angle).toBeGreaterThanOrEqual(0);
				expect(angle).toBeLessThanOrEqual(Math.PI);
			}
		});
		it("should be in the first negative quadrant", () => {
			for (let i = 0; i < 10; i++) {
				const a = new Vector(
					Math.random() * 10,
					Math.random() * 10
				);
				const b = new Vector(
					Math.random() * 10,
					Math.random() * -10
				);
				const angle = a.angle(b);
				expect(angle).toBeGreaterThanOrEqual(-Math.PI);
				expect(angle).toBeLessThanOrEqual(0);
			}
		});
		it("should be in the second negative quadrant", () => {
			for (let i = 0; i < 10; i++) {
				const a = new Vector(
					Math.random() * 10,
					Math.random() * 10
				);
				const b = new Vector(
					Math.random() * -10,
					Math.random() * -10
				);
				const angle = a.angle(b);

				if (angle < 0) {
					expect(angle).toBeGreaterThanOrEqual(-Math.PI);
					expect(angle).toBeLessThanOrEqual(-Math.PI / 2);
				}
				else {
					expect(angle).toBeLessThanOrEqual(Math.PI);
					expect(angle).toBeGreaterThanOrEqual(Math.PI / 2);
				}
			}
		});
	});
});

describe("Rotating Vectors", () => {
	it("should never change its length", () => {
		for (let i = 0; i < 10; i++) {
			const before = new Vector(
				Math.random() * 20 - 10,
				Math.random() * 20 - 10
			);
			const after = before.rotate(Math.random() * 4 * Math.PI - 2 * Math.PI);
			expect(after.length).toBeCloseTo(before.length);
		}
	});

	it("should produce a Vector relative at the given angle", () => {
		for (let i = 0; i < 10; i++) {
			const before = new Vector(
				Math.random() * 20 - 10,
				Math.random() * 20 - 10
			);
			const rotation = Math.random() * 4 * Math.PI - 2 * Math.PI;
			const after = before.rotate(rotation);
			expect((before.angle(after) + 2 * Math.PI) % (2 * Math.PI)).toBeCloseTo((rotation + 2 * Math.PI) % (2 * Math.PI));
		}
	});
});