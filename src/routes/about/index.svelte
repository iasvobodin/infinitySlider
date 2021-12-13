<script>
    import { eventAnimation, photoseries } from "$lib/store.js";
    import {
        Curtains,
        Plane,
        Vec3,
        Vec2,
        TextureLoader,
        ShaderPass,
        RenderTarget,
    } from "curtainsjs/src/index.mjs";
    let slider,
        webgl,
        curtains,
        sliderState = {
            clickDown: "",
            clickUp: "",
            translation: 0,
            currentPosition: 0,
            planeCorrection: 0,
            isMouseDown: false,
            startPosition: 0,
            endPosition: 0,
            mousePosition: 0,
            moveSpeed: 3,
        };

    function initCurtains() {
        curtains = new Curtains({
            container: webgl,
            pixelRatio: Math.min(1.5, window.devicePixelRatio),
            production: process.env.NODE_ENV !== "development",
            //   autoRender: false,
            //   antialias: false,
            // preserveDrawingBuffer: true,
            // depth: false,
            // autoResize: false,
            //   watchScroll: false,
        });
        // curtains.canvas.height = window.innerHeight;
        // curtains.canvas.width = window.innerWidth;
        // distortionTarget = new RenderTarget(curtains);
        // rgbTarget = new RenderTarget(curtains);
        // loader = new TextureLoader(curtains);
    }

    function onMouseDown(e) {
        sliderState.isMouseDown = true;
        sliderState.clickDown = getMousePosition(e);
        sliderState.startPosition = sliderState.clickDown[0];
    }
    function onMouseMove(e) {
        if (!sliderState.isMouseDown) return;
        sliderState.mousePosition = getMousePosition(e);
        sliderState.currentPosition =
            sliderState.endPosition +
            (sliderState.mousePosition[0] - sliderState.startPosition) *
                sliderState.moveSpeed;
        // onChangeTitle(sliderState.currentPosition, e);
    }
    function onMouseUp(e) {
        sliderState.isMouseDown = false;
        sliderState.endPosition = sliderState.currentPosition;
        sliderState.clickUp = getMousePosition(e);
        // if (
        //     sliderState.clickUp[0] === sliderState.clickDown[0] &&
        //     $eventAnimation &&
        //     sliderState.clickUp[1] === sliderState.clickDown[1]
        // ) {
        //     onPlaneClick(sliderState.clickUp[0]);
        // }
    }
    function onWheel(e) {
        if ($eventAnimation) {
            e.preventDefault();
            if (isTrackpad) {
                if (e.wheelDeltaY) {
                    if (Math.abs(e.wheelDeltaY) !== 120) {
                        isTrackpad = false;
                    }
                } else if (e.deltaMode === 0) {
                    isTrackpad = false;
                }
            }
            const delta = window.navigator.userAgent.includes("Firefox")
                ? e.deltaY * 33
                : e.deltaY;
            !isTrackpad
                ? (sliderState.currentPosition += e.deltaY * -1)
                : (sliderState.currentPosition += delta * -1);
            sliderState.endPosition = sliderState.currentPosition;
            // onChangeTitle(sliderState.currentPosition, e);
        }
    }
    function getMousePosition(e) {
        let mousePosition;
        if (e.targetTouches) {
            if (e.targetTouches[0]) {
                mousePosition = [
                    e.targetTouches[0].clientX,
                    e.targetTouches[0].clientY,
                ];
            } else if (e.changedTouches[0]) {
                // handling touch end e
                mousePosition = [
                    e.changedTouches[0].clientX,
                    e.changedTouches[0].clientY,
                ];
            } else {
                // fallback
                mousePosition = [e.clientX, e.clientY];
            }
        } else {
            mousePosition = [e.clientX, e.clientY];
        }
        return mousePosition;
    }
</script>

<div
    bind:this={slider}
    class:event={!$eventAnimation}
    on:mousemove={onMouseMove}
    on:touchmove|passive={onMouseMove}
    on:mouseleave={onMouseUp}
    on:mouseup={onMouseUp}
    on:mousedown|preventDefault={onMouseDown}
    on:touchstart|preventDefault={onMouseDown}
    on:touchend={onMouseUp}
    on:wheel={onWheel}
    class="wrapper"
>
    {#each $photoseries as seriya, index (index)}
        <!-- <a style="display: none;" href="/{seriya.Route}">r</a> -->
        <!-- data-id={index}
        data-route={seriya.Route}
        data-color={[seriya.ColorVector]} -->
        <div class="plane">
            <picture class="standart__picture">
                <source
                    media="(orientation: portrait)"
                    srcset="https://raw.githubusercontent.com/iasvobodin/svs/images/static/image/webp/{seriya
                        .largePortrait.src}.webp"
                    type="image/webp"
                />
                <source
                    media="(orientation: portrait)"
                    srcset="https://raw.githubusercontent.com/iasvobodin/svs/images/static/image/jpg/{seriya
                        .largePortrait.src}.jpg"
                    type="image/jpg"
                />
                <source
                    media="(orientation: landscape)"
                    srcset="https://raw.githubusercontent.com/iasvobodin/svs/images/static/image/webp/{seriya
                        .largeLandscape.src}.webp"
                    type="image/webp"
                />

                <img
                    style="opacity:1"
                    data-sampler="planeTexture"
                    class="slider__img"
                    alt="SvobodinaPhoto"
                    crossorigin="anonimous"
                    decoding="async"
                    draggable="false"
                    src="https://raw.githubusercontent.com/iasvobodin/svs/images/static/image/jpg/{seriya
                        .largeLandscape.src}.jpg"
                />
            </picture>
        </div>
    {/each}
</div>
<div bind:this={webgl} id="curtains" />

<style>
    .wrapper {
        align-content: center;
        height: 100vh;
        display: grid;
        grid-auto-flow: column;
    }
    #curtains {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        overflow: hidden;
        width: 100%;
        height: 100vh;
        height: calc(var(--vh, 1vh) * 100);
    }
</style>
