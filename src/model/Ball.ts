import { Vector } from "./Vector";

/**
 * An immutable Ball.
 */
export class Ball {
	/**
	 * If needed bounces the two balls against each other and updates their
	 * velocities accordingly.
	 *
	 * Returns a tuple with the new state of the balls in the same order as
	 * they were given.
	 */
	public static bounceAgainstEachOther(i: Ball, j: Ball): [i: Ball, j: Ball] {
		if (i.position.distanceTo(j.position) <= i.radius + j.radius) {
			// u is before and v is after
			// Equation system:
			// mᵢvᵢ + mⱼvⱼ = mᵢuᵢ + mⱼuⱼ
			// vⱼ - vᵢ = -(uⱼ - uᵢ)

			const uᵢ = i.velocity;
			const uⱼ = j.velocity;

			// vᵢ = (mᵢuᵢ + mⱼuⱼ + (uⱼ - uᵢ) * mⱼ) / (mᵢ + mⱼ)
			const vᵢ = uᵢ.scale(i.mass).add(uⱼ.scale(j.mass)).add(uⱼ.subtract(uᵢ).scale(j.mass)).scale(1 / (i.mass + j.mass));
			// vⱼ = vᵢ - (uⱼ - uᵢ)
			const vⱼ = vᵢ.subtract(uⱼ.subtract(uᵢ));

			return [
				i.withVelocity(vᵢ),
				j.withVelocity(vⱼ)
			];
		}
		else {
			return [i, j];
		}
	}

	public get mass(): number {
		return 2 * Math.PI * Math.pow(this.radius, 2) * this.density;
	}

	public constructor(
		public readonly radius: number,
		public readonly density: number,
		public readonly position: Vector,
		public readonly velocity: Vector = Vector.Zero,
		public readonly acceleration: Vector = Vector.Zero
	) { }

	/**
	 * Returns a ball like this, except with the radius of `radius`.
	 */
	public withRadius(radius: number): Ball {
		return new Ball(radius, this.density, this.position, this.velocity, this.acceleration);
	}
	/**
	 * Returns a ball like this, except with the density of `density`.
	 */
	public withDensity(density: number): Ball {
		return new Ball(this.radius, density, this.position, this.velocity, this.acceleration);
	}
	/**
	 * Returns a ball like this, except with the position of `position`.
	 */
	public withPosition(position: Vector): Ball {
		return new Ball(this.radius, this.density, position, this.velocity, this.acceleration);
	}
	/**
	 * Returns a ball like this, except with the velocity of `velocity`.
	 */
	public withVelocity(velocity: Vector): Ball {
		return new Ball(this.radius, this.density, this.position, velocity, this.acceleration);
	}
	/**
	 * Returns a ball like this, except with the acceleration of
	 * `acceleration`.
	 */
	public withAcceleration(acceleration: Vector): Ball {
		return new Ball(this.radius, this.density, this.position, this.velocity, acceleration);
	}

	/**
	 * Returns a ball like this, that might have bounced off of the edges
	 * of the room specified by the given bounds.
	 *
	 * @param lowerBound The lower left corner of the room.
	 * @param upperBound The upper right corner of the room.
	 */
	public bounceAgainstEdge(lowerBound: Vector, upperBound: Vector): Ball {
		return this
			.withVelocity(
				this.velocity
					.withX(this.position.x - this.radius <= lowerBound.x ? Math.abs(this.velocity.x) : upperBound.x <= this.position.x + this.radius ? -Math.abs(this.velocity.x) : this.velocity.x)
					.withY(this.position.y - this.radius <= lowerBound.y ? Math.abs(this.velocity.y) : upperBound.y <= this.position.y + this.radius ? -Math.abs(this.velocity.y) : this.velocity.y)
			);
	}
	// public bounceAgainstEdge(lowerBound: Vector, upperBound: Vector): Ball {
	// 	const velocityBefore = this.mass * Math.pow(this.velocity.length, 2) / 2;
	// 	const momentumBefore = this.mass * this.velocity.length;
	// 	const temp = this.withVelocity(
	// 		this.velocity
	// 			.withX(this.position.x - this.radius <= lowerBound.x ? Math.abs(this.velocity.x) : upperBound.x <= this.position.x + this.radius ? -Math.abs(this.velocity.x) : this.velocity.x)
	// 			.withY(this.position.y - this.radius <= lowerBound.y ? Math.abs(this.velocity.y) : upperBound.y <= this.position.y + this.radius ? -Math.abs(this.velocity.y) : this.velocity.y)
	// 	);
	// 	const velocityAfter = temp.mass * Math.pow(temp.velocity.length, 2) / 2;
	// 	const momentumAfter = temp.mass * temp.velocity.length;
	// 	console.log(velocityBefore, velocityAfter, velocityAfter - velocityBefore);
	// 	if (velocityAfter - velocityBefore !== 0) {
	// 		debugger;
	// 	}
	// 	console.log(momentumBefore, momentumAfter, momentumAfter - momentumBefore);
	// 	if (momentumAfter - momentumBefore !== 0) {
	// 		debugger;
	// 	}
	// 	return temp;
	// }

	/**
	 * Returns this ball, but stepped `deltaTime` seconds though the
	 * simulation.
	 */
	// public step(deltaTime: number): Ball {
	// 	return this
	// 		.withPosition(this.position.add(this.velocity.scale(deltaTime)))
	// 		.withVelocity(this.velocity.add(this.acceleration.scale(deltaTime)));
	// }
	public step(deltaTime: number): Ball {
		const temp = this
			.withVelocity(this.velocity.add(this.acceleration.scale(deltaTime)));
		return temp
			.withPosition(this.position.add(this.velocity.scale(deltaTime).add(temp.velocity.scale(deltaTime)).scale(1 / 2)));
	}
}