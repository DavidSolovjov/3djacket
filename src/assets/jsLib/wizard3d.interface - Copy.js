class Wizard3DJacket {
    canvasElement;
    camera = null;
    collarClassic = true;
    collarFeathering = false;
    collarOneStripe = false;
    collarTwoStripes = false;
    composer = null;
    controls = null;
    frameRate = 10;
    intersectReady = 0;
    knitTrimRainbow = false;
    loaded = false;
    materials = {};
    model = null;
    modelElements = {
        frontBodyButton: null,
        sleeves: null,
        knitTrim: null,
        classicCollar: null,
        insideBodyButton: null,
        pockets: null,
        snapsMesh: null,
        snapBack: null,
        logo: null,
        RetroCollar: null,
        HoodieCollar: null,
        ZipperBody: null,
        ZipperCanvas: null,
        ZipperMesh: null,
        InsideZipperBody: null,
        ShoulderInserts: null,
        KnitTrim_2strips_collar: null,
        KnitTrim_2strips_body: null,
        knitTrim_rainbow: null,
        classicCollar_rainbow: null
    };
    modelLoader;
    mouse = null;
    movestate = 0;
    mylatesttap = 0;
    objectGroup = null;
    objectarr = [];
    originalopacity = [];
    outlinePass = null;
    raycaster = null;
    renderer = null;
    renderPass = null;
    scene = null;
    stats = null;
    textureCube;
    textureLoader;
    textures = {};

    constructor(canvasElementSelector, loaderBlockId, resourcePath = null, autoLoad = false) {
        this.canvasElementSelector = canvasElementSelector;
        this.loaderBlockId = loaderBlockId;
        this.resourcePath = resourcePath ? resourcePath : '';

        if (autoLoad === true) {
            document.getElementById(this.loaderBlockId).classList.remove('hidden');
            this.init();
        } else {
            document.getElementById(this.loaderBlockId).classList.add('hidden');
        }
    }

    async init(callback = null) {
        this.initScene();
        this.initRenderer();
        this.initCamera();
        this.initControls();
        this.initTextureLoader();
        this.initTextures();
        this.initMaterials();
        this.initGroup();
        this.initModelLoader();
        this.initShadowModel();
        this.initLights();
        this.initPersonalizationModels();

        this.mouse = new THREE.Vector2();
        this.composer = new THREE.EffectComposer(this.renderer);
        this.renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);
        this.outlinePass = new THREE.OutlinePass(new THREE.Vector2(this.getCanvas().innerWidth, this.getCanvas().innerHeight), this.scene, this.camera);
        this.outlinePass.depthMaterial.morphTargets = true;
        this.outlinePass.prepareMaskMaterial.morphTargets = true;
        this.outlinePass.visibleEdgeColor = new THREE.Color(1, 1, 0);
        this.outlinePass.hiddenEdgeColor = new THREE.Color(1, 1, 0);
        this.outlinePass.pulsePeriod = 0;
        this.outlinePass.edgeGlow = 1;
        this.outlinePass.edgeThickness = 1;
        this.outlinePass.edgeStrength = 3;
        this.composer.addPass(this.outlinePass);
        window.addEventListener('mousemove', this.onTouchMove.bind(this));
        window.addEventListener('mousedown', function () {
            this.movestate = 0;
        }.bind(this));
        window.addEventListener('mouseup', this.selectObject.bind(this));
        document.body.addEventListener('touchstart', function (e) {
            e.preventDefault();
            if (!e.clientX) {
                let object = [];
                object.clientX = e.changedTouches[0].pageX;
                object.clientY = e.changedTouches[0].pageY;
                let now = new Date().getTime();
                let timesince = now - this.mylatesttap;
                if ((timesince < 600) && (timesince > 0)) {
                    this.selectObject(object);
                } else {
                    this.onTouchMove(object);
                }
                this.mylatesttap = new Date().getTime();
            }
        }.bind(this), false);

        this.render();
        await this.initBaseModel();

        if (callback) {
            callback();
        }

        return this.loaded;
    }

    getCanvas() {
        return document.querySelector(this.canvasElementSelector);
    }

    getScreenShotCanvas() {
        return document.querySelector('#canvasScreenShot');
    }

    initScene() {
        this.scene = new THREE.Scene();
    }

    initRenderer() {
        let canvas = this.getCanvas();
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        this.renderer.shadowMap.enabled = false;
        this.renderer.setClearColor(0x000000, 0);

        this.renderer.setPixelRatio(1);
        document.body.appendChild(this.renderer.domElement);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            25, // vertical field of view
            window.innerWidth / window.innerHeight, // aspect ratio
            0.2, // near plane
            1000 // far plane
        );
        this.raycaster = new THREE.Raycaster();
        this.camera.position.set(20, 12, 13) // x y z
        // this.camera.rotation.z = 9.2;
    }

    initGroup() {
        this.objectGroup = new THREE.Group();
    }

    initControls() {
        let canvas = this.getCanvas();
        this.controls = new THREE.OrbitControls(this.camera, canvas);
        if (window.innerWidth < 961) {
            this.controls.minDistance = 65;
            this.controls.maxDistance = 65;
        } else {
            this.controls.minDistance = 34.5;
            this.controls.maxDistance = 34.5;
        }
        this.controls.maxPolarAngle = (Math.PI / 2);
        this.controls.enableKeys = false;
        this.controls.enablePan = false;
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.saveState();
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.2;
    }

    initTextureLoader() {
        this.textureLoader = new THREE.TextureLoader();
    }

    initTextures() {
        this.textureCube = new THREE.CubeTextureLoader()
            .load([
                this.resourcePath + 'img/px.png',
                this.resourcePath + 'img/nx.png',
                this.resourcePath + 'img/py.png',
                this.resourcePath + 'img/ny.png',
                this.resourcePath + 'img/pz.png',
                this.resourcePath + 'img/nz.png',
            ]);

        this.loadTexture('leatherRO', 'img/Leather_GLOSS.jpg');
        this.loadTexture('leatherME', 'img/Leather_NRM.jpg');
        this.loadTexture('leatherDISP', 'img/Leather_DISP.jpg');
        this.loadTexture('woolDISP', 'img/Wool_DISP.jpg');
        this.loadTexture('woolMe', 'img/Wool_NRM.jpg');
        this.loadTexture('eraserNRM', 'img/eraser_NRM.jpg');
        this.loadTexture('eraserNRMrainbow', 'img/eraser_normal.jpg');
        this.loadTexture('rainbow_texture', 'img/eraser_rainbow.jpg');
        this.loadTexture('eraserAO', 'img/AO_eraser.jpg');
        this.loadTexture('eraserAO', 'img/AO_eraser.jpg');
        this.loadTexture('insideNRM', 'img/inside_NRM.jpg', false, false, false);
        this.loadTexture('logoTexture', 'img/logo.png', false, false, false);
        this.loadTexture('shadowTexture', 'img/shadow.png', false, false, false);
        this.loadTexture('AOmap', 'img/AO.jpg', false, false, false);
        this.loadTexture('personalizationDefault', 'img/patchTextureDefault.png', false, false, false);
    }

    loadTexture(name, texturePath, flipY = false, wrapS = THREE.RepeatWrapping, wrapT = THREE.RepeatWrapping) {
        this.textures[name] = this.textureLoader.load(this.resourcePath + texturePath);
        this.textures[name].flipY = flipY;
        if (wrapS) {
            this.textures[name].wrapS = wrapS;
        }
        if (wrapT) {
            this.textures[name].wrapT = wrapT;
        }
    }

    initMaterials() {
        let materialSet = {
            'leather': {
                envMap: this.textureCube,
                envMapIntensity: 0.1,
                normalMap: this.textures['leatherME'],
                normalScale: new THREE.Vector2(5, 5),
                metalnessMap: this.textures['leatherRO'],
                roughnessMap: this.textures['leatherDISP'],
                metalness: 0.01,
                roughness: 0.6,
                lightMap: this.textures['AOmap'],
                lightMapIntensity: 0.75,
            },
            'vinyl': {
                envMap: this.textureCube,
                envMapIntensity: 0.1,
                normalMap: this.textures['leatherME'],
                normalScale: new THREE.Vector2(2, 2),
                metalnessMap: this.textures['leatherRO'],
                roughnessMap: this.textures['leatherDISP'],
                metalness: 0.25,
                roughness: 0.75,
                lightMap: this.textures['AOmap'],
                lightMapIntensity: 1,
            },
            'wool': {
                normalMap: this.textures['woolMe'],
                metalnessMap: this.textures['woolDISP'],
                lightMap: this.textures['AOmap'],
                roughness: 5
            }
        };
        this.loadMaterial('woolMatBody', materialSet['wool']);
        this.loadMaterial('woolMatSleeves', _.assignIn(materialSet['wool'], {roughness: 1}));
        this.loadMaterial('woolMatPockets', _.assignIn(materialSet['wool'], {roughness: 1}));
        this.loadMaterial('woolMatShoulderInserts', _.assignIn(materialSet['wool'], {roughness: 1}));
        this.loadMaterial('leatherMatBody', materialSet['leather']);
        this.loadMaterial('leatherMatSleeves', materialSet['leather']);
        this.loadMaterial('leatherMatPockets', materialSet['leather']);
        this.loadMaterial('leatherMatShoulderInserts', materialSet['leather']);
        this.loadMaterial('vinylMatBody', materialSet['vinyl']);
        this.loadMaterial('vinylMatSleeves', materialSet['vinyl']);
        this.loadMaterial('vinylMatPockets', materialSet['vinyl']);
        this.loadMaterial('vinylMatShoulderInserts', materialSet['vinyl']);

        this.loadMaterial('knitTrimMat_main', {
            envMap: this.textureCube,
            normalMap: this.textures['eraserNRM'],
            lightMap: this.textures['eraserAO'],
            metalness: 0.1,
            roughness: 0.8,
            lightMapIntensity: 0.8,
            side: null
        });
        this.loadMaterial('knitTrimMat_rainbow', {
            envMap: this.textureCube,
            map: this.textures['rainbow_texture'],
            normalMap: this.textures['eraserNRMrainbow'],
            lightMap: this.textures['eraserAO'],
            metalness: 0.1,
            roughness: 0.8,
            lightMapIntensity: 0.8,
            side: null
        });
        this.loadMaterial('knitTrimMat_Stripes', {
            envMap: this.textureCube,
            normalMap: this.textures['eraserNRM'],
            lightMap: this.textures['eraserAO'],
            color: 0xdddddd,
            metalness: 0.1,
            roughness: 0.8,
            lightMapIntensity: 0.8,
            side: null
        });
        this.loadMaterial('knitTrimMat_StripesFeathering', {
            envMap: this.textureCube,
            normalMap: this.textures['eraserNRM'],
            lightMap: this.textures['eraserAO'],
            color: 0xcccccc,
            metalness: 0.1,
            roughness: 0.8,
            lightMapIntensity: 0.8,
            side: null
        });

        // Additional materials
        this.materials['shineMetal'] = new THREE.MeshPhysicalMaterial({
            envMap: this.textureCube,
            envMapIntensity: 0.01,
            color: 0xffffff,
            metalness: 0.5,
            roughness: 0.8,
            lightMap: this.textures['AOmap'],
            lightMapIntensity: 1.5
        });
        this.materials['clearMetal'] = new THREE.MeshPhysicalMaterial({
            clearcoat: 1.0,
            clearcoatRoughness: 1,
            metalness: 1,
            roughness: 0.1,
            color: 0xffffff,
            envMap: this.textureCube,
        });
        this.materials['insideMat'] = new THREE.MeshPhysicalMaterial({
            envMap: this.textureCube,
            normalMap: this.textures['insideNRM'],
            normalScale: new THREE.Vector2(2, 2),
            color: 0x7d7d7d,
            metalness: 0.9,
            roughness: 0.6,
        });
        this.materials['logoMat'] = new THREE.MeshBasicMaterial({
            envMap: this.textureCube,
            map: this.textures['logoTexture'],
            reflectivity: 0.1
        });
        this.materials['shadowMat'] = new THREE.MeshBasicMaterial({
            map: this.textures['shadowTexture'],
            reflectivity: 0.1,
            transparent: true
        });

        // Personalization materials
        let personalizationMaterialDefault = {
            map: this.textures['personalizationDefault'],
            transparent: true,
            opacity: 0,
        };
        this.materials['personalizationBack'] = new THREE.MeshBasicMaterial(personalizationMaterialDefault);
        this.materials['personalizationLeftChest'] = new THREE.MeshBasicMaterial(personalizationMaterialDefault);
        this.materials['personalizationLeftSleeve'] = new THREE.MeshBasicMaterial(personalizationMaterialDefault);
        this.materials['personalizationRightChest'] = new THREE.MeshBasicMaterial(personalizationMaterialDefault);
        this.materials['personalizationRightSleeve'] = new THREE.MeshBasicMaterial(personalizationMaterialDefault);
    }

    loadMaterial(name, params) {
        let materialData = _.assignIn({
            normalScale: new THREE.Vector2(16, 16),
            color: 0xffffff,
            metalness: 1,
            roughness: 1,
            side: THREE.FrontSide,
            lightMapIntensity: 1.5
        }, params);

        this.materials[name] = new THREE.MeshPhysicalMaterial(materialData);
    }

    initModelLoader() {
        this.modelLoader = new THREE.GLTFLoader();
    }

    loadModel(modelPath, callback) {
        this.modelLoader.load(this.resourcePath + modelPath, (model) => {
            callback(model);
        })
    }

    initBaseModel() {
        let elements = [
            {
                name: 'frontBodyButton',
                childPosition: 2,
                material: 'woolMatBody'
            },
            {
                name: 'sleeves',
                childPosition: 7,
                material: 'leatherMatSleeves'
            },
            {
                name: 'knitTrim',
                childPosition: 4,
                material: 'knitTrimMat_main'
            },
            {
                name: 'classicCollar',
                childPosition: 1,
                material: 'knitTrimMat_main'
            },
            {
                name: 'insideBodyButton',
                childPosition: 3,
                material: 'insideMat'
            },
            {
                name: 'pockets',
                childPosition: 6,
                material: 'leatherMatPockets'
            },
            {
                name: 'snapsMesh',
                childPosition: 0,
                material: 'shineMetal'
            },
            {
                name: 'snapBack',
                childPosition: 8,
                material: 'clearMetal'
            },
            {
                name: 'logo',
                childPosition: 5,
                material: 'logoMat'
            }
        ];
        let that = this;
        return new Promise((resolve, reject) => {
            that.modelLoader.load(this.resourcePath + 'gltf/VarsityBase.glb', (model) => {
                let sceneElements = [];
                _.each(elements, function (element) {
                    that.modelElements[element.name] = model.scene.children[element.childPosition];
                    if (typeof that.modelElements[element.name] !== 'undefined') {
                        that.modelElements[element.name].material = that.materials[element.material];
                        sceneElements.push(element.name);
                        that.objectarr.push(element);
                        that.originalopacity.push(element.material.opacity);
                    }
                });
                that.addSceneElements.apply(that, sceneElements);
                that.removeLoader();
                that.rotateAnimation();
                resolve();
            }, null, reject);
        });
    }

    initShadowModel() {
        let that = this;
        this.loadModel('gltf/Shadow_plane.glb', function (model) {
            let sceneElements = ['shadowPlane'];
            that.modelElements['shadowPlane'] = model.scene.children[0];
            that.modelElements['shadowPlane'].material = that.materials['shadowMat'];
            that.addSceneElements.apply(that, sceneElements);
        });
    }

    initLights() {
        // Hemisphere light
        let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
        hemiLight.position.set(0, 90, 0);
        this.scene.add(hemiLight);

        // Directional Light
        let d = 1.25;
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
        dirLight.position.set(0.5, -2, 10);
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 1500;
        dirLight.shadow.camera.left = d * -1;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = d * -1;
        this.scene.add(dirLight);
        let d2 = 10.25;
        let dirLight2 = new THREE.DirectionalLight(0xffffff, 0.18);
        dirLight2.position.set(0, 0, -20);
        dirLight2.shadow.camera.near = 0.1;
        dirLight2.shadow.camera.far = 1500;
        dirLight2.shadow.camera.left = d2 * -1;
        dirLight2.shadow.camera.right = d2;
        dirLight2.shadow.camera.top = d2;
        dirLight2.shadow.camera.bottom = d2 * -1;
        this.scene.add(dirLight2);
    }

    removeLoader() {
        this.loaded = true;
        document.getElementById(this.loaderBlockId).remove();
    }

    initPersonalizationModels() {
        let that = this;
        this.loadModel('gltf/Personalization_Back.glb', function (personalizationModel) {
            let personalizationBack = personalizationModel.scene.children[0];
            personalizationBack.material = that.materials['personalizationBack'];
            that.scene.add(personalizationBack);
        });
        this.loadModel('gltf/Personalization_LeftChest.glb', function (personalizationModel) {
            let personalizationLeftChest = personalizationModel.scene.children[0];
            personalizationLeftChest.material = that.materials['personalizationLeftChest'];
            that.scene.add(personalizationLeftChest);
        });
        this.loadModel('gltf/Personalization_LeftSleeve.glb', function (personalizationModel) {
            let personalizationLeftSleeve = personalizationModel.scene.children[0];
            personalizationLeftSleeve.material = that.materials['personalizationLeftSleeve'];
            that.scene.add(personalizationLeftSleeve);
        });
        this.loadModel('gltf/Personalization_RightChest.glb', function (personalizationModel) {
            let personalizationRightChest = personalizationModel.scene.children[0];
            personalizationRightChest.material = that.materials['personalizationRightChest'];
            that.scene.add(personalizationRightChest);
        });
        this.loadModel('gltf/Personalization_RightSleeve.glb', function (personalizationModel) {
            let personalizationRightSleeve = personalizationModel.scene.children[0];
            personalizationRightSleeve.material = that.materials['personalizationRightSleeve'];
            that.scene.add(personalizationRightSleeve);
        });
    }

    setPersonalization(position, previewImage = null) {
        let texture = this.textures['personalizationDefault'];
        let opacity = 0;
        if (previewImage) {
            texture = this.textureLoader.load(previewImage);
            texture.flipY = false;
            opacity = 1;
        }
        let personalizationMaterialIndex = 'personalization' + position;
        this.materials[personalizationMaterialIndex].map = texture;
        this.materials[personalizationMaterialIndex].opacity = opacity;
    }

    render() {
        if (this.resizeRendererToDisplaySize(this.renderer, this.composer)) {
            let canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }

        this.controls.update();
        this.composer.setSize(this.getCanvas().clientWidth * 1.2, this.getCanvas().clientHeight * 1.2);
        this.composer.render(this.scene, this.camera);
        // this.renderer.render(this.scene, this.camera);
        setTimeout(function () {
            requestAnimationFrame(this.render.bind(this));
        }.bind(this), 1000 / this.frameRate);
        TWEEN.update();

        // requestAnimationFrame(this.render.bind(this));
        this.scene.add(this.objectGroup);
    }

    rotateAnimation() {
        let that = this;
        setTimeout(function () {
            let position = new THREE.Vector3().copy(that.camera.position);
            let targetPosition = new THREE.Vector3(2.75, 10, 40);
            new TWEEN.Tween(position)
                .to(targetPosition, 2200)
                .easing(TWEEN.Easing.Quartic.Out)
                .onUpdate(function () {
                    that.camera.position.copy(this);
                    that.controls.update();
                })
                .start();
            that.controls.minDistance = 34.5;
            that.controls.maxDistance = 34.5;
            if (window.innerWidth < 961) {
                that.controls.minDistance = 65;
            }
        }, 500);
        setTimeout(function () {
            that.controls.minDistance = 34.5;
            that.controls.maxDistance = 90.4;
            let width = window.innerWidth;
            if (width < 961) {
                that.controls.minDistance = 65;
            }
            that.intersectReady = 1;
        }, 3500);
    }

    resizeRendererToDisplaySize(renderer, composer) {
        let canvas = renderer.domElement,
            width = document.getElementById('canvasModelWrapper').offsetWidth,
            height = document.getElementById('canvasModelWrapper').offsetHeight,
            canvasPixelWidth = canvas.width / window.devicePixelRatio,
            canvasPixelHeight = canvas.height / window.devicePixelRatio;

        let needResize =
            canvasPixelWidth !== width || canvasPixelHeight !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
            composer.setSize(width, height, false);
        }

        return needResize;
    }

    takeScreenShots() {
        let screenShots = {};
        let camera = new THREE.PerspectiveCamera(
            25, // vertical field of view
            1, // aspect ratio
            0.2, // near plane
            1000 // far plane
        );
        camera.position.set(0.2, -0.1, 150) // x y z

        let canvas = this.getScreenShotCanvas();
        let renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        renderer.shadowMap.enabled = false;
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);
        renderer.setSize(600, 600);

        let controls = new THREE.OrbitControls(camera, canvas);
        controls.enabled = true;
        controls.enableZoom = false;
        controls.target.set(-0, -0.1, 0);
        controls.minDistance = 55.1;
        controls.maxDistance = 90.4; //5
        controls.maxPolarAngle = (Math.PI / 2);
        controls.enableKeys = false;
        controls.enablePan = false;
        controls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
        controls.screenSpacePanning = false;
        controls.saveState();

        camera.position.set(0, 0, 1) // front
        controls.update();
        renderer.render(this.scene, camera);
        screenShots['front'] = renderer.domElement.toDataURL('image/png');

        camera.position.set(0, 0, -1) // back
        controls.update();
        renderer.render(this.scene, camera);
        screenShots['back'] = renderer.domElement.toDataURL('image/png');

        camera.position.set(10, 0, 1) // left-side
        controls.update();
        renderer.render(this.scene, camera);
        screenShots['left'] = renderer.domElement.toDataURL('image/png');

        camera.position.set(-10, 0, 1) // right-side
        controls.update();
        renderer.render(this.scene, camera);
        screenShots['right'] = renderer.domElement.toDataURL('image/png');

        return screenShots;
    }

    addSceneElements(...elements) {
        let that = this;
        _.forEach(elements, function (name) {
            if (that.modelElements[name]) {
                that.scene.add(that.modelElements[name]);
                that.objectGroup.add(that.modelElements[name]);
            }
        })
    }

    removeSceneElements(...elements) {
        let that = this;
        _.forEach(elements, function (name) {
            that.scene.remove(that.modelElements[name]);
            that.objectGroup.remove(that.modelElements[name]);
        })
    }

    setBodySnaps() {
        this.removeSceneElements(
            'ZipperBody',
            'ZipperCanvas',
            'ZipperMesh',
            'InsideZipperBody'
        );
        this.addSceneElements(
            'frontBodyButton',
            'insideBodyButton',
            'snapsMesh',
            'snapBack'
        );
    }

    setSnapsColor(colorData) {
        this.materials['shineMetal']['color'] = this.parseColor(colorData ? colorData.hex : null);
    }

    setBodyZipper(material) {
        let that = this;
        let materialName = 'woolMatBody';
        switch (material) {
            case 'leather':
                materialName = 'leatherMatBody';
                break;
            case 'vinyl':
                materialName = 'vinylMatBody';
                break;
        }

        this.loadModel('gltf/ZipperBody.glb', function (model) {
            let elements = [
                {
                    name: 'ZipperBody',
                    position: 0,
                    material: materialName
                },
                {
                    name: 'ZipperMesh',
                    position: 1,
                    material: 'clearMetal'
                },
                {
                    name: 'ZipperCanvas',
                    position: 2,
                    material: materialName
                }
            ];
            _.each(elements, function (item) {
                that.modelElements[item.name] = model.scene.children[item.position];
                that.modelElements[item.name].material = that.materials[item.material];
            });

            that.removeSceneElements(
                'frontBodyButton',
                'insideBodyButton',
                'snapsMesh',
                'snapBack'
            );

            that.addSceneElements(
                'ZipperBody',
                'ZipperCanvas',
                'ZipperMesh'
            );
        });

        this.loadModel('gltf/InsideZipperBody.glb', (model) => {
            that.modelElements['InsideZipperBody'] = model.scene.children[0];
            that.modelElements['InsideZipperBody'].material = that.materials['insideMat'];

            that.addSceneElements('InsideZipperBody');
        });
    }

    setJacketStyle(style) {
        switch (style) {
            case 'hoodie':
                this.setCollarHoodie();
                break;
            case 'retro':
                this.setCollarRetro();
                break;
            default:
                this.setCollarClassic();
        }
    }

    setCollarRetro() {
        let that = this;
        this.loadModel('gltf/RetroCollar.glb', (model) => {
            that.modelElements['RetroCollar'] = model.scene.children[0];
            that.modelElements['RetroCollar'].material = that.materials['woolMatBody'];

            that.removeSceneElements(
                'classicCollar',
                'HoodieCollar',
                'classicCollar_rainbow',
                'KnitTrim_2strips_collar',
                'KnitTrim_2stripsFeathering_collar',
                'KnitTrim_1strips_collar'
            );

            that.addSceneElements('RetroCollar');

            that.collarClassic = false;
        });
    }

    setCollarHoodie() {
        let that = this;
        this.loadModel('gltf/HoodieCollar.glb', (model) => {
            that.modelElements['HoodieCollar'] = model.scene.children[0];
            that.modelElements['HoodieCollar'].material = that.materials['woolMatBody'];

            that.removeSceneElements(
                'classicCollar',
                'RetroCollar',
                'classicCollar_rainbow',
                'KnitTrim_2strips_collar',
                'KnitTrim_2stripsFeathering_collar',
                'KnitTrim_1strips_collar'
            );

            that.addSceneElements('HoodieCollar');

            that.collarClassic = false;
        });
    }

    setCollarClassic() {
        this.removeSceneElements('RetroCollar', 'HoodieCollar');
        this.addSceneElements('classicCollar');
        this.collarClassic = true;
        if (this.knitTrimRainbow) {
            this.addSceneElements('classicCollar_rainbow');
        }
        if (this.collarOneStripe) {
            this.addSceneElements('KnitTrim_1strips_collar');
        }
        if (this.collarTwoStripes) {
            this.addSceneElements('KnitTrim_2strips_collar');
        }
    }

    addShoulderInserts() {
        let that = this;
        this.loadModel('gltf/ShoulderInserts.glb', (model) => {
            that.modelElements['ShoulderInserts'] = model.scene.children[0];
            that.modelElements['ShoulderInserts'].material = that.materials['leatherMatShoulderInserts'];
            that.addSceneElements('ShoulderInserts');
        });
    }

    removeShoulderInserts() {
        this.removeSceneElements('ShoulderInserts');
    }

    setBodyMaterial(material) {
        let newMaterial = null;
        switch (material) {
            case 'leather':
                newMaterial = this.materials['leatherMatBody'];
                break;
            case 'vinyl':
                newMaterial = this.materials['vinylMatBody'];
                break;
            case 'wool':
                newMaterial = this.materials['woolMatBody'];
                break;
        }
        this.modelElements['frontBodyButton'].material = newMaterial;
        try {
            this.modelElements['ZipperBody'].material = newMaterial;
            this.modelElements['ZipperCanvas'].material = newMaterial;
        } catch (err) {
            // console.log(err);
        }
        try {
            this.modelElements['RetroCollar'].material = newMaterial;
        } catch (err) {
            // console.log(err);
        }
        try {
            this.modelElements['HoodieCollar'].material = newMaterial;
        } catch (err) {
            // console.log(err);
        }
    }

    parseColor(colorHex = null) {
        colorHex = colorHex ? parseInt("0x" + colorHex) : 0xffffff;

        return new THREE.Color(colorHex);
    }

    setBodyColor(colorData, material) {
        let color = this.parseColor(colorData ? colorData.hex : null);
        switch (material) {
            case 'leather':
                this.materials['leatherMatBody'].color = color;
                this.materials['leatherMatBody'].metalness = 0.07;
                this.materials['leatherMatBody'].roughness = 0.75;
                this.materials['leatherMatBody'].lightMapIntensity = 1;
                break;
            case 'vinyl':
                this.materials['vinylMatBody'].color = color;
                this.materials['vinylMatBody'].lightMapIntensity = 1.05;
                break;
            case 'wool':
                this.materials['woolMatBody'].color = color;
                this.materials['woolMatBody'].metalness = 1.05;
                this.materials['woolMatBody'].lightMapIntensity = 1.8;
                break;
        }
    }

    setShouldersColor(colorData, material) {
        let color = this.parseColor(colorData ? colorData.hex : null);
        switch (material) {
            case 'leather':
                this.materials['leatherMatShoulderInserts'].color = color;
                this.materials['leatherMatShoulderInserts'].metalness = 0.07;
                this.materials['leatherMatShoulderInserts'].roughness = 0.75;
                this.materials['leatherMatShoulderInserts'].lightMapIntensity = 1;
                break;
            case 'vinyl':
                this.materials['vinylMatShoulderInserts'].color = color;
                this.materials['vinylMatShoulderInserts'].lightMapIntensity = 1.05;
                break;
            case 'wool':
                this.materials['woolMatShoulderInserts'].color = color;
                this.materials['woolMatShoulderInserts'].metalness = 1.05;
                this.materials['woolMatShoulderInserts'].lightMapIntensity = 1.8;
                break;
        }
    }

    setShouldersMaterial(material) {
        let newMaterial = null;
        switch (material) {
            case 'leather':
                newMaterial = this.materials['leatherMatShoulderInserts'];
                break;
            case 'vinyl':
                newMaterial = this.materials['vinylMatShoulderInserts'];
                break;
            case 'wool':
                newMaterial = this.materials['woolMatShoulderInserts'];
                break;
        }
        this.modelElements['ShoulderInserts'].material = newMaterial;
    }

    setSleevesColor(colorData, material) {
        let color = this.parseColor(colorData ? colorData.hex : null);
        switch (material) {
            case 'leather':
                this.materials['leatherMatSleeves'].color = color;
                this.materials['leatherMatSleeves'].metalness = 0.07;
                this.materials['leatherMatSleeves'].roughness = 0.75;
                this.materials['leatherMatSleeves'].lightMapIntensity = 1;
                break;
            case 'vinyl':
                this.materials['vinylMatSleeves'].color = color;
                this.materials['vinylMatSleeves'].lightMapIntensity = 1.05;
                break;
            case 'wool':
                this.materials['woolMatSleeves'].color = color;
                this.materials['woolMatSleeves'].metalness = 1.05;
                this.materials['woolMatSleeves'].lightMapIntensity = 1.8;
                break;
        }
    }

    setSleevesMaterial(material) {
        let newMaterial = null;
        switch (material) {
            case 'leather':
                newMaterial = this.materials['leatherMatSleeves'];
                break;
            case 'vinyl':
                newMaterial = this.materials['vinylMatSleeves'];
                break;
            case 'wool':
                newMaterial = this.materials['woolMatSleeves'];
                break;
        }
        this.modelElements['sleeves'].material = newMaterial;
    }

    setPocketsColor(colorData, material) {
        let color = this.parseColor(colorData ? colorData.hex : null);
        switch (material) {
            case 'leather':
                this.materials['leatherMatPockets'].color = color;
                this.materials['leatherMatPockets'].metalness = 0.07;
                this.materials['leatherMatPockets'].roughness = 0.75;
                this.materials['leatherMatPockets'].lightMapIntensity = 1;
                break;
            case 'vinyl':
                this.materials['vinylMatPockets'].color = color;
                this.materials['vinylMatPockets'].lightMapIntensity = 1.05;
                break;
            case 'wool':
                this.materials['woolMatPockets'].color = color;
                this.materials['woolMatPockets'].metalness = 1.05;
                this.materials['woolMatPockets'].lightMapIntensity = 1.8;
                break;
        }
    }

    setPocketsMaterial(material) {
        let newMaterial = null;
        switch (material) {
            case 'leather':
                newMaterial = this.materials['leatherMatPockets'];
                break;
            case 'vinyl':
                newMaterial = this.materials['vinylMatPockets'];
                break;
            case 'wool':
                newMaterial = this.materials['woolMatPockets'];
                break;
        }
        this.modelElements['pockets'].material = newMaterial;
    }

    setKnitTrimStyle(style) {
        let that = this;
        that.removeSceneElements(
            'KnitTrim_1strips_collar',
            'KnitTrim_1strips_body',
            'KnitTrim_1stripsFeathering_collar',
            'KnitTrim_1stripsFeathering_body',
            'KnitTrim_2strips_collar',
            'KnitTrim_2strips_body',
            'KnitTrim_2stripsFeathering_body',
            'KnitTrim_2stripsFeathering_collar',
            'classicCollar_rainbow',
            'knitTrim_rainbow'
        );
        if (style !== 'rainbow' && that.knitTrimRainbow) {
            that.addSceneElements('knitTrim');
            if (that.collarClassic) {
                that.addSceneElements('classicCollar');
            }
            that.knitTrimRainbow = false;
        }
        that.collarFeathering = (style === 'feather');
        switch (style) {
            case 'solid':
                that.collarOneStripe = false;
                that.collarTwoStripes = false;
                break;
            case 'line':
                this.loadModel('gltf/KnitTrim_1strips.glb', function (model) {
                    that.collarOneStripe = true;
                    that.collarTwoStripes = false;
                    that.modelElements['KnitTrim_1strips_body'] = model.scene.children[0];
                    that.modelElements['KnitTrim_1strips_body'].material = that.materials['knitTrimMat_Stripes'];

                    if (that.collarClassic) {
                        that.modelElements['KnitTrim_1strips_collar'] = model.scene.children[1];
                        that.modelElements['KnitTrim_1strips_collar'].material = that.materials['knitTrimMat_Stripes'];

                        that.addSceneElements('classicCollar', 'KnitTrim_1strips_collar');
                    }

                    that.addSceneElements('KnitTrim_1strips_body');
                });
                break;
            case 'stripes':
                this.loadKnitTrimTwoStripes();
                break;
            case 'feather':
                this.loadKnitTrimTwoStripes();
                this.loadModel('gltf/KnitTrim_2stripsFeathering.glb', function (model) {
                    that.collarOneStripe = false;
                    that.collarTwoStripes = true;
                    that.collarFeathering = true;
                    that.modelElements['KnitTrim_2stripsFeathering_body'] = model.scene.children[0];
                    that.modelElements['KnitTrim_2stripsFeathering_body'].material = that.materials['knitTrimMat_StripesFeathering'];

                    if (that.collarClassic) {
                        that.modelElements['KnitTrim_2stripsFeathering_collar'] = model.scene.children[1];
                        that.modelElements['KnitTrim_2stripsFeathering_collar'].material = that.materials['knitTrimMat_StripesFeathering'];

                        that.addSceneElements('KnitTrim_2stripsFeathering_collar');
                    }

                    that.addSceneElements('KnitTrim_2stripsFeathering_body');
                });
                break;
            case 'rainbow':
                this.loadModel('gltf/KnitTrim_Rainbow.glb', function(model) {
                    that.knitTrimRainbow = true;
                    that.modelElements['knitTrim_rainbow'] = model.scene.children[1];
                    that.modelElements['knitTrim_rainbow'].material = that.materials['knitTrimMat_rainbow'];

                    if (that.collarClassic) {
                        that.modelElements['classicCollar_rainbow'] = model.scene.children[0];
                        that.modelElements['classicCollar_rainbow'].material = that.materials['knitTrimMat_rainbow'];

                        that.addSceneElements('classicCollar_rainbow');
                    }

                    that.addSceneElements('knitTrim_rainbow');
                    that.removeSceneElements(
                        'knitTrim',
                        'classicCollar'
                    );
                });
                break;
        }
    }

    loadKnitTrimTwoStripes() {
        let that = this;
        this.loadModel('gltf/KnitTrim_2strips.glb', function (model) {
            that.collarOneStripe = false;
            that.collarTwoStripes = true;
            that.modelElements['KnitTrim_2strips_body'] = model.scene.children[0];
            that.modelElements['KnitTrim_2strips_body'].material = that.materials['knitTrimMat_Stripes'];

            if (that.collarClassic) {
                that.modelElements['KnitTrim_2strips_collar'] = model.scene.children[1];
                that.modelElements['KnitTrim_2strips_collar'].material = that.materials['knitTrimMat_Stripes'];

                that.addSceneElements('classicCollar', 'KnitTrim_2strips_collar');
            }

            that.addSceneElements('KnitTrim_2strips_body');
        });
    }

    setKnitTrimBaseColor(colorData) {
        this.materials['knitTrimMat_main'].color = colorData ? this.parseColor(colorData.hex) : null;
    }

    setKnitTrimStripeColor(colorData) {
        this.materials['knitTrimMat_Stripes'].color = colorData ? this.parseColor(colorData.hex) : null;
    }

    setKnitTrimFeatheringColor(colorData) {
        this.materials['knitTrimMat_StripesFeathering'].color = colorData ? this.parseColor(colorData.hex) : null;
    }

    setInsideLining(type) {
        let colorHex = (type === 'lightweight') ? 'dddddd' : '7d7d7d';
        this.materials['insideMat'].color = this.parseColor(colorHex);
    }

    stopAutoRotation() {
        this.controls.autoRotate = false;
    }

    rotateToBack() {
        this.stopAutoRotation();
        this.controls.reset();
        this.camera.position.set(0, 0, -1);
    }

    rotateToFront() {
        this.stopAutoRotation();
        this.controls.reset();
        this.camera.position.set(0, 0, 1);
    }

    rotateToLeftSide() {
        this.stopAutoRotation();
        this.controls.reset();
        this.camera.position.set(10, 0, 1);
    }

    rotateToRightSide() {
        this.stopAutoRotation();
        this.controls.reset();
        this.camera.position.set(-10, 0, 1);
    }

    getSceneIntersectedObjects(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        return this.raycaster.intersectObjects([this.scene], true);
    }

    selectObject(event) {
        let touchdevice = 'ontouchstart' in window || navigator.msMaxTouchPoints;
        if (this.movestate > 0 && !touchdevice) return false;
        let intersects = this.getSceneIntersectedObjects(event);
        if (intersects.length > 0) {
            this.objectarr = this.objectGroup.children.slice();
            this.objectarr.splice(0, 5);
            for (let i = 0; i < intersects.length; i++) {
                if (this.objectarr.includes(intersects[i].object)) {
                    let objname = intersects[i].object.name;
                    console.log('selectObject', objname);
                    /*if (objname == "hoodie_collar" || objname == "retro_collar" || objname == "classic_collar") {
                        if (document.querySelectorAll('#jacketStyle.uk-open').length > 0)
                            return false;
                        document.querySelectorAll('button[data-uk-toggle="target: #jacketStyle"]')[0].click();
                    } else if (objname == "Patch009" || objname == "Patch002" || objname == "Patch005" || objname == "Patch004" || objname == "Patch001" || objname == "Patch003") {
                        if (document.querySelectorAll('#jacketPersonalization.uk-open').length == 0) {
                            document.querySelectorAll('button[data-uk-toggle="target: #jacketPersonalization"]')[0].click();
                        }
                    } else {
                        if (document.querySelectorAll('#jacketMaterials.uk-open').length == 0) {
                            document.querySelectorAll('button[data-uk-toggle="target: #jacketMaterials"]')[0].click();
                        }
                        setTimeout(function () {
                            let tarDiv;
                            if (objname == "front_body_button" || objname == "front_body_button002" || objname == "front_body_zipper") tarDiv = document.getElementById("jacketbody");

                            if (objname == "sleeves") tarDiv = document.getElementById("jacketsleeves");

                            if (objname == "Pockets") tarDiv = document.getElementById("jacketpockets");

                            if (objname == "Knit_Trim") tarDiv = document.getElementById("jacketknit");

                            if (objname == "button") tarDiv = document.getElementById("jacketsnaps");

                            if (objname == "inside_body_button") tarDiv = document.getElementById("jacketinside");

                            if (objname == "zipper" || objname == "Patch002" || objname == "Knit_Trim" || objname == "front_body_button" || objname == "sleeves" || objname == "button" || objname == "front_body_button002" || objname == "front_body_zipper" || objname == "Pockets" || objname == "Logo" || objname == "inside_body_zipper001" || objname == "inside_body_button") {

                            }
                            document.querySelectorAll("#jacketMaterials > div")[0].scrollTop = tarDiv.offsetTop - 50;
                        }, 50);
                    }
                    if (objname != "Logo" && objname != "button001") {
                        return false;
                    }*/
                }
            }
        }
    }

    onTouchMove(event) {
        if (this.intersectReady == 0) return false;
        this.movestate = 1;
        let intersects = this.getSceneIntersectedObjects(event);
        // console.log(_.map(intersects, function (item) {
        //     return item.object.name;
        // }));
        if (intersects.length > 0) {
            this.objectarr = this.objectGroup.children.slice();
            this.objectarr.splice(0, 5);
            let selectedObject = intersects[0].object;
            if (this.objectarr.includes(selectedObject)) {
                if (intersects[0].object.name == "Logo" || intersects[0].object.name == "button001" || intersects[0].object.name == "Plane") return false;
                this.outlinePass.selectedObjects = [selectedObject];
                // console.log('selectedObjects', this.outlinePass.selectedObjects[0].name);
            }
        } else {
            this.outlinePass.selectedObjects = [];
        }
    }
}
