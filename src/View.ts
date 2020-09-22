import { Model, Vector } from "./model";

export class View {
	private readonly context: CanvasRenderingContext2D;

	/**
	 * The width of the rendering target.
	 */
	public get width(): number {
		return this.context.canvas.width;
	}
	/**
	 * The height of the rendering target.
	 */
	public get height(): number {
		return this.context.canvas.height;
	}

	public constructor(canvas: HTMLCanvasElement) {
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;

		this.context = canvas.getContext("2d");
	}

	/**
	 * Returns a set of functions and properties that can be used to transform
	 * Vectors between model and screen.
	 */
	public transformers(model: Model) {
		const height = this.height;
		const widthRatio = this.width / (model.upperBound.x - model.lowerBound.x);
		const heightRatio = this.height / (model.upperBound.y - model.lowerBound.y);

		return {
			widthRatio,
			heightRatio,
			/**
			 * Transforms `point` from a model relative vector to a screen
			 * relative vector.
			 */
			pointToScreen(point: Vector): Vector {
				return point
					.subtract(model.lowerBound)
					.withX(x => x * widthRatio)
					.withY(y => height - y * heightRatio);
			},
			/**
			 * Transforms `screen` from a screen relative vector to a model
			 * relative vector.
			 */
			screenToPoint(screen: Vector): Vector {
				return screen
					.withX(x => x / widthRatio)
					.withY(y => (height - y) / heightRatio)
					.add(model.lowerBound);
			}
		};
	}

	/**
	 * Renders the given model to the render target.
	 */
	public render(model: Model, debug: boolean = false): void {
		const transformers = this.transformers(model);

		const ballColor = "#da5555";
		const color = window.getComputedStyle(document.documentElement).getPropertyValue("--color");
		const colorInverted = window.getComputedStyle(document.documentElement).getPropertyValue("--color-inverted");

		this.context.clearRect(0, 0, this.width, this.height);

		for (const ball of model.balls) {
			const screenPosition = transformers.pointToScreen(ball.position);

			// Draws the ball
			this.context.beginPath();
			this.context.ellipse(
				screenPosition.x,
				screenPosition.y,
				ball.radius * transformers.widthRatio,
				ball.radius * transformers.heightRatio,
				0, 0, Math.PI * 2
			);
			this.context.fillStyle = ballColor;
			this.context.fill();

			if (debug) {
				// Draws a line representing the velocity
				this.context.beginPath();
				this.context.lineTo(screenPosition.x, screenPosition.y);
				this.context.lineTo(
					screenPosition.x + ball.velocity.normalized.x * ball.radius * transformers.widthRatio,
					screenPosition.y - ball.velocity.normalized.y * ball.radius * transformers.heightRatio
				);
				this.context.strokeStyle = colorInverted;
				this.context.stroke();

				// Prints the position and velocity
				this.context.fillStyle = color;
				this.context.font = `12px "Courier New", Courier, monospace`;
				this.context.textAlign = "center";
				this.context.textBaseline = "ideographic";
				this.context.fillText(`📍${ball.position.toString()}`, screenPosition.x, screenPosition.y - 1);
				this.context.textBaseline = "hanging";
				this.context.fillText(`💨${ball.velocity.toString()}`, screenPosition.x, screenPosition.y + 1);
			}
		}
	}
}