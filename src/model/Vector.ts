/**
 * An immutable 2D vector.
 */
export class Vector {
	public static readonly Zero = new Vector(0, 0);
	public static readonly One = new Vector(1, 1);
	public static readonly Up = new Vector(0, 1);
	public static readonly Left = new Vector(-1, 0);
	public static readonly Right = new Vector(1, 0);
	public static readonly Down = new Vector(0, -1);

	/**
	 * The length of this vector.
	 */
	public get length(): number {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}

	/**
	 * The normalized version of this vector.
	 */
	public get normalized(): Vector {
		return this.scale(1 / this.length);
	}

	/**
	 * The negative version of this vector.
	 */
	public get negative(): Vector {
		return new Vector(-this.x, -this.y);
	}

	/**
	 * Constructs a new vector with the given lengths.
	 */
	public constructor(
		public readonly x: number,
		public readonly y: number
	) { }

	/**
	 * Returns a vector with this vectors y value and the x value of `x`.
	 */
	public withX(x: number): Vector;
	/**
	 * Returns a vector with this vectors y value and where the x value is
	 * transformed by `transformer`.
	 */
	public withX(transformer: (x: number) => number): Vector;
	public withX(transformer: number | ((x: number) => number)): Vector {
		if (transformer instanceof Function) {
			return new Vector(transformer(this.x), this.y);
		}
		else {
			return new Vector(transformer, this.y);
		}
	}
	/**
	 * Returns a vector with this vectors x value and the y value of `y`.
	 */
	public withY(y: number): Vector;
	/**
	 * Returns a vector with this vectors y value and where the x value is
	 * transformed by `transformer`.
	 */
	public withY(transformer: (y: number) => number): Vector;
	public withY(transformer: number | ((y: number) => number)): Vector {
		if (transformer instanceof Function) {
			return new Vector(this.x, transformer(this.y));
		}
		else {
			return new Vector(this.x, transformer);
		}
	}

	/**
	 * The angle from this vector to the the x-axis in radians.
	 */
	public angle(): number;
	/**
	 * The angle from this vector to the `other` vector in radians.
	 */
	public angle(other: Vector): number;
	public angle(other?: Vector): number {
		if (other == null) {
			other = Vector.Right;
		}

		return Math.atan2(this.x * other.y - this.y * other.x, this.dot(other));
	}

	/**
	 * Returns the result of adding `other` to this vector.
	 */
	public add(other: Vector): Vector {
		return new Vector(this.x + other.x, this.y + other.y);
	}
	/**
	 * Returns the result of subtracting `other` from this vector.
	 */
	public subtract(other: Vector): Vector {
		return this.add(other.negative);
	}

	/**
	 * Returns this vector scaled by `s`.
	 */
	public scale(s: number): Vector {
		return new Vector(this.x * s, this.y * s);
	}

	/**
	 * Returns the result of the dot product between this vector and `other`.
	 */
	public dot(other: Vector): number {
		return this.x * other.x + this.y * other.y;
	}

	/**
	 * Returns the distance between this vector and `other`.
	 */
	public distanceTo(other: Vector): number {
		return other.subtract(this).length;
	}

	/**
	 * Returns this vector rotated by `angle` radians.
	 */
	public rotate(angle: number): Vector {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		return new Vector(
			this.x * cos - this.y * sin,
			this.x * sin + this.y * cos
		);
	}

	/**
	 * Turns the vector into a pretty string.
	 */
	public toString(): string {
		return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
	}
}