// import $ from 'jquery';

import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

// window.jQuery = $;

UIkit.use(Icons);

let WebFont = require('webfontloader');

WebFont.load({
  custom: {
    families: ['Athletico', 'Evanston', 'Old English', 'Hudson', 'Saloon', 'Stash', 'Veneer']
  },
  typekit: {
    id: 'ooe8eql'
  }
});

// WIZARD
let jacketStyle = document.getElementById('jacketCustomization');

if (typeof(jacketStyle) != 'undefined' && jacketStyle != null){
  UIkit.offcanvas(jacketStyle).show();
}

let menuBtn = document.getElementsByClassName('w-nav__button');

for (let i = 0; i < menuBtn.length; i++) {
  menuBtn[i].addEventListener('click', function () {
    this.classList.add('is-active');

    for (let k = 0; k < menuBtn.length; k++) {
      if (k !== i) {
        menuBtn[k].classList.remove('is-active');
      }
    }
  });
}
// end of WIZARD

// MOBILE COLOR OPTIONS
const mediaQuery = '(max-width: 959px)';
const mediaQueryList = window.matchMedia(mediaQuery);
const colorPalette = document.getElementsByClassName('w-accordion');

if (mediaQueryList.matches) {
  toggleColorPalettes();
}

mediaQueryList.addEventListener('change', event => {
  if (event.matches) {
    toggleColorPalettes();
  } else {
    for (let i = 0; i < colorPalette.length; i++) {
      if (colorPalette[i].querySelectorAll('uk-open')) {
        UIkit.accordion(colorPalette[i]).toggle(0, false);
      }
    }
  }
});

function toggleColorPalettes() {
  for (let i = 0; i < colorPalette.length; i++) {
    UIkit.accordion(colorPalette[i]).toggle(0, false);
  }
}
// end of MOBILE COLOR OPTIONS

function getTarget (e) {
  return e.target.dataset.target;
}

// UPDATE LETTERS
const lettersInput = document.getElementsByClassName('lettersInput');

for (let i = 0; i < lettersInput.length; i++) {
  lettersInput[i].addEventListener('keyup', function () {
    let lettersOutput = document.querySelectorAll('#' + this.dataset.target + ' ' + 'span' + '');

    for (let k = 0; k < lettersOutput.length; k++) {
      let letters = this.value.split(''),
          lettersCount = letters.length;

      lettersOutput[k].innerHTML = '';

      letters.forEach(function (l) {
        lettersOutput[k].innerHTML += '<span>' + l + '</span>';
      });

      removeClassByPrefix(lettersOutput[k], 'lettersCount');
      lettersOutput[k].classList.add('lettersCount' + '' + lettersCount + '');
    }
  })
}
// end of UPDATE LETTERS

// UPDATE TEXT
const textInput = document.getElementsByClassName('textInput');

function removeClassByPrefix(el, prefix) {
  let regx = new RegExp('\\b' + prefix + '.*?\\b', 'g');
  el.className = el.className.replace(regx, '');
  return el;
}

for (let i = 0; i < textInput.length; i++) {
  textInput[i].addEventListener('keyup', function () {
    let textOutput = document.querySelectorAll('#' + this.dataset.target + ' ' + 'span' + '');

    for (let k = 0; k < textOutput.length; k++) {
      let letters = this.value.split(''),
          lettersCount = letters.length;

      textOutput[k].innerHTML = '';

      textOutput[k].innerHTML = '<span>' + this.value + '</span>';

      // letters.forEach(function (l) {
      //   textOutput[k].innerHTML += '' + l + '';
      // });

      removeClassByPrefix(textOutput[k], 'lettersCount');
      textOutput[k].classList.add('lettersCount' + '' + lettersCount + '');
    }
  })
}
// end of UPDATE TEXT

// UPDATE TEXT STYLE
const updateTextStyle = document.getElementsByClassName('updateTextStyle');

for (let i = 0; i < updateTextStyle.length; i++) {

  if (updateTextStyle[i].checked) {
    let updateTextStyleTarget = document.querySelectorAll('#' + updateTextStyle[i].dataset.target + '');

    for (let k = 0; k < updateTextStyleTarget.length; k++) {
      removeClassByPrefix(updateTextStyleTarget[k], 'textStyle');
      updateTextStyleTarget[k].classList.add('textStyle' + '' +updateTextStyle[i].value + '');
    }
  }

  updateTextStyle[i].addEventListener('change', function (e) {
    let updateTextStyleTarget = document.querySelectorAll('#' + e.target.dataset.target + '');

    for (let k = 0; k < updateTextStyleTarget.length; k++) {
      removeClassByPrefix(updateTextStyleTarget[k], 'textStyle');
      updateTextStyleTarget[k].classList.add('textStyle' + '' + e.target.value + '');
    }
  })
}
// end of UPDATE TEXT STYLE

// ADD PATCH PREVIEW
const addPatch = document.querySelectorAll('.addPatch');

addPatch.forEach(function (item) {
  item.addEventListener('change', function (e) {
    let target = document.getElementById(getTarget(e)),
        srcToAdd = this.dataset.src;

    target.setAttribute('src', srcToAdd);
  });
});
// end of ADD PATCH PREVIEW

// TOGGLE CLASS
const addClass = document.querySelectorAll('.addClass');

addClass.forEach(function (item) {
  item.addEventListener('change', function (e) {
    let target = document.getElementById(getTarget(e)),
        classToAdd = this.dataset.class;

    if (this.checked) {
      target.classList.add(classToAdd);
    } else {
      target.classList.remove(classToAdd);
    }
  });
});
// end of TOGGLE CLASS

// UPDATE FONT FAMILY
const updateFontStyle = document.querySelectorAll('.updateFontStyle');

updateFontStyle.forEach(function (item) {
  if (item.checked) {
    document.getElementById(item.dataset.target).dataset.fontFamily = item.value;
  }

  item.addEventListener('change', function (e) {
    document.getElementById(item.dataset.target).dataset.fontFamily = item.value;
  })
});
// end of UPDATE FONT FAMILY

// UPDATE LABEL
const updateLabel = document.getElementsByClassName('updateLabel'),
      updateLabelLength = updateLabel.length;

for (let i = 0; i < updateLabelLength; i++) {
  updateLabel[i].addEventListener('change', function (e) {
    let labelColor = document.getElementById(e.target.getAttribute('name')).querySelector('.w-color-label'),
        labelValue = document.getElementById(e.target.getAttribute('name')).querySelector('.w-value-label'),
        colorHex = e.target.dataset.hex;

    Object.assign(labelColor.style, {
      backgroundColor: colorHex,
      color: colorHex
    });
    labelValue.innerText = e.target.value;
  });
}
// end of UPDATE LABEL

// UPDATE LABEL COLOR
const updateLabelColor = document.querySelectorAll('.updateLabelColor');

updateLabelColor.forEach(function (item) {
  if (item.checked) {
    let labelColor = document.getElementById(item.getAttribute('name')).querySelector('.w-color-label'),
        colorHex = item.dataset.hex;

    Object.assign(labelColor.style, {
      backgroundColor: colorHex,
      color: colorHex
    });
  }

  item.addEventListener('change', function (e) {
    let labelColor = document.getElementById(e.target.getAttribute('name')).querySelector('.w-color-label'),
        colorHex = e.target.dataset.hex;

    if (e.target.name === 'body_color') {
      let material = document.querySelector("input[name=body_material]:checked");
      if (typeof material !== "undefined") {
        previewInterface3D.setBodyColor({hex: colorHex.substr(1)}, material.value);
      }
    }
    if (e.target.name === 'sleeves_color') {
      let material = document.querySelector("input[name=sleeves_material]:checked");
      if (typeof material !== "undefined") {
        previewInterface3D.setSleevesColor({hex: colorHex.substr(1)}, material.value);
      }
    }
    if (e.target.name === 'pockets_color') {
      let material = document.querySelector("input[name=pockets_material]:checked");
      if (typeof material !== "undefined") {
        previewInterface3D.setPocketsColor({hex: colorHex.substr(1)}, material.value);
      }
    }
    if (e.target.name === 'inserts_color') {
      let material = document.querySelector("input[name=inserts_material]:checked");
      if (typeof material !== "undefined") {
        previewInterface3D.setShouldersColor({hex: colorHex.substr(1)}, material.value);
      }
    }
    if (e.target.name === 'snaps_color') {
      previewInterface3D.setSnapsColor({hex: colorHex.substr(1)});
    }
    if (e.target.name === 'knittrim_base_color') {
      previewInterface3D.setKnitTrimBaseColor({hex: colorHex.substr(1)});
    }
    if (e.target.name === 'knittrim_stripe_color') {
      previewInterface3D.setKnitTrimStripeColor({hex: colorHex.substr(1)});
    }
    if (e.target.name === 'knittrim_feathering_color') {
      previewInterface3D.setKnitTrimFeatheringColor({hex: colorHex.substr(1)});
    }

    Object.assign(labelColor.style, {
      backgroundColor: colorHex,
      color: colorHex
    });
  });
});
// end of UPDATE LABEL COLOR

// UPDATE LABEL TEXT
const updateLabelText = document.querySelectorAll('.updateLabelText');

updateLabelText.forEach(function (item) {
  if (item.checked) {
    document.getElementById(item.getAttribute('name')).querySelector('.w-value-label').innerText = item.value;
  }

  item.addEventListener('change', function (e) {
    let labelValue = document.getElementById(e.target.getAttribute('name')).querySelector('.w-value-label');

    labelValue.innerText = e.target.value;
  });
});
// end of UPDATE LABEL TEXT

// UPDATE LABEL IMAGE
let updateLabelImg = document.querySelectorAll('.updateLabelImg');

updateLabelImg.forEach(function (item) {
  if (item.checked) {
    document.getElementById(item.getAttribute('name')).querySelector('.w-value-img').setAttribute('src', item.dataset.src);
  }

  item.addEventListener('change', function (e) {
    let target = document.getElementById(e.target.getAttribute('name')),
        imgSrc = item.dataset.src;

    target.querySelector('.w-value-img').setAttribute('src', imgSrc);
  });
});
// end of UPDATE LABEL IMAGE

// UPDATE FONT COLOR
const updateFontColor = document.querySelectorAll('.updateFontColor');

updateFontColor.forEach(function (item) {
  if (item.checked) {
    document.getElementById(item.dataset.target).style.setProperty('--font-color', item.dataset.hex);
  }

  item.addEventListener('change', function (e) {
    document.getElementById(getTarget(e)).style.setProperty('--font-color', e.target.dataset.hex);
  })
});
// end of UPDATE FONT COLOR

// UPDATE FONT OUTLINE
const updateFontOutline = document.getElementsByClassName('updateFontOutline');

for (let i = 0; i < updateFontOutline.length; i++) {
  updateFontOutline[i].addEventListener('change', function (e) {
    document.getElementById(getTarget(e)).style.setProperty('--outline-color', e.target.dataset.hex);
  });
}
// end of UPDATE FONT OUTLINE

// GENERATE PNG (WIZARD)
import html2canvas from 'html2canvas-stroke';

const buttonGenerate = document.querySelectorAll('.buttonGenerate');

buttonGenerate.forEach(function (item) {
  item.addEventListener('click', function () {
    let target = document.getElementById(this.dataset.target),
        preview = this.dataset.preview;

    let targetWidth = target.offsetWidth,
        targetHeight = target.offsetHeight;

    window.scrollTo(0, 0);

    target.style.cssText = 'width: '+ +targetWidth +'px; height: ' + +targetHeight +'px;';

    html2canvas(target, {
      allowTaint: true,
      backgroundColor: null,
      imageTimeout: 0,
      scale: 5
    }).then((canvas) => {
      const base64image = canvas.toDataURL("image/png");

      document.getElementById(preview).setAttribute('src', base64image);

      target.style.cssText = '';
    });
  });
});
// end of GENERATE PNG (WIZARD)

// SAMPLE NOTIFICATION TEST
// UIkit.modal('#notificationSample').show();
// end of SAMPLE NOTIFICATION TEST

// 3D Model controls
let form = document.getElementById('vbApp');

if (form) {
  form.querySelectorAll('input[name=collar]')
    .forEach(function (item) {
      item.addEventListener('change', function () {
        previewInterface3D.setJacketStyle(this.value);
      })
    });

  form.querySelectorAll('input[name=insideLining]')
    .forEach(function (item) {
      item.addEventListener('change', function () {
        previewInterface3D.setInsideLining(this.value);
      })
    });

  form.querySelectorAll('input[name=snaps-zipper]')
    .forEach(function (item) {
      item.addEventListener('change', function () {
        if (this.value === "Snaps") {
          previewInterface3D.setBodySnaps();
        } else {
          previewInterface3D.setBodyZipper();
        }
      })
    });

  form.querySelector('input[name=shoulderInserts]')
    .addEventListener('change', function () {
      if (this.checked) {
        previewInterface3D.addShoulderInserts();
      } else {
        previewInterface3D.removeShoulderInserts();
      }
    });

  form.querySelectorAll('input[name=body_material]')
    .forEach(function (item) {
      item.addEventListener('change', function () {
        previewInterface3D.setBodyMaterial(this.value);
      })
    });
  form.querySelectorAll('input[name=sleeves_material]')
    .forEach(function (item) {
      item.addEventListener('change', function () {
        previewInterface3D.setSleevesMaterial(this.value);
      })
    });
  form.querySelectorAll('input[name=pockets_material]')
    .forEach(function (item) {
      item.addEventListener('change', function () {
        previewInterface3D.setPocketsMaterial(this.value);
      })
    });
  form.querySelectorAll('input[name=inserts_material]')
    .forEach(function (item) {
      item.addEventListener('change', function () {
        previewInterface3D.setShouldersMaterial(this.value);
      })
    });
  form.querySelectorAll('input[name=knit_trim]')
    .forEach(function (item) {
      item.addEventListener('change', function () {
        previewInterface3D.setKnitTrimStyle(this.value);
      })
    });
}


// FILE UPLOADER
UIkit.upload('.js-upload', {

  url: '',
  multiple: true,

  beforeSend: function () {
    console.log('beforeSend', arguments);
  },
  beforeAll: function () {
    console.log('beforeAll', arguments);
  },
  load: function () {
    console.log('load', arguments);
  },
  error: function () {
    console.log('error', arguments);
  },
  complete: function () {
    console.log('complete', arguments);
  },

  loadStart: function (e) {
    console.log('loadStart', arguments);
  },

  progress: function (e) {
    console.log('progress', arguments);
  },

  loadEnd: function (e) {
    console.log('loadEnd', arguments);
  },

  completeAll: function () {
    console.log('completeAll', arguments);
  }

});
// end of FILE UPLOADER
