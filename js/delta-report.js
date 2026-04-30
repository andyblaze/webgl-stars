export default class DeltaReport {
    static lastTime = performance.now();
    static startTime = performance.now();
    static frameCount = 0;
    static sum = 0;
    static min = Infinity;
    static max = 0;
    static timeSum = 0; // total ms of frame times (not normalised)
    static fps = 0;
    static fpsEl = null;

    static spew() {
        console.log(Math.random());
    }

    static reset() {
        this.frameCount = 0;
        this.sum = 0;
        this.timeSum = 0;
    }

    static calc(timestamp) {        
        const deltaTime = timestamp - this.lastTime; // ms since last frame
        const delta = deltaTime / 16.67; // normalised to 60fps

        this.sum += delta;
        this.timeSum += deltaTime;
        this.lastTime = timestamp;

        this.fps = parseInt(60 / (this.sum / this.frameCount));
        if ( this.fps < this.min ) this.min = this.fps; 
        if ( this.fps > this.max ) this.max = this.fps; 

        const avgFrameTime = this.timeSum / this.frameCount; // ms
        const totalSeconds = Math.floor((timestamp - this.startTime) / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
        const seconds = (totalSeconds % 60).toString().padStart(2, "0");
        const elapsed = minutes + ":" + seconds;
        return [ avgFrameTime, elapsed ];
    }

    static display(timestamp, htmlId) {
        if ( this.fpsEl === null ) this.fpsEl = htmlId;
        this.frameCount++;
        if (this.frameCount === 120) {
            DeltaReport.calc(timestamp);  
            this.fpsEl.innerText = this.fps;

            // Clear any previous fps-* class
            this.fpsEl.classList.remove("fps-best", "fps-ok", "fps-bad");

            // Add class based on fps
            if (this.fps >= 55) {
                this.fpsEl.classList.add("fps-best");
            } else if (this.fps >= 40) {
                this.fpsEl.classList.add("fps-ok");
            } else {
                this.fpsEl.classList.add("fps-bad");
            }
            DeltaReport.reset();
        }
    }

    static log(timestamp) { 
        this.frameCount++;
        if (this.frameCount === 120) { // ~2 seconds at 60fps
            const [avgFrameTime, elapsed] = DeltaReport.calc(timestamp);        

            console.log(
                "fps", this.fps,
                "min=", this.min,
                "max=", this.max,
                "avgFrame=", avgFrameTime.toFixed(2) + "ms",
                "elapsed=", elapsed
            );
            DeltaReport.reset();
        }
    }
}
