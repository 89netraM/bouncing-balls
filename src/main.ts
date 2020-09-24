import "./styles.scss";
import { Ball, Model, Vector } from "./model";
import { View } from "./View";

const stateParameterName = "state";

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

const stepButtonStep = 0.05;
let stepButton: HTMLButtonElement;

let gravityToggle: HTMLInputElement;

let playButton: HTMLButtonElement;

let playingWhenLeaving: boolean = false;
let animationHandle: number = null;
let previousTimestamp: DOMHighResTimeStamp = null;

window.addEventListener(
	"load",
	() => {
		canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
		canvas.addEventListener("click", onClick, true);

		view = new View(canvas);

		debugToggle = document.getElementById("debug") as HTMLInputElement;
		debugToggle.addEventListener("change", () => { debugInfo.classList.toggle("visible", debugToggle.checked); render(); }, true);
		debugInfo = document.getElementById("debug-info") as HTMLParagraphElement;
		energyDisplay = document.getElementById("energy") as HTMLSpanElement;
		kineticDisplay = document.getElementById("kinetic") as HTMLSpanElement;
		potentialDisplay = document.getElementById("potential") as HTMLSpanElement;

		stepButton = document.getElementById("step") as HTMLButtonElement;
		stepButton.querySelector("code").innerText = `(${stepButtonStep}s)`;
		stepButton.addEventListener("click", () => step(stepButtonStep), true);

		gravityToggle = document.getElementById("gravity") as HTMLInputElement;
		gravityToggle.addEventListener("change", () => { model = model.withBalls(model.balls.map(b => b.withAcceleration(getAcceleration()))); render(); }, true);

		document.getElementById("save").addEventListener("click", save, true);

		playButton = document.getElementById("play") as HTMLButtonElement;
		playButton.addEventListener("click", togglePlaying, true);

		document.getElementById("reset").addEventListener("click", reset, true);

		document.addEventListener("visibilitychange", onVisibilityChanged, true);

		reset();

		animationHandle = window.requestAnimationFrame(updateFrame);
		playButton.classList.toggle("primary", false);
		stepButton.disabled = true;
	},
	true
);

function save(): void {
	const urlParams = new URLSearchParams(window.location.search.slice(1));
	const stateString = model.balls.map(b => `${b.radius},${b.density},${b.position.x},${b.position.y},${b.velocity.x},${b.velocity.y}`).join(";");
	urlParams.set(stateParameterName, stateString);
	const newURL = new Array<string>(`${window.location.origin}${window.location.pathname}`, urlParams.toString()).filter(s=>s.length>0).join("?");
	window.history.replaceState(
		null,
		null,
		newURL
	);
	navigator.clipboard.writeText(newURL);
}

function load(): Array<Ball> {
	const urlParams = new URLSearchParams(window.location.search.slice(1));
	const stateString = urlParams.get(stateParameterName);

	if (stateString != null && stateString.length > 0) {
		const numbers = stateString
			.split(";")
			.map(s => s.split(",").map(parseFloat));

		if (numbers.every(ns => ns.length === 6 && ns.every(n => !isNaN(n)))) {
			return numbers
				.map(ns => new Ball(
					ns[0],
					ns[1],
					new Vector(ns[2], ns[3]),
					new Vector(ns[4], ns[5])),
					getAcceleration()
				);
		}
		else {
			urlParams.delete(stateParameterName);
			window.history.replaceState(
				null,
				null,
				new Array<string>(`${window.location.origin}${window.location.pathname}`, urlParams.toString()).filter(s=>s.length>0).join("?")
			);
		}
	}

	return new Array<Ball>(
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
	);
}

function reset(): void {
	model = new Model(
		new Vector(-view.width / 2 / pixelsPerMeter, -view.height / 2 / pixelsPerMeter),
		new Vector(view.width / 2 / pixelsPerMeter, view.height / 2 / pixelsPerMeter),
		load()
	);

	render();
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
	stepButton.disabled = false;
}

function resume(): void {
	animationHandle = window.requestAnimationFrame(updateFrame);
	playButton.classList.toggle("primary", false);
	stepButton.disabled = true;
}

async function onClick(e: MouseEvent): Promise<void> {
	const wasPlaying = isPlaying();
	if (wasPlaying) {
		pause();
	}

	const modelPosition = view.transformers(model).screenToPoint(new Vector(e.x, e.y));

	const selectedBall = model.balls.find(b => b.position.distanceTo(modelPosition) < b.radius);
	if (selectedBall != null) {
		await removeBall(selectedBall);
	}
	else {
		await addBall(modelPosition);
	}
	
	if (wasPlaying) {
		resume();
	}
	else {
		render();
	}
}

function addBall(position: Vector): Promise<void> {
	return new Promise(resolve => {
		const done = () => {
			document.getElementById("add-dialog-add").removeEventListener("click", ok, true);
			document.getElementById("add-dialog-cancel").removeEventListener("click", done, true);
			document.getElementById("add-dialog").setAttribute("data-open", `${false}`);

			resolve();
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
	
		(document.getElementById("add-dialog-radius") as HTMLInputElement).valueAsNumber = 0.3;
		(document.getElementById("add-dialog-density") as HTMLInputElement).valueAsNumber = 1;
		(document.getElementById("add-dialog-position-x") as HTMLInputElement).valueAsNumber = position.x;
		(document.getElementById("add-dialog-position-y") as HTMLInputElement).valueAsNumber = position.y;
		(document.getElementById("add-dialog-velocity-x") as HTMLInputElement).valueAsNumber = 0;
		(document.getElementById("add-dialog-velocity-y") as HTMLInputElement).valueAsNumber = 0;

		document.getElementById("add-dialog-add").addEventListener("click", ok, true);
		document.getElementById("add-dialog-cancel").addEventListener("click", done, true);

		document.getElementById("add-dialog").setAttribute("data-open", `${true}`);
	});
}

function removeBall(ball: Ball): Promise<void> {
	return new Promise(resolve => {
		const done = () => {
			document.getElementById("remove-dialog-yes").removeEventListener("click", ok, true);
			document.getElementById("remove-dialog-no").removeEventListener("click", done, true);
			document.getElementById("remove-dialog").setAttribute("data-open", `${false}`);

			resolve();
		};

		const ok = () => {
			model = model.withBalls(model.balls.filter(b => b !== ball));
	
			done();
		};

		document.getElementById("remove-dialog-yes").addEventListener("click", ok, true);
		document.getElementById("remove-dialog-no").addEventListener("click", done, true);

		document.getElementById("remove-dialog").setAttribute("data-open", `${true}`);
	});
}

function updateFrame(timestamp: DOMHighResTimeStamp): void {
	let deltaTime = 0;
	if (previousTimestamp != null) {
		deltaTime = (timestamp - previousTimestamp) / 1000;
	}

	step(deltaTime);

	previousTimestamp = timestamp;

	animationHandle = window.requestAnimationFrame(updateFrame);
}

function step(deltaTime: number): void {
	model = model.step(deltaTime);
	render();
}

function render(): void {
	if (debugToggle.checked) {
		energyDisplay.innerText = model.balls.reduce((e, b) => e + b.mass * Math.pow(b.velocity.length, 2) / 2 + b.mass * Math.abs(getAcceleration().y) * (b.position.y - model.lowerBound.y), 0).toFixed(2)
		kineticDisplay.innerText = model.balls.reduce((e, b) => e + b.mass * Math.pow(b.velocity.length, 2) / 2, 0).toFixed(2)
		potentialDisplay.innerText = model.balls.reduce((e, b) => e + b.mass * Math.abs(getAcceleration().y) * (b.position.y - model.lowerBound.y), 0).toFixed(2);
	}
	view.render(model, debugToggle.checked);
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