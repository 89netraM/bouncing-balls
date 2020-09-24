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
		const diff = i.position.subtract(j.position);
		const distance = diff.length - (i.radius + j.radius);
		if (distance <= 0) {
			// u is before and v is after
			// Equation system:
			// mᵢvᵢ + mⱼvⱼ = mᵢuᵢ + mⱼuⱼ
			// vⱼ - vᵢ = -(uⱼ - uᵢ)

			const angleDiff = diff.angle();

			const uᵢ = i.velocity.rotate(-angleDiff);
			const uⱼ = j.velocity.rotate(-angleDiff);

			// vᵢ = (mᵢuᵢ + mⱼuⱼ + (uⱼ - uᵢ) * mⱼ) / (mᵢ + mⱼ)
			const vᵢ = new Vector((i.mass * uᵢ.x + j.mass * uⱼ.x + (uⱼ.x - uᵢ.x) * j.mass) / (i.mass + j.mass), uᵢ.y);
			// vⱼ = vᵢ - (uⱼ - uᵢ)
			const vⱼ = new Vector(vᵢ.x - (uⱼ.x - uᵢ.x), uⱼ.y);

			return [
				i.withVelocity(vᵢ.rotate(angleDiff))
					// Move out of each others way relative to each others mass
					.withPosition(i.position.subtract(diff.normalized.scale((distance * j.mass) / (i.mass + j.mass)))),
				j.withVelocity(vⱼ.rotate(angleDiff))
					// Move out of each others way relative to each others mass
					.withPosition(j.position.add(diff.normalized.scale((distance * i.mass) / (i.mass + j.mass))))
			];
		}
		else {
			return [i, j];
		}
	}

	/**
	 * The mass of this ball, relative to its area.
	 */
	public get mass(): number {
		return Math.PI * Math.pow(this.radius, 2) * this.density;
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
		// Move in to the room if some part is outside.
		const moved = this.withPosition(
			this.position
				.withX(x => x - this.radius <= lowerBound.x ? lowerBound.x + this.radius : upperBound.x <= x + this.radius ? upperBound.x - this.radius : x)
				.withY(y => y - this.radius <= lowerBound.y ? lowerBound.y + this.radius : upperBound.y <= y + this.radius ? upperBound.y - this.radius : y)
		);

		return moved
			.withVelocity(
				moved.velocity
					// Change the velocity relative to the move to preserve the energy.
					.withX(x => moved.position.x !== this.position.x ? Math.sqrt(2 * moved.acceleration.x * (moved.position.x - this.position.x) + Math.pow(x, 2)) : x)
					// Flip the sign if "in" the edge.
					.withX(x => this.position.x - this.radius <= lowerBound.x ? Math.abs(x) : upperBound.x <= this.position.x + this.radius ? -Math.abs(x) : x)
					// Change the velocity relative to the move to preserve the energy.
					.withY(y => moved.position.y !== this.position.y ? Math.sqrt(2 * moved.acceleration.y * (moved.position.y - this.position.y) + Math.pow(y, 2)) : y)
					// Flip the sign if "in" the edge.
					.withY(y => this.position.y - this.radius <= lowerBound.y ? Math.abs(y) : upperBound.y <= this.position.y + this.radius ? -Math.abs(y) : y)
			);
	}

	/**
	 * Returns this ball, but stepped `deltaTime` seconds though the
	 * simulation.
	 */
	public step(deltaTime: number): Ball {
		// Average velocity before and after because reality is continues but
		// the simulation is incremental.
		const temp = this
			.withVelocity(this.velocity.add(this.acceleration.scale(deltaTime)));
		return temp
			.withPosition(this.position.add(this.velocity.scale(deltaTime).add(temp.velocity.scale(deltaTime)).scale(1 / 2)));
	}
}