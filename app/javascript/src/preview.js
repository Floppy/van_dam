import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export function preview(canvas) {

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
  camera.position.z = 50;

  var renderer = new THREE.WebGLRenderer({canvas, alpha: true});

  const objects = new THREE.Group();
  scene.add(objects);

  const light = new THREE.AmbientLight(0x7f7f7f); // soft white light
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight({position: new THREE.Vector3( 0, 1, 1 )});
  scene.add(directionalLight);

  const material = new THREE.MeshLambertMaterial({
    color: 0x00ff00
  });

  var loader = null;
  if (canvas.dataset.format === "obj")
    loader = new OBJLoader();
  else if (canvas.dataset.format === "stl")
    loader = new STLLoader();


  loader.load( canvas.dataset.previewUrl, function ( model ) {
    var geometry = null;
    if (canvas.dataset.format === "obj")
      geometry = model.geometry;
    else if (canvas.dataset.format === "stl")
      geometry = model;
    const mesh = new THREE.Mesh(geometry, material);
    const bbox = new THREE.Box3().setFromObject(mesh);
    const bsphere = new THREE.Sphere();
    bbox.getBoundingSphere(bsphere);
    camera.position.z = bsphere.radius * 1.2;
    camera.position.y = bsphere.radius * 0.5;
    camera.lookAt(0, 0, 0);
    const centre = new THREE.Vector3();
    bbox.getCenter(centre);
    mesh.position.set(-centre.x, -centre.y, -centre.z);
    objects.add( mesh );
  }, undefined, function ( error ) {
    console.error( error );
  } );

  var animate = function() {
    requestAnimationFrame(animate);

    objects.rotation.z += 0.01;
    objects.rotation.x = -1.57;

    renderer.render(scene, camera);
  };

  animate();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('canvas[data-preview]').forEach((canvas) => {
    preview(canvas)
  })
})