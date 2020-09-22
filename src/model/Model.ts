import { Ball } from "./Ball";
import { Vector } from "./Vector";

/**
 * An immutable physics model.
 */
export class Model {
	public constructor(
		/** The lower left corner of the room. */
		public readonly lowerBound: Vector,
		/** The upper right corner of the room. */
		public readonly upperBound: Vector,
		public readonly balls: ReadonlyArray<Ball> = new Array<Ball>()
	) { }

	/**
	 * Returns a model like this, except with the lowerBound of `lowerBound`.
	 */
	public withLowerBound(lowerBound: Vector): Model {
		return new Model(lowerBound, this.upperBound, this.balls);
	}
	/**
	 * Returns a model like this, except with the upperBound of `upperBound`.
	 */
	public withUpperBound(upperBound: Vector): Model {
		return new Model(this.lowerBound, upperBound, this.balls);
	}
	/**
	 * Returns a model like this, except with the balls of `balls`.
	 */
	public withBalls(balls: ReadonlyArray<Ball>): Model {
		return new Model(this.lowerBound, this.upperBound, balls);
	}

	/**
	 * Returns a model that also contains the ball `ball`.
	 */
	public addBall(ball: Ball): Model {
		return this.withBalls(new Array<Ball>(...this.balls, ball));
	}

	/**
	 * Returns this model, but stepped `deltaTime` seconds though the
	 * simulation.
	 */
	public step(deltaTime: number): Model {
		return this.withBalls(
			this.bounceAllBallsAgainstEachOther()
				.map(b => b.bounceAgainstEdge(this.lowerBound, this.upperBound))
				.map(b => b.step(deltaTime))
		);
	}

	/**
	 * Returns a list where all balls velocities might have updated because of
	 * possible bounces against other balls.
	 */
	private bounceAllBallsAgainstEachOther(): ReadonlyArray<Ball> {
		const tempBalls = new Array<Ball>(...this.balls);

		for (let i = 0; i < tempBalls.length; i++) {
			for (let j = i + 1; j < tempBalls.length; j++) {
				[tempBalls[i], tempBalls[j]] = Ball.bounceAgainstEachOther(tempBalls[i], tempBalls[j]);
			}
		}

		return tempBalls;
	}
}