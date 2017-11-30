// Terceiro trabalho de Computação Gráfica - Bruno Rafaeli

//Global variables
var container, stats;
var camera, scene, renderer;
var group
var mouseX, mouseY;
var windowHalfX = 1000 / 2;
var windowHalfY = 1000 / 2;

var P1 = new THREE.Vector3(); 
var P2 = new THREE.Vector3();

var raycaster;
var mouse = new THREE.Vector2(0,0);
var mouseXBf, mouseYBf;

var alfa = 30
var delta = 0;

var objLoader;

var AnimationControl = function() {
  this.operation = 0;
  this.speed = 100;
  this.animate = false;
};
var gui = new dat.GUI();
var animateController;
var animateSpeed;

var speedValue = 100;
var animateValue = false;
var operationValue = 0;
var anime;

function init() {

    container = document.createElement('div');
    document.getElementById("canvas").appendChild(container);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, 600 );
    container.appendChild( renderer.domElement );


    var canvasWidth = renderer.context.canvas.width;
    var canvasHeight = renderer.context.canvas.height

    camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 1, 1000);

    // scene
    scene = new THREE.Scene();
    var ambient = new THREE.AmbientLight( 0x444444 );
    scene.add( ambient );
    var directionalLight = new THREE.DirectionalLight( 0xffeedd );
    directionalLight.position.set( 0, 0, 1 ).normalize();
    scene.add( directionalLight );

    group = new THREE.Group();
    scene.add( group );

    // BEGIN Clara.io JSON loader code
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.load( './object/fighter.mtl', function( materials ) {
        materials.preload();
        objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.load( './object/fighter.obj', function ( object ) {
            var helper = new THREE.BoxHelper(object);
            helper.material.color.setHex( 0x080808 );
            helper.material.blending = THREE.AdditiveBlending;
            helper.material.transparent = true;
            group.add( helper );
            group.add( object.children[0] );
            group.position.z = -13;
        })
    });

    // Set up mouse callbacks. 
    // Call mousePressed, mouseDragged and mouseReleased functions if defined.
    // Arrange for global mouse variables to be set before calling user callbacks.
    mouseIsPressed = false;
    mouseX = 0;
    mouseY = 0;
    pmouseX = 0;
    pmouseY = 0;
    var setMouse = function () {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }
    renderer.domElement.addEventListener ( 'mousedown', function () {
        setMouse();
        mouseIsPressed = true; 
        if (typeof mousePressed !== 'undefined') mousePressed();
    });
    renderer.domElement.addEventListener ( 'dblclick', function () {
        setMouse();
        mouseDoubleClick();
    });
    renderer.domElement.addEventListener ( 'mousemove', function () { 
        pmouseX = mouseX;
        pmouseY = mouseY;
        setMouse();
        if (mouseIsPressed) {
            if (typeof mouseDragged !== 'undefined') mouseDragged(); 
        }
        if (typeof mouseMoved !== 'undefined') mouseMoved();
    });
    renderer.domElement.addEventListener ( 'mouseup', function () { 
        mouseIsPressed = false; 
        if (typeof mouseReleased !== 'undefined') mouseReleased(); 
    });

    renderer.domElement.addEventListener ( 'wheel', function (e) {
        var delta = e.deltaY;
        if (typeof mouseWheel !== 'undefined') mouseWheel(delta); 
    });

    document.addEventListener( "keypress", function(e) {
        var x = e.which || e.keyCode;
        if (x == 32) {
            if(operationValue === 0){
              gui.__controllers[0].setValue("1");
            }
            else{
              gui.__controllers[0].setValue("0");
            }
        }
    });

    // If a setup function is defined, call it
    if (typeof setup !== 'undefined') setup();

    raycaster = new THREE.Raycaster();

    //This will add a starfield to the background of a scene
    var starsGeometry = new THREE.Geometry();

    for ( var i = 0; i < 10000; i ++ ) {

        var star = new THREE.Vector3();
        star.x = THREE.Math.randFloatSpread( 2000 );
        star.y = THREE.Math.randFloatSpread( 2000 );
        star.z = THREE.Math.randFloatSpread( 2000 );

        starsGeometry.vertices.push( star );

    }

    var starsMaterial = new THREE.PointsMaterial( { color: 0x888888 } );

    var starField = new THREE.Points( starsGeometry, starsMaterial );

    scene.add( starField );


    // First render
    render();
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();


function render() {

    requestAnimationFrame( render );
    renderer.render(scene, camera);

}

function mousePressed() {

    mouseXBf = mouseX;
    mouseYBf = mouseY;

    var intersect = rayCasting();
    P1 = getArcballVector();
}

function mouseDragged() {

    if(operationValue === 1){

        var dx = mouseX - mouseXBf;
        var dy = mouseY - mouseYBf;

        mouseXBf = mouseX;
        mouseYBf = mouseY;

        var translationMatrix = new THREE.Matrix4().set(
            1, 0, 0, dx/alfa,
            0, 1, 0, -dy/alfa,
            0, 0, 1, 0,
            0, 0, 0, 1
            );

        group.applyMatrix(translationMatrix);

        return;
    }

    else{

        P2 = getArcballVector();

        var angle = P1.angleTo(P2);

        var axis = new THREE.Vector3();
        axis.crossVectors ( P1, P2 );
        axis.normalize();

        var quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(axis, angle);

        group.quaternion.multiplyQuaternions(quaternion, group.quaternion);
        // group.applyQuaternion(quaternion);

        P1 = getArcballVector();
    }
}

function mouseReleased() {
}

function mouseMoved() {
}

function mouseDoubleClick(){

}

function mouseWheel(delta){

    if(delta < 0){
        group.position.z +=1;
    }
    else{
        group.position.z += -1;
    }

    alfa = 0.002 * group.position.z**2 +  0.7 * group.position.z + 38

}
function getArcballVector(){

    var groupPosition = toScreenPosition(group, camera);

    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;

    var mx = mouseX - widthHalf - groupPosition.x;
    var my = mouseY - heightHalf - groupPosition.y; 

    var P = new THREE.Vector3(mx, -my, 0);

    var OP_squared = (P.x)**2 + (P.y)**2;

    if(OP_squared <= 250*250){
        P.z = Math.sqrt(250*250 - OP_squared);
    }
    else{
        P.normalize();
    }

    return P;
}

function rayCasting(){

    mouse.x = ( mouseX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( mouseY / window.innerHeight ) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );
    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(group.children, true);

    for(var i = 0; i , intersects.length; i++){
        if(intersects[i].object.parent = group){
            return true;
        }
    }

    return false;
}


function toScreenPosition(obj, camera)
{
    var vector = new THREE.Vector3();

    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = (vector.x * widthHalf);
    vector.y = -(vector.y  * heightHalf);

    return { 
        x: vector.x,
        y: vector.y
    };

}

function interpolate(index, time){

    group.interpolate

}

var dotsIndex = [];
var dotsQuaternion = {};
var dotsPosition = {};
function dots() {

  var div = document.getElementById("dots");

  for(var i = 0; i <= 100; i++){
      var span = document.createElement('span');
      span.id = i;
      span.className = "dot";

      span.addEventListener("click", dotClicked);

      div.appendChild(span);
  }
}

function dotClicked(e) {

    var element = e.srcElement;
    var id = parseInt(element.id)
    var index = dotsIndex.indexOf(id);

    if(index > -1){
        e.srcElement.style.background = "#bbb";
        dotsIndex.splice(index, 1);
    }
    else{
        e.srcElement.style.background = "black";
        dotsIndex.push(id);

        var quater = new THREE.Quaternion();
        var pos = new THREE.Vector3();

        quater.copy(group.quaternion);
        dotsQuaternion[id] = quater;
        dotsPosition[id] = pos.copy(group.position);
    }

    dotsIndex.sort();
}

var oldSliderValue = 0;
var slider = document.getElementById("myRange");
slider.oninput = function() {
    animateObject();
}

function animateObject() {

    var newSliderValue = parseInt(slider.value);
    var nextIndex = -1;

    if(dotsIndex.length > 0){

        if(oldSliderValue < newSliderValue){
            for(var i = 0; i < dotsIndex.length; i++){
                if(dotsIndex[i] > newSliderValue){
                    var nextIndex = dotsIndex[i];
                    break;
                }
            }
            if(nextIndex === -1)
            {
                nextIndex = dotsIndex[0]
                var circles = 100 - newSliderValue + nextIndex;
            }
            else{
                var circles = nextIndex - newSliderValue;
            }
        }
        else{
            for(var i = 0; i < dotsIndex.length; i++){
              if(dotsIndex[i] < newSliderValue){
                  var nextIndex = dotsIndex[i];
                  break;
              }
          }
          if(nextIndex === -1)
          {
              nextIndex = dotsIndex[dotsIndex.length - 1]
              var circles = newSliderValue + 100 - nextIndex;
          }
          else{
              var circles = newSliderValue - nextIndex;
          }
      }
  }

  if(nextIndex != -1 && newSliderValue != oldSliderValue){

    var nextQuat = dotsQuaternion[nextIndex];
    var nextPos = dotsPosition[nextIndex];

    if(circles === 0){
        var t = 1
    }
    else{
        var t = 1/circles;
    }

    group.quaternion.slerp(nextQuat, t);
    group.position.lerp(nextPos, t)
}

oldSliderValue = newSliderValue;

}

window.onload = function() {
  var text = new AnimationControl();
  animateOperation = gui.add(text, 'operation', { Rotation : 0, Translation : 1 } );
  animateController = gui.add(text, 'animate', false);
  animateSpeed = gui.add(text, 'speed', { Slow: 200, Normal: 100, Fast: 50 } );

  animateController.onChange(function(value) {
    animateValue = !animateValue;

    if(animateValue){
        anime = setInterval(function(){ 
            var sliderValue = parseInt(slider.value);
            if(sliderValue === 100){
                slider.value = "0"
            }
            else{
                slider.value = (sliderValue + 1).toString();
            }
            animateObject();
        }, speedValue);
    }
    else{
        clearInterval(anime);
    }

    });

  animateSpeed.onChange(function(value) {
      speedValue = value;
  });

  animateOperation.onChange(function(value) {
      if(operationValue === 0){
        operationValue = 1;
      }
      else{
        operationValue = 0;
      }
  });

  function reposition() {
      var modal = $(this),
      dialog = modal.find('.modal-dialog');
      modal.css('display', 'block');
      // Dividing by two centers the modal exactly, but dividing by three
      // or four works better for larger screens.
      dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
  }
  // Reposition when a modal is shown
  $('.modal').on('show.bs.modal', reposition);
  // Reposition when the window is resized
  $(window).on('resize', function() {
      $('.modal:visible').each(reposition);
  });

  $('#myModal').modal('show');

};

init();
dots();
render();
