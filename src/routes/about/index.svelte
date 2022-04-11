<script>
    import { eventAnimation, photoseries } from "$lib/store.js";
    // import { GUI } from "dat.gui";
    // import * as dat from "dat.gui";
    import {
        goto,
        invalidate,
        prefetch,
        prefetchRoutes,
    } from "$app/navigation";
    // import {
    //     Curtains,
    //     Plane,
    //     Vec3,
    //     Vec2,
    //     TextureLoader,
    //     ShaderPass,
    //     RenderTarget,
    // } from "curtainsjs";
    import {
        Curtains,
        Plane,
        Vec3,
        Vec2,
        TextureLoader,
        ShaderPass,
        RenderTarget,
    } from "curtainsjs/src/index.mjs";
    import { onMount } from "svelte";
    import fragment from "$lib/assets/photoseries.frag?raw";
    import vertex from "$lib/assets/photoseries.vert?raw";
    import { gsap } from "gsap";
    import { forEach } from "lodash-es";
    // import { anime } from "animejs";

    let slider,
        webgl,
        curtains,
        planes = [],
        activePlane,
        loader,
        //ANIMATIONS
        disp = 0,
        angleStep = (Math.PI * 2) / $photoseries.length,
        transVec = new Vec3(),
        step = Math.PI / 2 - angleStep,
        transitionState = {
            opacityPlane: 1,
            time: 0,
            radiusAnimation: 0,
            scalePlane: 0.015,
            yRoundDisable: 1,
            zRoundEnable: 1,
        },
        aspect = 0.668,
        height = 0.69,
        margin = 0,
        elWidth = 0,
        radius = 0,
        rad,
        radiusCoef = 0.0755,
        animationFrame = null,
        //getUniform parametr
        widthUn = 1,
        heightUn = 1,
        // aspect = 0.668,
        //SLIDER EVENTS
        isTrackpad = true,
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
    console.log(angleStep, "angleStep");
    function initCurtains() {
        curtains = new Curtains({
            container: webgl,
            pixelRatio: Math.min(1.5, window.devicePixelRatio),
            // production: process.env.NODE_ENV !== "development",
            // autoRender: false,
            //   antialias: false,
            // preserveDrawingBuffer: true,
            // depth: false,
            // autoResize: false,
            //   watchScroll: false,
        });
        curtains
            .onError(() => {
                document.body.classList.add("no-curtains");
                curtains = null;
            })
            .onContextLost(() => {
                curtains.restoreContext();
            });
        // curtains.canvas.height = window.innerHeight;
        // curtains.canvas.width = window.innerWidth;
        // distortionTarget = new RenderTarget(curtains);
        // rgbTarget = new RenderTarget(curtains);
        // loader = new TextureLoader(curtains);
    }
    // function loadTexture(){
    //     loader = new TextureLoader(curtains);
    //     loadImages(imageElements, texturesOptions, successCallback, errorCallback):
    // }
    function addPlane() {
        // console.log("createplane");
        const planeElement = document.getElementsByClassName("plane");
        const paramsPlane = {
            widthSegments: 16,
            heightSegments: 16,
            vertexShader: vertex,
            fragmentShader: fragment,
            // drawCheckMargins: {
            //     top: 10,
            //     right: 10,
            //     bottom: 10,
            //     left: 10,
            // },
            visible: false,
            // autoloadSources: true,
            // depthTest: false,
            fov: 1,
            renderOrder: 0,
            alwaysDraw: false,
            //   texturesOptions: {
            //     minFilter: curtains.gl.LINEAR_MIPMAP_NEAREST,
            //   },
            // shareProgram: true,
            watchScroll: false,
            uniforms: {
                uColor: { name: "uColor", type: "3f", value: [] },
                uScaleVector: {
                    name: "uScaleVector",
                    type: "2f",
                    value: [0, 0],
                },
                uMouse: { name: "uMouse", type: "2f", value: [] },
                uPlanePosition: {
                    name: "uPlanePosition",
                    type: "2f",
                    value: [0, 0],
                },
                uFragmentCorrection: {
                    name: "uFragmentCorrection",
                    type: "2f",
                    value: [],
                },
                uProgress: { name: "uProgress", type: "1f", value: 0 },
                uOpacity: { name: "uOpacity", type: "1f", value: 1 },
            },
        };

        [...planeElement].forEach((element, i) => {
            const plane = new Plane(curtains, element, paramsPlane);
            // curtains.render();
            // plane.userData = {
            //     route: $photoseries[plane.index].Route,
            //     color: $photoseries[plane.index].ColorVector,
            //     id: $photoseries[plane.index].Id,
            // };
            // getUniforms(plane, {
            //     pCorr: false,
            //     sCorr: false,
            //     fCorr: true,
            // });
            //   plane.setRenderTarget(distortionTarget);

            //   setTexture(plane);
            // const angle = angleStep * i;
            // console.log(angle);
            plane.onReady(() => {
                // debugger;
                // console.log("plane");
                // plane.setPerspective(50, 0.1, 10);
                // plane.setTransformOrigin(new Vec3(0.5, 0.5, 2));
                // plane.setScale(new Vec2(4.5, 4.5));
                getUniforms(plane);
                planes.push(plane);
                // curtains.needRender();

                // console.log(planes.length);
                // if (planes.length === [...planeElement].length) {
                //     translateSlider();
                // }
            });

            // .onLoading((texture) => {
            //     // our canvas texture is ready
            //     console.log("onloading here");
            //     texture.shouldUpdate = false;
            // });
        });
        // curtains.disableDrawing();
    }
    // function initGUI(plane) {
    //     // const gui2 = new dat.GUI();
    //     const gui = new GUI();
    //     // planes.forEach((plane) => {
    //     gui.add(plane.uniforms.uProgress, "value", 0, 1, 0.01)
    //         .name("progress")
    //         .onChange((value) => {
    //             plane.uniforms.uProgress.value = value;
    //             plane.setRotation(
    //                 new Vec3(0, plane.rotation.y * (1 - value), 0)
    //             );
    //             // plane.setScale(new Vec2(1 + value, 1 + value));
    //             curtains.render();
    //         })
    //         .onFinishChange(() => {
    //             // plane.textures[0].setScale(new Vec2(2, 2));
    //             console.log("ff");
    //         });
    //     // });

    //     // gui
    //     //   .add(plane.material.uniforms.amplitude, "value", 1, 30)
    //     //   .name("amplitude");

    //     // gui.add(plane.material.uniforms.speed, "value", 0, 2).name("speed");

    //     return gui;
    // }
    function getUniforms(
        plane,
        opt = { pCorr: true, sCorr: true, fCorr: true }
    ) {
        // GET BOUND
        const { width, height, left, top } = plane.getWebGLBoundingRect();
        const { width: curtainsWidth, height: curtainsHeight } =
            curtains.getBoundingRect();
        // const curtainsWidth =
        //     curtains.getBoundingRect().width / curtains.pixelRatio;
        // const curtainsHeight =
        //     curtains.getBoundingRect().height / curtains.pixelRatio;
        // const top = (curtainsHeight - height) / 2;
        const calcCords = {};
        // SET CORRECTION FRAGMENT SHADER NEED TO START AND RESIZE
        if (opt.fCorr) {
            const scaleWidth = window.innerWidth * widthUn;
            const scaleHeight = window.innerHeight * heightUn;
            if (scaleHeight / scaleWidth > aspect) {
                calcCords.xNorm = (scaleWidth / scaleHeight) * aspect;
                calcCords.yNorm = 1;
            } else {
                calcCords.xNorm = 1;
                calcCords.yNorm = scaleHeight / scaleWidth / aspect;
            }
            plane.uniforms.uFragmentCorrection.value = [
                calcCords.xNorm,
                calcCords.yNorm,
            ];
        }

        // SET SCALE VECTOR NEED TO START AND RESIZE
        if (opt.sCorr) {
            plane.uniforms.uScaleVector.value = [
                (curtainsWidth * widthUn) / width - 1, // * 0.5,
                (curtainsHeight * heightUn) / height - 1, //* 0.7
            ];
        }
        // PLANE SIZE
        calcCords.w = curtainsWidth / width;
        calcCords.h = curtainsHeight / height;
        // console.log(top, height);

        // PLANE POSITION VECTOR
        calcCords.x = (left / width - calcCords.w / 2 + 0.5) * 2;
        calcCords.y = (-(top / height - calcCords.h / 2) - 0.5) * 2;

        if (opt.pCorr) {
            plane.uniforms.uPlanePosition.value = [calcCords.x, calcCords.y];
        }
        // else {
        //     plane.uniforms.uPlanePosition.value = [0, 0];
        // }
    }
    // function startAnim() {
    //     console.log("here");
    //     // if ($page.params.Route) return;
    //     // homePageState.set(true);
    //     startAnimation = anime
    //         .timeline({
    //             // autoplay: false,
    //         })
    //         // .add({
    //         //     // update: () => {
    //         //     //     console.log("startAnim()");
    //         //     // },
    //         //     targets: transitionState,
    //         //     duration: 5000,
    //         //     easing: "easeOutSine",
    //         //     time: Math.PI * 4,
    //         // })
    //         .add(
    //             {
    //                 duration: 2000,
    //                 targets: [transitionState],
    //                 opacity: [1, 0],
    //                 radiusAnimation: radius,
    //                 scalePlane: 1,
    //                 yRoundDisable: 0,
    //                 zRoundEnable: 1,
    //                 easing: "easeInOutSine",
    //             },
    //             2000
    //         )
    //         // .add(
    //         //     {
    //         //         duration: 500,
    //         //         targets: [".preloader", ".logo"],
    //         //         opacity: 0,
    //         //         easing: "linear",
    //         //     },
    //         //     1800
    //         // )
    //         .add(
    //             {
    //                 duration: 300,
    //                 targets: [transitionState, ".main__head"],
    //                 opacityPlane: 0,
    //                 opacity: 1,
    //                 change: () => {
    //                     planes.forEach((plane, i) => {
    //                         if (plane.relativeTranslation.z < 0) {
    //                             plane.uniforms.uOpacity.value =
    //                                 transitionState.opacityPlane;
    //                         }
    //                     });
    //                 },
    //                 changeComplete: () => {
    //                     planes.forEach((plane, i) => {
    //                         // console.log(plane.relativeTranslation.z);
    //                         planeChangeView(plane);
    //                     });
    //                 },
    //                 easing: "linear",
    //             },
    //             4000
    //         );
    //     startAnimation &&
    //         startAnimation.finished.then(() => {
    //             homePageState.set(true);
    //             startAnimation = null;
    //         });
    // }
    let once = true;
    function translateSlider(t) {
        // curtains.render();

        // if ($eventAnimation) {
        sliderState.translation +=
            (sliderState.currentPosition - sliderState.translation) * 0.06;
        // }
        // console.log(sliderState.currentPosition, "sliderState.currentPosition");
        // console.log(sliderState.translation, "sliderState.translation");
        if (
            Math.abs(sliderState.currentPosition - sliderState.translation) >
            0.06
        ) {
            // curtains.render();
            // console.log("render");
        }
        // disp +=
        //     (sliderState.currentPosition - sliderState.translation - disp) *
        //     0.3;
        // shaderPass && (shaderPass.uniforms.displacement.value = disp / 2500);
        // [1, 2].forEach((e) => console.log(e));
        planes.forEach((plane, i) => {
            // console.log("inside foreach");
            // console.log("e");
            // - Math.PI / 2
            const angle =
                (angleStep * i + Math.PI - sliderState.translation / 1300) %
                (Math.PI * 2);

            transVec.set(
                //X
                Math.sin(angle) * rad,
                // Y
                0,
                // Z
                Math.cos(angle) * rad + rad
            );
            // if ($eventAnimation) {
            // plane.setScale(
            //     new Vec2(transitionState.scalePlane, transitionState.scalePlane)
            // );
            //     // if (titlePlaneOnLoad) {
            //     //     rgbPass.uniforms.scrollEffect.value = disp;
            //     //     planesTitle[i].setRelativeTranslation(transVec);
            //     // }
            // }
            // console.log(transVec);
            // if ($homePageState) {
            //     if (plane.relativeTranslation.z < 0) {
            //         plane.visible = planesTitle[i].visible = false;
            //     } else {
            //         plane.visible = planesTitle[i].visible = true;
            //     }
            // }
            // if (angleStep > Math.PI) {
            //     angleStep = -angleStep;
            // }
            !plane.visible && (plane.visible = true);
            plane.setRelativeTranslation(transVec);
            // plane.setRotation(new Vec3(0, -Math.sin(angle), 0));
            // plane.setScale(
            //     new Vec2(1, 1 + Math.abs(Math.sin(angle) / (Math.PI * 2)))
            // );
            if (Math.cos(angle) > 0) {
                plane.visible = false;
            } else {
                plane.visible = true;
            }
        });
        // START ANIMATION

        // toIndex && toIndex.tick(t);
        // toRoute && toRoute.tick(t);
        // startAnimation && startAnimation.tick(t);

        animationFrame = requestAnimationFrame(translateSlider);
        if (once) {
            // curtains.render();
            console.log("render");
            once = false;
        }
    }
    function onPlaneClick(mouse) {
        planes.forEach((el, i) => {
            if (!el.isDrawn()) {
                return;
            }
            const { left, width } = el.getWebGLBoundingRect();
            if (
                !(
                    mouse >= left / curtains.pixelRatio &&
                    mouse <= (left + width) / curtains.pixelRatio
                )
            ) {
                return;
            }
            // Clicked
            activePlane = el;
            // initGUI(activePlane);

            //   testId = el.index;
            //   activePlaneTitle = planesTitle[i];
            // eventAnimation.set(false);
            getUniforms(activePlane);
            activePlane.setRenderOrder(planes.length + 1);
            // activePlane.uniforms.uProgress.value = 0.089;
            console.log("click");
            // toRouteAnim();
            // goto(`/${el.userData.route}/`);
        });
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
        if (
            sliderState.clickUp[0] === sliderState.clickDown[0] &&
            // $eventAnimation &&
            sliderState.clickUp[1] === sliderState.clickDown[1]
        ) {
            onPlaneClick(sliderState.clickUp[0]);
        }
    }
    function onWheel(e) {
        // if ($eventAnimation) {
        curtains && e.preventDefault();
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
        // }
        // console.log(sliderState.currentPosition);
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

    console.log(Math.sin(Math.PI * 2), "Math.sin((Math.PI * 2)");
    onMount(() => {
        initCurtains();
        curtains.onSuccess(() => {
            addPlane();
            translateSlider();

            // gsap.ticker.add(() => {
            //     // curtains.render();
            //     // translateSlider();
            // });
        });
        // .onRender(() => {
        //     translateSlider();
        // });
        aspect = 0.668;
        height = 0.55;
        margin = 0.06;
        elWidth =
            (window.innerHeight * height) / aspect +
            window.innerWidth * margin * 2;
        console.log(elWidth, "elWidth");
        rad = elWidth / (2 * Math.sin(Math.PI / $photoseries.length));
        // rad =
        //     elWidth / (2 * Math.tan((Math.PI * 2) / (2 * $photoseries.length)));
        radius =
            elWidth / Math.sin((Math.PI * 2) / $photoseries.length / 2) / 2;
        // console.log(planes);
        // transitionState.radiusAnimation = radius;
        transitionState.radiusAnimation = rad;
        console.log(radius, "radius", rad);
        // translateSlider();

        // transitionState.radiusAnimation = Math.min(
        //     (window.innerWidth * radiusCoef) / 1.3882 / 2,
        //     100
        // );
        // transitionState.radiusAnimation =
        //     elWidth / Math.sin((Math.PI * 2) / $photoseries.length / 2) / 2;

        // startAnim();
        // gsap.ticker.add(curtains.render.bind(curtains));
    });
    const check = () => {
        planes.forEach((pl) =>
            console.log(pl.isDrawn(), pl.relativeTranslation.z, pl.index)
        );
    };
</script>

<div class="fullscreenTexture">
    <img src="/image/q2.jpg" alt="ff" />
</div>
<button on:click={check}>Check</button>
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
        <div class="plane plane__redy">
            <picture class="standart__picture">
                <!-- <source
                    media="(orientation: portrait)"
                    srcset="https://raw.githubusercontent.com/iasvobodin/svs/images/static/image/webp/{seriya
                        .largePortrait.src}.webp"
                    type="image/webp"
                /> -->
                <!-- <source
                    media="(orientation: portrait)"
                    srcset="https://raw.githubusercontent.com/iasvobodin/svs/images/static/image/jpg/{seriya
                        .largePortrait.src}.jpg"
                    type="image/jpg"
                /> -->
                <source
                    media="(orientation: landscape)"
                    srcset="https://raw.githubusercontent.com/iasvobodin/svs/images/static/image/webp/{seriya
                        .largeLandscape.src}.webp"
                    type="image/webp"
                />

                <img
                    on:click={() => goto(`/${seriya.Route}`)}
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
    .fullscreenTexture {
        pointer-events: none;
        position: absolute;
        width: 100%;
        height: 100vh;
    }
    .fullscreenTexture img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
    }
    :root {
        --plane__height: 55vh;
        --plane__width: calc(var(--plane__height) * 1.5);
    }
    .plane {
        align-self: center;
        position: absolute;
        box-sizing: border-box;
        height: var(--plane__height);
        width: var(--plane__width);
    }
    .event {
        pointer-events: none;
    }
    .wrapper {
        /* align-content: center; */
        /* justify-content: center; */
        height: 95vh;
        /* display: grid; */
        width: 100%;
        /* grid-auto-flow: column; */
    }
    .plane__redy {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
    }
    .plane__redy img {
        opacity: 0;
        /* cursor: pointer; */
        pointer-events: none;
    }
    #curtains {
        pointer-events: none;
        position: absolute;
        top: 0;
        opacity: 0.5;
        left: 0;
        overflow: hidden;
        width: 100%;
        height: 100vh;
        height: calc(var(--vh, 1vh) * 100);
    }
    #curtains canvas {
        display: block;
    }
</style>
