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
	 * Renders the given model to the render target.
	 */
	public render(model: Model, debug: boolean = false): void {
		const widthRatio = this.width / (model.upperBound.x - model.lowerBound.x);
		const heightRatio = this.height / (model.upperBound.y - model.lowerBound.y);

		const ballColor = "#da5555";
		const color = window.getComputedStyle(document.documentElement).getPropertyValue("--color");
		const colorInverted = window.getComputedStyle(document.documentElement).getPropertyValue("--color-inverted");

		/**
		 * Transforms `position` from a model relative vector to a screen
		 * relative vector.
		 */
		const transformPosition = (position: Vector): Vector => {
			return position
				.subtract(model.lowerBound)
				.withX(x => x * widthRatio)
				.withY(y => this.height - y * heightRatio);
		};

		this.context.clearRect(0, 0, this.width, this.height);

		for (const ball of model.balls) {
			const screenPosition = transformPosition(ball.position);

			// Draws the ball
			this.context.beginPath();
			this.context.ellipse(
				screenPosition.x,
				screenPosition.y,
				ball.radius * widthRatio,
				ball.radius * heightRatio,
				0, 0, Math.PI * 2
			);
			this.context.fillStyle = ballColor;
			this.context.fill();

			if (debug) {
				// Draws a line representing the velocity
				this.context.beginPath();
				this.context.lineTo(screenPosition.x, screenPosition.y);
				this.context.lineTo(
					screenPosition.x + ball.velocity.normalized.x * ball.radius * widthRatio,
					screenPosition.y - ball.velocity.normalized.y * ball.radius * heightRatio
				);
				this.context.strokeStyle = colorInverted;
				this.context.stroke();

				// Prints the position and velocity
				this.context.fillStyle = color;
				// this.context.font = `12px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif`;
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