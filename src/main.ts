import "./styles.scss";
import { Ball, Model, Vector } from "./model";
import { View } from "./View";

const pixelsPerMeter = 200;

const gravity = new Vector(0, -9.8);
function getAcceleration(): Vector {
	return gravityToggle.checked ? gravity : Vector.Zero;
}

let view: View;
let model: Model;

let canvas: HTMLCanvasElement;

let debugToggle: HTMLInputElement;
let debugInfo: HTMLParagraphElement;
let energyDisplay: HTMLSpanElement;
let kineticDisplay: HTMLSpanElement;
let potentialDisplay: HTMLSpanElement;

let gravityToggle: HTMLInputElement;

let playButton: HTMLButtonElement;

let playingWhenLeaving: boolean = false;
let animationHandle: number = null;
let previousTimestamp: DOMHighResTimeStamp = null;

window.addEventListener(
	"load",
	() => {
		canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
		canvas.addEventListener("click", addBallClick, true);

		view = new View(canvas);

		debugToggle = document.getElementById("debug") as HTMLInputElement;
		debugToggle.addEventListener("change", () => { debugInfo.classList.toggle("visible", debugToggle.checked); view.render(model, debugToggle.checked); }, true);
		debugInfo = document.getElementById("debug-info") as HTMLParagraphElement;
		energyDisplay = document.getElementById("energy") as HTMLSpanElement;
		kineticDisplay = document.getElementById("kinetic") as HTMLSpanElement;
		potentialDisplay = document.getElementById("potential") as HTMLSpanElement;

		gravityToggle = document.getElementById("gravity") as HTMLInputElement;
		gravityToggle.addEventListener("change", () => model = model.withBalls(model.balls.map(b => b.withAcceleration(getAcceleration()))), true);

		playButton = document.getElementById("play") as HTMLButtonElement;
		playButton.addEventListener("click", togglePlaying, true);

		document.getElementById("restart").addEventListener("click", start, true);

		document.addEventListener("visibilitychange", onVisibilityChanged, true);

		start();
	},
	true
);

function start(): void {
	if (animationHandle != null) {
		window.cancelAnimationFrame(animationHandle);
	}

	model = new Model(
		new Vector(-view.width / 2 / pixelsPerMeter, -view.height / 2 / pixelsPerMeter),
		new Vector(view.width / 2 / pixelsPerMeter, view.height / 2 / pixelsPerMeter),
		new Array<Ball>(
			new Ball(
				0.2,
				1,
				new Vector(-1, 0),
				new Vector(1, 1),
				getAcceleration()
			),
			new Ball(
				0.3,
				1,
				new Vector(1, 0),
				new Vector(1, 1),
				getAcceleration()
			)
		)
	);

	animationHandle = window.requestAnimationFrame(updateFrame);
	
	playButton.classList.toggle("primary", false);
}

function isPlaying(): boolean {
	return animationHandle != null;
}

function togglePlaying(): void {
	if (isPlaying()) {
		pause();
	}
	else {
		resume();
	}
}

function pause(): void {
	window.cancelAnimationFrame(animationHandle);
	animationHandle = null;
	previousTimestamp = null;
	playButton.classList.toggle("primary", true);
}

function resume(): void {
	animationHandle = window.requestAnimationFrame(updateFrame);
	playButton.classList.toggle("primary", false);
}

function addBallClick(e: MouseEvent): void {
	const wasPlaying = isPlaying();
	if (wasPlaying) {
		pause();
	}

	const done = () => {
		if (wasPlaying) {
			resume();
		}
		else {
			view.render(model, debugToggle.checked);
		}

		document.getElementById("add-dialog-add").removeEventListener("click", ok, true);
		document.getElementById("add-dialog-cancel").removeEventListener("click", done, true);
		document.getElementById("add-dialog").setAttribute("data-open", `${false}`);
	};

	const ok = () => {
		const radius = (document.getElementById("add-dialog-radius") as HTMLInputElement).valueAsNumber;
		const density = (document.getElementById("add-dialog-density") as HTMLInputElement).valueAsNumber;
		const position = new Vector(
			(document.getElementById("add-dialog-position-x") as HTMLInputElement).valueAsNumber,
			(document.getElementById("add-dialog-position-y") as HTMLInputElement).valueAsNumber
		);
		const velocity = new Vector(
			(document.getElementById("add-dialog-velocity-x") as HTMLInputElement).valueAsNumber,
			(document.getElementById("add-dialog-velocity-y") as HTMLInputElement).valueAsNumber
		);

		model = model.withBalls([
			...model.balls,
			new Ball(
				radius,
				density,
				position,
				velocity,
				getAcceleration()
			)
		]);

		done();
	};

	const selectedPosition = view.transformers(model).screenToPoint(new Vector(e.x, e.y));

	(document.getElementById("add-dialog-radius") as HTMLInputElement).valueAsNumber = 0.3;
	(document.getElementById("add-dialog-density") as HTMLInputElement).valueAsNumber = 1;
	(document.getElementById("add-dialog-position-x") as HTMLInputElement).valueAsNumber = selectedPosition.x;
	(document.getElementById("add-dialog-position-y") as HTMLInputElement).valueAsNumber = selectedPosition.y;
	(document.getElementById("add-dialog-velocity-x") as HTMLInputElement).valueAsNumber = 0;
	(document.getElementById("add-dialog-velocity-y") as HTMLInputElement).valueAsNumber = 0;

	document.getElementById("add-dialog-add").addEventListener("click", ok, true);
	document.getElementById("add-dialog-cancel").addEventListener("click", done, true);

	document.getElementById("add-dialog").setAttribute("data-open", `${true}`);
}

function updateFrame(timestamp: DOMHighResTimeStamp): void {
	if (previousTimestamp != null) {
		model = model.step((timestamp - previousTimestamp) / 1000);
	}

	if (debugToggle.checked) {
		energyDisplay.innerText = model.balls.reduce((e, b) => e + b.mass * Math.pow(b.velocity.length, 2) / 2 + b.mass * Math.abs(getAcceleration().y) * (b.position.y - model.lowerBound.y), 0).toFixed(2)
		kineticDisplay.innerText = model.balls.reduce((e, b) => e + b.mass * Math.pow(b.velocity.length, 2) / 2, 0).toFixed(2)
		potentialDisplay.innerText = model.balls.reduce((e, b) => e + b.mass * Math.abs(getAcceleration().y) * (b.position.y - model.lowerBound.y), 0).toFixed(2);
	}
	view.render(model, debugToggle.checked);

	previousTimestamp = timestamp;

	animationHandle = window.requestAnimationFrame(updateFrame);
}

function onVisibilityChanged(): void {
	if (document.hidden) {
		if (isPlaying()) {
			pause();
			playingWhenLeaving = true;
		}
	}
	else {
		if (playingWhenLeaving) {
			resume();
			playingWhenLeaving = false;
		}
	}
}