import "jasmine";
import { Ball } from "./Ball";
import { Vector } from "./Vector";

function calculateKineticEnergy(ball: Ball): number {
	return ball.mass * Math.pow(ball.velocity.length, 2) / 2;
}

function calculatePotentialEnergy(ball: Ball, lowerBound: Vector): number {
	return ball.mass * Math.abs(ball.acceleration.y) * (ball.position.y - lowerBound.y);
}

function calculateEnergy(ball: Ball, lowerBound: Vector): number {
	return calculateKineticEnergy(ball) + calculatePotentialEnergy(ball, lowerBound);
}

function checkEnergyLevels(before: ReadonlyArray<Ball>, after: ReadonlyArray<Ball>, lowerBound: Vector, exceptionMessage: string): void {
	expect(after.reduce((s, b) => s + calculateEnergy(b, lowerBound), 0))
		.toBeCloseTo(
			before.reduce((s, b) => s + calculateEnergy(b, lowerBound), 0),
			matchingPrecision,
			exceptionMessage
		);
}

const matchingPrecision = 4;

const boundRadius = 5;
const upperBound = Vector.One.scale(boundRadius);
const lowerBound = upperBound.negative;

describe("Balls", () => {
	it("should bounce against edges", () => {
		const radius = 1;
		const intersectRadius = 0.05;
		const gravity = Vector.Down.scale(9.8);
		const directions = [
			Vector.Up,
			Vector.Left,
			Vector.Right,
			Vector.Down
		];

		for (const direction of directions) {
			const before = new Ball(
				radius,
				1,
				direction.scale(boundRadius - (radius - intersectRadius)),
				direction,
				gravity
			);
			const after = before.bounceAgainstEdge(lowerBound, upperBound);

			expect(before.velocity.x > 0 ? after.velocity.x < 0 : after.velocity.x >= 0)
				.toBeTruthy(`should flip x-velocity when bouncing in ${direction} direction`);
			expect(before.velocity.y > 0 ? after.velocity.y < 0 : after.velocity.y >= 0)
				.toBeTruthy(`should flip y-velocity when bouncing in ${direction} direction`);

			checkEnergyLevels([before], [after], lowerBound, `energy should remain the same after bouncing`);
		}
	});

	describe("should bounce against each other", () => {
		it("and only change velocity in one direction when the bounce is perpendicular", () => {
			const radius = 1;
			const intersectRadius = 0.05;
			const speed = 1;
			const aBefore = new Ball(
				radius,
				1,
				new Vector(-(radius - intersectRadius), 0),
				new Vector(speed, speed)
			);
			const bBefore = new Ball(
				radius,
				1,
				new Vector(radius - intersectRadius, 0),
				new Vector(-speed, -speed)
			);

			const [aAfter, bAfter] = Ball.bounceAgainstEachOther(aBefore, bBefore);

			expect(aAfter.velocity.x).toBeCloseTo(-aBefore.velocity.x, matchingPrecision, `should flip along the x-axis`);
			expect(aAfter.velocity.y).toBeCloseTo(aBefore.velocity.y, matchingPrecision, `should remain the same along the y-axis`);
			expect(bAfter.velocity.x).toBeCloseTo(-bBefore.velocity.x, matchingPrecision, `should flip along the x-axis`);
			expect(bAfter.velocity.y).toBeCloseTo(bBefore.velocity.y, matchingPrecision, `should remain the same along the y-axis`);

			checkEnergyLevels([aBefore, bBefore], [aAfter, bAfter], lowerBound, `energy should remain the same after bouncing`);
		});

		it("and keep the energy levels", () => {
			const radius = 1;
			const intersectRadius = 0.0005;
			const maxSpeed = 1;
			const maxGravity = 10;

			for (let i = 0; i < 10; i++) {
				const gravity = Vector.Down.scale(Math.random() * maxGravity);

				const aBefore = new Ball(
					radius,
					1,
					Vector.Zero,
					Vector.Right.rotate(Math.random() * Math.PI + Math.PI / 2).scale(Math.random() * maxSpeed),
					gravity
				);
				const bBefore = new Ball(
					radius,
					1,
					Vector.Right.rotate(Math.random() * 2 * Math.PI).scale((radius - intersectRadius) * 2),
					Vector.Right.rotate(Math.random() * Math.PI + Math.PI / 2).scale(Math.random() * maxSpeed),
					gravity
				);

				const [aAfter, bAfter] = Ball.bounceAgainstEachOther(aBefore, bBefore);

				checkEnergyLevels([aBefore, bBefore], [aAfter, bAfter], lowerBound, `energy should remain the same after bouncing`);
			}
		});
	});

	it("should step and keep their energy levels", () => {
		const radius = 1;
		const maxSpeed = 1;
		const maxGravity = 10;

		for (let i = 0; i < 10; i++) {
			const gravity = Vector.Down.scale(Math.random() * maxGravity);

			const before = new Ball(
				radius,
				1,
				Vector.Zero,
				Vector.Right.rotate(Math.random() * Math.PI + Math.PI / 2).scale(Math.random() * maxSpeed),
				gravity
			);

			// Take one step at 30 fps
			const after = before.step(1 / 30);

			checkEnergyLevels([before], [after], lowerBound, `energy should remain the same after stepping`);
		}
	});
});