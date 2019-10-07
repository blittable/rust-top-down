import MainImage from "./daisies_med.jpg";
import Underground from "./underground.jpg";
import Bird from "./bird.bmp";
import NineYards from "./nine_yards.jpg";
import BlueMetro from "./blue_metro.jpg";
import Watermark from "./wasm_logo.png"


// Setup global variables
var canvas, canvas2, watermark_canvas;
var ctx, ctx2, watermark_ctx;

import("../../crate/pkg").then(module => {
  var startTime;
  var endTime;
 
  // Setup images
  const newimg = new Image();
  newimg.src = MainImage;
  newimg.style.display = "none";
  newimg.onload = () => {
    setUpCanvas();
  }

  const img2 = new Image();
  img2.src = NineYards;
  img2.style.display = "none";
  img2.onload=() => {
    setUpCanvas2();
  }

  const watermark_img = new Image();
  watermark_img.src = Watermark;
  watermark_img.style.display = "none";
  watermark_img.onload = () => {
    setUpWatermark();
  }

  // Setup event listeners
  let hue_rotate_elem = document.getElementById("hue_rotate");
  hue_rotate_elem.addEventListener('click', function(){console.time("js_edit_time"); editImage(canvas, ctx); console.timeEnd("js_edit_time")}, false);

  let filter_buttons = document.getElementsByClassName("filter");
  for (let i = 0; i < filter_buttons.length; i++) {
    let button = filter_buttons[i];
    button.addEventListener("click", function(){filterImage(event)}, false);
  }

  let effect_buttons = document.getElementsByClassName("effect");
  for (let i = 0; i < effect_buttons.length; i++) {
    let button = effect_buttons[i];
    button.addEventListener("click", function(){applyEffect(event)}, false);
  }

  let blend_buttons = document.getElementsByClassName("blend");
  for (let i = 0; i < blend_buttons.length; i++) {
    let button = blend_buttons[i];
    button.addEventListener("click", function(){blendImages(event)}, false);
  }

  let change_image_btn = document.getElementById("change_img");
  change_image_btn.addEventListener("click", changeImageFromNav, false);

  let vec_btn = document.getElementById("vec_to_photonimage");
  vec_btn.addEventListener("click", vec_to_photonimage_example, false);

  function base64_example() {
    console.time("wasm_time"); 

    ctx.drawImage(newimg, 0, 0);
    startTime = performance.now();

    let base64 = canvas.toDataURL();
    base64 = base64.substr(22, base64.length);
    
    // Convert the raw base64 data to a PhotonImage.
    let photon_img = module.base64_to_image(base64);

    module.grayscale(photon_img);

    // Update the canvas with the new imagedata
    module.putImageData(canvas, ctx, photon_img);
    console.timeEnd("wasm_time");
    endTime = performance.now();
    updateBenchmarks();
    updateEffectName(event.target);
  }

  function applyEffect(event) {
    console.time("wasm_time"); 

    ctx.drawImage(newimg, 0, 0);
    startTime = performance.now();

    // Get the name of the effect the user wishes to apply to the image
    // This is the id of the element they clicked on
    let filter_name = event.target.id;

    // Convert the ImageData to a PhotonImage (so that it can communicate with the core Rust library)
    let rust_image = module.open_image(canvas, ctx);


    // Setup watermark
    let watermark_img = module.open_image(watermark_canvas, watermark_ctx);

    let base64 = canvas.toDataURL();
    
    base64 = base64.substr(22, base64.length);
    console.log(base64)
    
    let base64_to_img = module.base64_to_image(base64);
    console.log("base64", base64_to_img);

    // Maps the name of an effect to its relevant function in the Rust library
    let filter_dict = {"grayscale" : function(){return module.grayscale(base64_to_img)}, 
                      "offset_red": function(){return module.offset(rust_image, 0, 15)},                    
                      "offset_blue": function(){return module.offset(rust_image, 1, 15)},
                      "offset_green": function(){return module.offset(rust_image, 2, 15)},
                      "primary" : function() {return module.primary(rust_image)},
                      "solarize" : function() {return module.solarize(rust_image)},
                      "threshold" : function() {return module.threshold(rust_image, 200)},
                      "sepia" : function() {return module.sepia(rust_image)},
                      "decompose_min" : function(){return module.decompose_min(rust_image)},
                      "decompose_max" : function(){return module.decompose_max(rust_image)},
                      "grayscale_shades": function(){return module.grayscale_shades(rust_image)},
                      "red_channel_grayscale": function() {module.single_channel_grayscale(rust_image, 0)},
                      "green_channel_grayscale": function() {module.single_channel_grayscale(rust_image, 1)},
                      "blue_channel_grayscale": function() {module.single_channel_grayscale(rust_image, 2)},
                      "hue_rotate_hsl": function() {module.hue_rotate_hsl(rust_image, 0.3)}, 
                      "hue_rotate_hsv": function() {module.hue_rotate_hsv(rust_image, 0.3)}, 
                      "hue_rotate_lch": function() {module.hue_rotate_lch(rust_image, 0.3)}, 
                      "lighten_hsl": function() {module.lighten_hsl(rust_image, 0.3)}, 
                      "lighten_hsv": function() {module.lighten_hsv(rust_image, 0.3)}, 
                      "lighten_lch": function() {module.lighten_lch(rust_image, 0.3)}, 
                      "darken_hsl": function() {module.darken_hsl(rust_image, 0.3)}, 
                      "darken_hsv": function() {module.darken_hsv(rust_image, 0.3)}, 
                      "darken_lch": function() {module.darken_lch(rust_image, 0.3 )}, 
                      "desaturate_hsl": function() {module.desaturate_hsl(rust_image, 0.3)}, 
                      "desaturate_hsv": function() {module.desaturate_hsv(rust_image, 0.3)}, 
                      "desaturate_lch": function() {module.desaturate_lch(rust_image, 0.3)}, 
                      "saturate_hsl": function() {module.saturate_hsl(rust_image, 0.3)}, 
                      "saturate_hsv": function() {module.saturate_hsv(rust_image, 0.3)}, 
                      "saturate_lch": function() {module.saturate_lch(rust_image, 0.3)}, 
                      "inc_red_channel": function() {return module.alter_channel(base64_to_img, 0, 120)}, 
                      "inc_blue_channel": function() {return module.alter_channel(rust_image, 2, 100)}, 
                      "inc_green_channel": function() {return module.alter_channel(rust_image, 1, 100)}, 
                      "inc_two_channels": function() {return module.alter_channel(rust_image, 1, 30);}, 
                      "dec_red_channel": function() {return module.alter_channel(rust_image, 0, -30)}, 
                      "dec_blue_channel": function() {return module.alter_channel(rust_image, 2, -30)}, 
                      "dec_green_channel": function() {return module.alter_channel(rust_image, 1, -30)}, 
                      "swap_rg_channels": function() {return module.swap_channels(rust_image, 0, 1);}, 
                      "swap_rb_channels": function() {return module.swap_channels(rust_image, 0, 2);}, 
                      "swap_gb_channels": function() {return module.swap_channels(rust_image, 1, 2);}, 
                      "remove_red_channel": function() {return module.remove_red_channel(rust_image, 250);}, 
                      "remove_green_channel": function() {return module.remove_green_channel(rust_image, 250)},
                      "remove_blue_channel": function() {return module.remove_blue_channel(rust_image, 250)},
                      "emboss": function() {return module.emboss(rust_image)},
                      "box_blur": function() {return module.box_blur(rust_image)},
                      "sharpen": function() {return module.sharpen(rust_image)},
                      "lix": function() {return module.lix(rust_image)},
                      "neue": function() {return module.neue(rust_image)},
                      "ryo": function() {return module.ryo(rust_image)},
                      "gaussian_blur": function() {return module.gaussian_blur(rust_image)},
                      "inc_brightness": function() {return module.inc_brightness(rust_image, 20)},
                      "inc_lum": function() {return module.inc_luminosity(rust_image)},
                      "grayscale_human_corrected": function() {return module.grayscale_human_corrected(rust_image)},
                      "blend": function() {return module.blend(rust_image, rust_image2, "over")},
                      "overlay": function() {return module.blend(rust_image, rust_image2, "overlay")},
                      "atop": function() {return module.blend(rust_image, rust_image2, "atop")},
                      "xor": function() {return module.blend(rust_image, rust_image2, "xor")},
                      "plus": function() {return module.blend(rust_image, rust_image2, "plus")},
                      "multiply": function() {return module.blend(rust_image, rust_image2, "multiply")},
                      "burn": function() {return module.blend(rust_image, rust_image2, "burn")},
                      "difference": function() {return module.blend(rust_image, rust_image2, "difference")},
                      "soft_light": function() {return module.blend(rust_image, rust_image2, "soft_light")},
                      "hard_light": function() {return module.blend(rust_image, rust_image2, "hard_light")},
                      "dodge": function() {return module.blend(rust_image, rust_image2, "dodge")},
                      "exclusion": function() {return module.blend(rust_image, rust_image2, "exclusion")},
                      "lighten": function() {return module.blend(rust_image, rust_image2, "lighten")},
                      "darken": function() {return module.blend(rust_image, rust_image2, "darken")},
                      "watermark": function() {return module.watermark(rust_image, watermark_img, 10, 30)},
                      "text": function() {return module.draw_text(rust_image, "welcome to WebAssembly", 10, 20)},
                      "text_border": function() {return module.draw_text_with_border(rust_image, "welcome to the edge", 10, 20)},
                      "test": function() {return module.filter(rust_image, "rosetint")},
                    };

    // Filter the image, the PhotonImage's raw pixels are modified and 
    // the PhotonImage is returned
    filter_dict[filter_name]();

    // Update the canvas with the new imagedata
    module.putImageData(canvas, ctx, base64_to_img);
    console.timeEnd("wasm_time");
    endTime = performance.now();
    updateBenchmarks();
    updateEffectName(event.target);
  }

  function updateEffectName(elem) {
    let effect_name = elem.innerHTML;
    console.log(effect_name);
    let effect_name_elem = document.getElementById("effect_name");
    effect_name_elem.innerHTML = effect_name;
  }

  function vec_to_photonimage_example() {
    console.time("vec_wasm_time"); 

    ctx.drawImage(newimg, 0, 0);
    startTime = performance.now();

    let base64 = canvas.toDataURL();
    base64 = base64.substr(22, base64.length);
    
    // Convert the raw base64 data to a Vec of u8s.
    let vec = module.base64_to_vec(base64);
    
    // Convert the Vec of u8s to a PhotonImage
    let photon_img = module.photonimage_from_vec(vec); 
    module.grayscale(photon_img);

    // Update the canvas with the new imagedata
    module.putImageData(canvas, ctx, photon_img);
    console.timeEnd("vec_wasm_time");
    endTime = performance.now();
    updateBenchmarks();
  }

  function blendImages(event) {
    console.time("wasm_blend_time"); 

    ctx.drawImage(newimg, 0, 0);
    startTime = performance.now();

    // Get the name of the effect the user wishes to apply to the image
    // This is the id of the element they clicked on
    let filter_name = event.target.id;

    // Convert the ImageData to a PhotonImage (so that it can communicate with the core Rust library)
    let rust_image = module.open_image(canvas, ctx);

    let rust_image2 = module.open_image(canvas2, ctx2);

    // Maps the name of an effect to its relevant function in the Rust library
    let filter_dict = {
                      "blend": function() {return module.blend(rust_image, rust_image2, "over")},
                      "overlay": function() {return module.blend(rust_image, rust_image2, "overlay")},
                      "atop": function() {return module.blend(rust_image, rust_image2, "atop")},
                      "plus": function() {return module.blend(rust_image, rust_image2, "plus")},
                      "multiply": function() {return module.blend(rust_image, rust_image2, "multiply")},
                      "burn": function() {return module.blend(rust_image, rust_image2, "burn")},
                      "difference": function() {return module.blend(rust_image, rust_image2, "difference")},
                      "soft_light": function() {return module.blend(rust_image, rust_image2, "soft_light")},
                      "hard_light": function() {return module.blend(rust_image, rust_image2, "hard_light")},
                      "dodge": function() {return module.blend(rust_image, rust_image2, "dodge")},
                      "exclusion": function() {return module.blend(rust_image, rust_image2, "exclusion")},
                      "lighten": function() {return module.blend(rust_image, rust_image2, "lighten")},
                      "darken": function() {return module.blend(rust_image, rust_image2, "darken")},
                      "watermark": function() {return module.watermark(rust_image, watermark_img, 10, 30)},
                      "text": function() {return module.draw_text(rust_image, "welcome to WebAssembly", 10, 20)},
                      "text_border": function() {return module.draw_text_with_border(rust_image, "welcome to the edge", 10, 20)},
                    };

    // Filter the image, the PhotonImage's raw pixels are modified and 
    // the PhotonImage is returned
    filter_dict[filter_name]();

    // Update the canvas with the new imagedata
    module.putImageData(canvas, ctx, rust_image);
    console.timeEnd("wasm_blend_time");
    endTime = performance.now()
    updateBenchmarks();
    updateEffectName(event.target);
  }
  
  function updateCanvas(new_image) {
    let new_pixels = module.to_image_data(new_image);
    
    // Place the pixels back on the canvas
    ctx.putImageData(new_pixels, 0, 0);
  }

  function filterImage(event) {
    startTime = performance.now();
    ctx.drawImage(newimg, 0, 0);
    let filter_name = event.target.id;
  
    console.time("wasm_time"); 

    // Convert the ImageData to a PhotonImage (so that it can communicate with the core Rust library)
    let rust_image = module.open_image(canvas, ctx);

    // Filter the image, the PhotonImage's raw pixels are modified and 
    // the PhotonImage is returned
    module.filter(rust_image, filter_name);

    // Place the pixels back on the canvas
    module.putImageData(canvas, ctx, rust_image);

    endTime = performance.now();
    updateBenchmarks();
    updateEffectName(event.target);
    console.timeEnd("wasm_time");
  }

  function setUpCanvas() {
    let element = document.getElementById("image_container");
    element.appendChild(newimg);

    canvas = document.getElementById("canvas");
    canvas.width = newimg.width;
    canvas.height = newimg.height;

    ctx = canvas.getContext("2d");
    ctx.drawImage(newimg, 0, 0);
  }

  function setUpCanvas2() {
    let element = document.getElementById("image_container");
    element.appendChild(img2);
    canvas2 = document.createElement("canvas");
    canvas2.width = img2.width;
    canvas2.height = img2.width;

    ctx2 = canvas2.getContext("2d");
    ctx2.drawImage(img2, 0, 0);

  }

  function setUpWatermark() {
    let element = document.getElementById("image_container");
    element.appendChild(watermark_img);
    watermark_canvas = document.createElement("canvas");
    watermark_canvas.width = watermark_img.width;
    watermark_canvas.height = watermark_img.height;

    watermark_ctx = watermark_canvas.getContext("2d");
    watermark_ctx.drawImage(watermark_img, 0, 0);

  }

  function updateBenchmarks() {
    console.log("update benchmarks");
    let time_taken = endTime - startTime;
    let time_elem = document.getElementById("time");
    time_elem.innerHTML = `Time: ${time_taken}ms`;
  }

  // Change the image currently being edited.
  let change_image_elems = document.getElementsByClassName("change_image");

  for (let i = 0; i < change_image_elems.length; i++) {
    let change_image_elem = change_image_elems[i];

    change_image_elem.addEventListener("click", changeImage, false);
  }

  let base64_btn = document.querySelector("#base64");
  base64_btn.addEventListener("click", base64_example, false);

  function changeImage(event) {
    console.log("image changed")
    let img_name = event.target.id;
    let imgNamesToImages = {"underground": Underground, "blue_metro": BlueMetro, "bird": Bird, "nine_yards": NineYards, "fruit": MainImage};
    newimg.src = imgNamesToImages[img_name];
    newimg.onload = () => {
      canvas.width = newimg.width;
      canvas.height = newimg.height;
      ctx.drawImage(newimg, 0, 0);

  }}


  function changeImageFromNav() {
    console.log("image_changed");
    newimg.src = Underground;
    newimg.onload = () => {
      canvas.width = newimg.width;
      canvas.height = newimg.height;
      ctx.drawImage(newimg, 0, 0);

    }
  }

    
  function editImage(canvas, ctx) {
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData[i] += 30;
    }
    ctx.putImageData(imgData, 0, 0);
  }

});
