const uploadRGB = document.getElementById('rgb-img');
const fileInput = document.getElementById('fileInput');

const rgbCanvas = document.getElementById('rgb-canvas');
const hsvCanvas = document.getElementById('hsv-canvas');
const cmykCanvas = document.getElementById('cmyk-canvas');

let rgbPixelsArr = [];
let hsvPixelsArr = [];
let cmykPixelsArr = [];

const hoveredColorDivs = document.querySelectorAll('.hovered-color');

const selectionArea = document.getElementById("selection-area");
const selectionAreaContext = selectionArea.getContext("2d");
let isSelecting = false;
let selectedAreaX1 = 0;
let selectedAreaY1 = 0;
let selectedAreaX2 = 0;
let selectedAreaY2 = 0;

const uploadPhotoBtn = document.getElementById('upload-photo-btn');
const downloadImageBtns = document.querySelectorAll('.download-image');
const cmykCheckboxes = document.querySelectorAll('.cmyk-checkbox');

const colorsDifferencesMessage = document.getElementById('color-differences-message');

const cyanRange = document.getElementById('cyan-range');
const magentaRange = document.getElementById('magenta-range');
const yellowRange = document.getElementById('yellow-range');
const keyBlackRange = document.getElementById('key-black-range');

const cyanRangeValue = document.getElementById('cyan-value');
const magentaRangeValue = document.getElementById('magenta-value');
const yellowRangeValue = document.getElementById('yellow-value');
const keyBlackRangeValue = document.getElementById('key-black-value');

cyanRange.addEventListener('input', () => {
    const cmykPixels = adjustCmykColorsRange(rgbPixelsArr);
    const rgbPixelsConvertedFromCmyk = cmykToRgb(cmykPixels);
    putPixelsInCanvas(cmykCanvas, rgbPixelsConvertedFromCmyk);
    cmykPixelsArr = rgbPixelsConvertedFromCmyk;
    cyanRangeValue.value = cyanRange.value
});
magentaRange.addEventListener('input', () => {
    const cmykPixels = adjustCmykColorsRange(rgbPixelsArr);
    const rgbPixelsConvertedFromCmyk = cmykToRgb(cmykPixels);
    putPixelsInCanvas(cmykCanvas, rgbPixelsConvertedFromCmyk);
    cmykPixelsArr = rgbPixelsConvertedFromCmyk;
    magentaRangeValue.value = magentaRange.value
});
yellowRange.addEventListener('input', () => {
    const cmykPixels = adjustCmykColorsRange(rgbPixelsArr);
    const rgbPixelsConvertedFromCmyk = cmykToRgb(cmykPixels);
    putPixelsInCanvas(cmykCanvas, rgbPixelsConvertedFromCmyk);
    cmykPixelsArr = rgbPixelsConvertedFromCmyk;
    yellowRangeValue.value = yellowRange.value
});
keyBlackRange.addEventListener('input', () => {
    const cmykPixels = adjustCmykColorsRange(rgbPixelsArr);
    const rgbPixelsConvertedFromCmyk = cmykToRgb(cmykPixels);
    putPixelsInCanvas(cmykCanvas, rgbPixelsConvertedFromCmyk);
    cmykPixelsArr = rgbPixelsConvertedFromCmyk;
    keyBlackRangeValue.value = keyBlackRange.value
});

cyanRangeValue.addEventListener('change', () => {
    cyanRange.value = cyanRangeValue.value
    const cmykPixels = adjustCmykColorsRange(rgbPixelsArr);
    const rgbPixelsConvertedFromCmyk = cmykToRgb(cmykPixels);
    putPixelsInCanvas(cmykCanvas, rgbPixelsConvertedFromCmyk);
});
magentaRangeValue.addEventListener('change', () => {
    magentaRange.value = magentaRangeValue.value
    const cmykPixels = adjustCmykColorsRange(rgbPixelsArr);
    const rgbPixelsConvertedFromCmyk = cmykToRgb(cmykPixels);
    putPixelsInCanvas(cmykCanvas, rgbPixelsConvertedFromCmyk);
});
yellowRangeValue.addEventListener('change', () => {
    yellowRange.value = yellowRangeValue.value
    const cmykPixels = adjustCmykColorsRange(rgbPixelsArr);
    const rgbPixelsConvertedFromCmyk = cmykToRgb(cmykPixels);
    putPixelsInCanvas(cmykCanvas, rgbPixelsConvertedFromCmyk);
});
keyBlackRangeValue.addEventListener('change', () => {
    keyBlackRange.value = keyBlackRangeValue.value
    const cmykPixels = adjustCmykColorsRange(rgbPixelsArr);
    const rgbPixelsConvertedFromCmyk = cmykToRgb(cmykPixels);
    putPixelsInCanvas(cmykCanvas, rgbPixelsConvertedFromCmyk);
});


uploadRGB.addEventListener('click', () => {
    if (selectionArea.style.display == '' || selectionArea.style.display == 'none')
        fileInput.click();
});

function downloadCanvasImage(canvas, filename) {
    let dataURL = canvas.toDataURL("image/png");
    let downloadLink = document.createElement("a");

    downloadLink.setAttribute("download", filename);
    downloadLink.setAttribute("href", dataURL);

    downloadLink.click();
    document.body.removeChild(downloadLink);
}


cmykCheckboxes.forEach(cmykCheckbox => {
    cmykCheckbox.addEventListener('change', () => {
        const cmykPixels = adjustCmykColors(cmykPixelsArr);
        const rgbPixelsConvertedFromCmyk = cmykToRgb(cmykPixels);
        putPixelsInCanvas(cmykCanvas, rgbPixelsConvertedFromCmyk);
    })
})

downloadImageBtns.forEach(downloadImageBtn => {
    downloadImageBtn.addEventListener('click', () => {
        const colorspace = downloadImageBtn.getAttribute('data-colorspace');

        switch (colorspace) {
            case 'rgb': downloadCanvasImage(rgbCanvas, 'imageRGB'); break;
            case 'hsv': downloadCanvasImage(hsvCanvas, 'imageHSV'); break;
            case 'cmyk': downloadCanvasImage(cmykCanvas, 'imageCMYK'); break;
            default: break;
        }
    })
})

function putImageToCanvas(canvas, file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                const aspectRatio = img.width / img.height;
                let scaledHeight = canvas.width / aspectRatio;

                if (scaledHeight > canvas.height) {
                    scaledHeight = canvas.height;
                    scaledWidth = scaledHeight * aspectRatio;
                }

                const y = (canvas.height - scaledHeight) / 2;

                ctx.drawImage(img, 0, y, canvas.width, scaledHeight);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                resolve(imageData.data);
            };
            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
    });
}

function rgbToHsv(rgbPixels) {
    let hsvPixels = [...rgbPixels];
    for (let i = 0; i < rgbPixels.length; i += 4) {
        const r = rgbPixels[i] / 255;
        const g = rgbPixels[i + 1] / 255;
        const b = rgbPixels[i + 2] / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        let h = -1;
        let s = -1;

        if (max === min)
            h = 0;
        else if (max === r)
            h = ((60 * ((g - b) / diff)) + 360) % 360;
        else if (max === g)
            h = ((60 * ((b - r) / diff)) + 120) % 360;
        else if (max === b)
            h = ((60 * ((r - g) / diff)) + 240) % 360;

        s = max == 0 ? 0 : (diff / max) * 100;

        let v = max * 100;

        hsvPixels[i] = h = h;
        hsvPixels[i + 1] = s;
        hsvPixels[i + 2] = v;
    }
    return hsvPixels;
}
function hsvToRgb(hsvPixels) {
    const rgbPixels = [...hsvPixels];
    for (let i = 0; i < hsvPixels.length; i += 4) {
        const h = hsvPixels[i];
        const s = hsvPixels[i + 1] / 100;
        const v = hsvPixels[i + 2] / 100;

        let c = v * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = v - c;

        let _r, _g, _b;
        if (h >= 0 && h < 60) {
            _r = c;
            _g = x;
            _b = 0;
        }
        else if (h >= 60 && h < 120) {
            _r = x;
            _g = c;
            _b = 0;
        }
        else if (h >= 120 && h < 180) {
            _r = 0;
            _g = c;
            _b = x;
        }
        else if (h >= 180 && h < 240) {
            _r = 0;
            _g = x;
            _b = c;
        }
        else if (h >= 240 && h < 300) {
            _r = x;
            _g = 0;
            _b = c;
        }
        else if (h >= 300 && h < 360) {
            _r = c;
            _g = 0;
            _b = x;
        }

        const r = (_r + m) * 255;
        const g = (_g + m) * 255;
        const b = (_b + m) * 255;

        rgbPixels[i] = Math.round(r);
        rgbPixels[i + 1] = Math.round(g);
        rgbPixels[i + 2] = Math.round(b);
    }

    return rgbPixels;
}

function rgbToCmyk(rgbPixels) {
    let cmykPixels = [...rgbPixels];
    for (let i = 0; i < rgbPixels.length; i += 4) {
        const r = rgbPixels[i] / 255;
        const g = rgbPixels[i + 1] / 255;
        const b = rgbPixels[i + 2] / 255;
        const a = rgbPixels[i + 3] / 255;

        if (r == 0 && g == 0 && b == 0 && a == 0) {
            cmykPixels[i] = 0;
            cmykPixels[i + 1] = 0;
            cmykPixels[i + 2] = 0;
            cmykPixels[i + 3] = 0;
        } else {
            const k = 1 - Math.max(r, g, b);
            const c = (1 - r - k) / (1 - k);
            const m = (1 - g - k) / (1 - k);
            const y = (1 - b - k) / (1 - k);

            cmykPixels[i] = c;
            cmykPixels[i + 1] = m;
            cmykPixels[i + 2] = y;
            cmykPixels[i + 3] = k;
        }
    }
    return cmykPixels;
}
function cmykToRgb(cmykPixels) {
    const rgbPixels = [...cmykPixels];
    for (let i = 0; i < cmykPixels.length; i += 4) {

        const c = cmykPixels[i]
        const m = cmykPixels[i + 1]
        const y = cmykPixels[i + 2]
        const k = cmykPixels[i + 3];

        var r = 255 * (1 - c) * (1 - k)
        var g = 255 * (1 - m) * (1 - k)
        var b = 255 * (1 - y) * (1 - k)

        rgbPixels[i] = Math.round(r);
        rgbPixels[i + 1] = Math.round(g);
        rgbPixels[i + 2] = Math.round(b);
        rgbPixels[i + 3] = 255;
    }

    return rgbPixels;
}

function putPixelsInCanvas(canvas, pixels) {
    canvas.width = rgbCanvas.width;
    canvas.height = rgbCanvas.height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imageData = new ImageData(new Uint8ClampedArray(pixels), rgbCanvas.width, rgbCanvas.height);
    ctx.putImageData(imageData, 0, 0);
}

fileInput.addEventListener('change', function () {
    const selectedFile = fileInput.files[0]; // Assuming only one file is selected

    document.querySelectorAll('.img-content > :not(canvas)').forEach(element => {
        element.style.display = 'none'
    });

    const rgbCtx = rgbCanvas.getContext('2d');
    rgbCtx.clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);

    putImageToCanvas(rgbCanvas, selectedFile)
        .then((rgbPixels) => {

            const hsvPixels = rgbToHsv(rgbPixels);
            const rgbPixelsConvertedFromHsv = hsvToRgb(hsvPixels);
            putPixelsInCanvas(hsvCanvas, rgbPixelsConvertedFromHsv);

            const cmykPixels = rgbToCmyk(rgbPixels);
            const rgbPixelsConvertedFromCmyk = cmykToRgb(cmykPixels);
            putPixelsInCanvas(cmykCanvas, rgbPixelsConvertedFromCmyk);

            selectionArea.addEventListener('mousemove', event => hoverColor(rgbCanvas, event, hoveredColorDivs[0], hoveredColorDivs[1], hoveredColorDivs[2]));
            hsvCanvas.addEventListener('mousemove', event => hoverColor(hsvCanvas, event, hoveredColorDivs[0], hoveredColorDivs[1], hoveredColorDivs[2]));
            cmykCanvas.addEventListener('mousemove', event => hoverColor(cmykCanvas, event, hoveredColorDivs[0], hoveredColorDivs[1], hoveredColorDivs[2]));

            rgbPixelsArr = rgbPixels;
            hsvPixelsArr = rgbPixelsConvertedFromHsv;
            cmykPixelsArr = rgbPixelsConvertedFromCmyk;

            if (!areColorsEqual()) {
                colorsDifferencesMessage.innerHTML = 'Colors differences when converting to other colorspaces where detected.'
                const unequalColors = getUnequalColors();
                colorsDifferencesMessage.innerHTML += unequalColors;
            } else {
                colorsDifferencesMessage.textContent = 'No differences in colors when converting to other colorspaces where detected.'
            }
        })

    rgbCanvas.style.display = 'block';
    hsvCanvas.style.display = 'block';
    cmykCanvas.style.display = 'block';
    selectionArea.style.display = 'block';
    uploadPhotoBtn.style.display = 'block';
    downloadImageBtns.forEach(downloadImageBtn => {
        downloadImageBtn.style.visibility = 'visible';
    });

});

function isColorDark(red, green, blue) {
    // Calculate luminance
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Return true if luminance is less than or equal to 0.5, indicating a dark color
    return luminance <= 0.5;
}

function getHSV(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = -1;
    let s = -1;

    if (max === min)
        h = 0;
    else if (max === r)
        h = ((60 * ((g - b) / diff)) + 360) % 360;
    else if (max === g)
        h = ((60 * ((b - r) / diff)) + 120) % 360;
    else if (max === b)
        h = ((60 * ((r - g) / diff)) + 240) % 360;

    s = max == 0 ? 0 : (diff / max) * 100;

    let v = max * 100;

    return { h: Math.round(h), s: Math.round(s * 10) / 10, v: Math.round(v * 10) / 10 };
}

function getCMYK(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    var k = 1 - Math.max(r, g, b);
    var c = (1 - r - k) / (1 - k);
    var m = (1 - g - k) / (1 - k);
    var y = (1 - b - k) / (1 - k);

    if (isNaN(c)) c = 0
    if (isNaN(m)) m = 0
    if (isNaN(y)) y = 0

    return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) }
}

function getRgbFromHsv(h, s, v) {
    h = h;
    s = s / 100;
    v = v / 100;

    let c = v * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = v - c;

    let _r, _g, _b;
    if (h >= 0 && h < 60) {
        _r = c;
        _g = x;
        _b = 0;
    }
    else if (h >= 60 && h < 120) {
        _r = x;
        _g = c;
        _b = 0;
    }
    else if (h >= 120 && h < 180) {
        _r = 0;
        _g = c;
        _b = x;
    }
    else if (h >= 180 && h < 240) {
        _r = 0;
        _g = x;
        _b = c;
    }
    else if (h >= 240 && h < 300) {
        _r = x;
        _g = 0;
        _b = c;
    }
    else if (h >= 300 && h < 360) {
        _r = c;
        _g = 0;
        _b = x;
    }

    const r = (_r + m) * 255;
    const g = (_g + m) * 255;
    const b = (_b + m) * 255;

    return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: 255 }
}

function areColorsEqual() {
    for (let i = 0; i < rgbPixelsArr.length; i++) {
        if (rgbPixelsArr[i] != hsvPixelsArr[i] || rgbPixelsArr[i] != cmykPixelsArr[i]) {
            return false;
        }
    }
    return true;
}

function getUnequalColors() {
    let unequalColors = [];
    for (let i = 0; i < rgbPixelsArr.length; i += 4) {
        const rRGB = rgbPixelsArr[i];
        const gRGB = rgbPixelsArr[i + 1];
        const bRGB = rgbPixelsArr[i + 2];

        const rHSV = hsvPixelsArr[i];
        const gHSV = hsvPixelsArr[i + 1];
        const bHSV = hsvPixelsArr[i + 2];

        const rCMYK = cmykPixelsArr[i];
        const gCMYK = cmykPixelsArr[i + 1];
        const bCMYK = cmykPixelsArr[i + 2];

        if (rRGB != rHSV || gRGB != gHSV || bRGB != bHSV ||
            rRGB != rCMYK || gRGB != gCMYK || bRGB != bCMYK) {
            unequalColors.push(`rgb(${rRGB}, ${gRGB}, ${bRGB}); hsv(${rHSV}, ${gHSV}, ${bHSV}); cmyk(${rCMYK}, ${gCMYK}, ${bCMYK}); <br>`);
        }
    }
    return unequalColors;
}

function hoverColor(canvas, event, destination1, destination2, destination3) {
    const rgbCtx = rgbCanvas.getContext('2d');
    const hsvCtx = hsvCanvas.getContext('2d');
    const cmykCtx = cmykCanvas.getContext('2d');

    const bounding = canvas.getBoundingClientRect();

    const x = event.clientX - bounding.left;
    const y = event.clientY - bounding.top;

    const pixel = rgbCtx.getImageData(x, y, 1, 1);
    const hsvPixel = hsvCtx.getImageData(x, y, 1, 1);
    const cmykPixel = cmykCtx.getImageData(x, y, 1, 1);

    const data = pixel.data;
    const hsvColor = getHSV(data[0], data[1], data[2]);
    const cmykColor = getCMYK(data[0], data[1], data[2]);

    const rgba = `rgb(${pixel.data[0]}, ${pixel.data[1]}, ${pixel.data[2]})`;
    const hsvRgba = `rgb(${hsvPixel.data[0]}, ${hsvPixel.data[1]}, ${hsvPixel.data[2]})`;
    const cmykRgba = `rgb(${cmykPixel.data[0]}, ${cmykPixel.data[1]}, ${cmykPixel.data[2]})`;


    const hsv = `hsv(${hsvColor.h}, ${hsvColor.s}, ${hsvColor.v})`
    const cmyk = `cmyk(${cmykColor.c}, ${cmykColor.m}, ${cmykColor.y}, ${cmykColor.k})`


    destination1.style.color = isColorDark(pixel.data[0], pixel.data[1], pixel.data[2]) ? 'white' : 'black';
    destination2.style.color = isColorDark(hsvPixel.data[0], hsvPixel.data[1], hsvPixel.data[2]) ? 'white' : 'black';
    destination3.style.color = isColorDark(cmykPixel.data[0], cmykPixel.data[1], cmykPixel.data[2]) ? 'white' : 'black';


    destination1.style.background = rgba;
    destination1.textContent = rgba;

    destination2.style.background = hsvRgba;
    destination2.innerHTML = `${hsvRgba}<br>${hsv}`;

    destination3.style.background = cmykRgba;
    destination3.innerHTML = `${cmykRgba}<br>${cmyk}`;

    return rgba;
}

function adjustHsvAttributes(rgbPixels) {
    const hue = parseInt(document.getElementById('hue').value);
    const saturation = parseInt(document.getElementById('saturation').value);
    const value = parseInt(document.getElementById('value').value);

    let hsvPixels = [...rgbPixels];
    for (let i = 0; i < rgbPixels.length; i += 4) {
        const r = rgbPixels[i] / 255;
        const g = rgbPixels[i + 1] / 255;
        const b = rgbPixels[i + 2] / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        let h = -1;
        let s = -1;

        if (max === min)
            h = 0;
        else if (max === r)
            h = ((60 * ((g - b) / diff)) + 360) % 360;
        else if (max === g)
            h = ((60 * ((b - r) / diff)) + 120) % 360;
        else if (max === b)
            h = ((60 * ((r - g) / diff)) + 240) % 360;

        s = max == 0 ? 0 : (diff / max) * 100;

        let v = max * 100;

        h = h + hue >= 360 ? h + hue - 360 : h + hue;
        if (saturation >= 0)
            s = s + saturation > 100 ? 100 : s + saturation;
        else
            s = s + saturation < 0 ? 0 : s + saturation;

        if (value >= 0)
            v = v + value > 100 ? 100 : v + value;
        else
            v = v + value < 0 ? 0 : v + value;

        hsvPixels[i] = h;
        hsvPixels[i + 1] = s;
        hsvPixels[i + 2] = v;
    }
    return hsvPixels;
}
function adjustCmykColors(rgbPixels) {
    const isCyanChecked = document.getElementById('cyan').checked;
    const isMagentaChecked = document.getElementById('magenta').checked;
    const isYellowChecked = document.getElementById('yellow').checked;
    const isKeyBlackChecked = document.getElementById('key-black').checked;

    let cmykPixels = [...rgbPixels];
    for (let i = 0; i < rgbPixels.length; i += 4) {
        const r = rgbPixels[i] / 255;
        const g = rgbPixels[i + 1] / 255;
        const b = rgbPixels[i + 2] / 255;
        const a = rgbPixels[i + 3] / 255;
        if (r == 0 && g == 0 && b == 0 && a == 0) {
            cmykPixels[i] = 0;
            cmykPixels[i + 1] = 0;
            cmykPixels[i + 2] = 0;
            cmykPixels[i + 3] = 0;
        } else {

            const k = 1 - Math.max(r, g, b);
            const c = (1 - r - k) / (1 - k);
            const m = (1 - g - k) / (1 - k);
            const y = (1 - b - k) / (1 - k);

            cmykPixels[i] = isCyanChecked ? c : 0;
            cmykPixels[i + 1] = isMagentaChecked ? m : 0;
            cmykPixels[i + 2] = isYellowChecked ? y : 0;
            cmykPixels[i + 3] = isKeyBlackChecked ? k : 0;
        }
    }
    return cmykPixels;
}

function adjustCmykColorsRange(rgbPixels) {
    const cyan = cyanRange.value / 100;
    const magenta = magentaRange.value / 100;
    const yellow = yellowRange.value / 100;
    const keyBlack = keyBlackRange.value / 100;

    let cmykPixels = [...rgbPixels];
    for (let i = 0; i < rgbPixels.length; i += 4) {
        const r = rgbPixels[i] / 255;
        const g = rgbPixels[i + 1] / 255;
        const b = rgbPixels[i + 2] / 255;
        const a = rgbPixels[i + 3] / 255;
        if (r == 0 && g == 0 && b == 0 && a == 0) {
            cmykPixels[i] = 0;
            cmykPixels[i + 1] = 0;
            cmykPixels[i + 2] = 0;
            cmykPixels[i + 3] = 0;
        } else {

            let k = 1 - Math.max(r, g, b);
            let c = (1 - r - k) / (1 - k);
            let m = (1 - g - k) / (1 - k);
            let y = (1 - b - k) / (1 - k);

            if (cyan >= 0)
                c = c + cyan > 100 ? 100 : c + cyan;
            else
                c = c + cyan < 0 ? 0 : c + cyan;

            if (magenta >= 0)
                m = m + magenta > 100 ? 100 : m + magenta;
            else
                m = m + magenta < 0 ? 0 : m + magenta;

            if (yellow >= 0)
                y = y + yellow > 100 ? 100 : y + yellow;
            else
                y = y + yellow < 0 ? 0 : y + yellow;

            if (keyBlack >= 0)
                k = k + keyBlack > 100 ? 100 : k + keyBlack;
            else
                k = k + keyBlack < 0 ? 0 : k + keyBlack;

            cmykPixels[i] = c;
            cmykPixels[i + 1] = m;
            cmykPixels[i + 2] = y;
            cmykPixels[i + 3] = k;
        }
    }
    return cmykPixels;
}

const hueRange = document.getElementById('hue');
const saturationRange = document.getElementById('saturation');
const valueRange = document.getElementById('value');

const hueRangeValue = document.getElementById('hue-value');
const saturationRangeValue = document.getElementById('saturation-value');
const valueRangeValue = document.getElementById('value-value');

hueRangeValue.addEventListener('change', () => {
    hueRange.value = hueRangeValue.value
    const hsvPixels = adjustHsvAttributes(rgbPixelsArr);
    const rgbPixelsConvertedFromHsv = hsvToRgb(hsvPixels);
    putPixelsInCanvas(hsvCanvas, rgbPixelsConvertedFromHsv);
});
saturationRangeValue.addEventListener('change', () => {
    saturationRange.value = saturationRangeValue.value
    const hsvPixels = adjustHsvAttributes(rgbPixelsArr);
    const rgbPixelsConvertedFromHsv = hsvToRgb(hsvPixels);
    putPixelsInCanvas(hsvCanvas, rgbPixelsConvertedFromHsv);
});

valueRangeValue.addEventListener('change', () => {
    valueRange.value = valueRangeValue.value
    const hsvPixels = adjustHsvAttributes(rgbPixelsArr);
    const rgbPixelsConvertedFromHsv = hsvToRgb(hsvPixels);
    putPixelsInCanvas(hsvCanvas, rgbPixelsConvertedFromHsv);
});


hueRange.addEventListener('input', function () {
    const hsvPixels = adjustHsvAttributes(rgbPixelsArr);
    const rgbPixelsConvertedFromHsv = hsvToRgb(hsvPixels);
    putPixelsInCanvas(hsvCanvas, rgbPixelsConvertedFromHsv);
    hueRangeValue.value = hueRange.value
});

saturationRange.addEventListener('input', function () {
    const hsvPixels = adjustHsvAttributes(rgbPixelsArr);
    const rgbPixelsConvertedFromHsv = hsvToRgb(hsvPixels);
    putPixelsInCanvas(hsvCanvas, rgbPixelsConvertedFromHsv);
    saturationRangeValue.value = saturationRange.value
});

valueRange.addEventListener('input', function () {
    const hsvPixels = adjustHsvAttributes(rgbPixelsArr);
    const rgbPixelsConvertedFromHsv = hsvToRgb(hsvPixels);
    putPixelsInCanvas(hsvCanvas, rgbPixelsConvertedFromHsv);
    valueRangeValue.value = valueRange.value
});

function rgbaDifference(rgba1, rgba2) {
    return rgba1.a == 0 && rgba2.a == 0 ? 0 : rgba1.a == 0 || rgba2.a == 0 ? 1e3 : deltaE(rgba2lab(rgba1), rgba2lab(rgba2))
}
function rgba2lab(rgb) {
    var r = rgb.r / rgb.a,
        g = rgb.g / rgb.a,
        b = rgb.b / rgb.a,
        x, y, z;

    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
    y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
    z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}
function deltaE(labA, labB) {
    var deltaL = labA[0] - labB[0];
    var deltaA = labA[1] - labB[1];
    var deltaB = labA[2] - labB[2];

    var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]); // c = √(a^2 + b^2)
    var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);

    var deltaC = c1 - c2;
    var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);

    var sc = 1.0 + 0.045 * c1;
    var sh = 1.0 + 0.015 * c1;

    var deltaLKlsl = deltaL / (1.0);
    var deltaCkcsc = deltaC / (sc);
    var deltaHkhsh = deltaH / (sh);

    var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}


function hexToRgb(hex) {
    // Remove the '#' at the beginning if present
    hex = hex.replace('#', '');

    // Parse the hexadecimal string to get the RGB values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r: r, g: g, b: b, a: 255 };
}

function replaceColor(rgbPixels, colorToReplaceFrom, colorToReplaceTo, threshold) {
    let pixels = [...rgbPixels];
    for (let i = 0; i < rgbPixelsArr.length; i += 4) {
        const r = rgbPixelsArr[i];
        const g = rgbPixelsArr[i + 1];
        const b = rgbPixelsArr[i + 2];
        const a = rgbPixelsArr[i + 3];
        const rgba = { r: r, g: g, b: b, a: a };

        if (rgbaDifference(rgba, colorToReplaceFrom) <= threshold) {
            pixels[i] = colorToReplaceTo.r;
            pixels[i + 1] = colorToReplaceTo.g;
            pixels[i + 2] = colorToReplaceTo.b;
            pixels[i + 3] = colorToReplaceTo.a;
        }
    }
    return pixels;
}

const colorToReplaceFromInput = document.getElementById('replace-color-from');
const colorToReplaceToInput = document.getElementById('replace-color-to');
const thresholdInput = document.getElementById('threshold');

colorToReplaceFromInput.addEventListener('change', () => {
    const colorToReplaceFrom = hexToRgb(colorToReplaceFromInput.value);
    const colorToReplaceTo = hexToRgb(colorToReplaceToInput.value);
    const threshold = parseInt(thresholdInput.value);

    const pixels = replaceColor(rgbPixelsArr, colorToReplaceFrom, colorToReplaceTo, threshold);
    putPixelsInCanvas(rgbCanvas, pixels);
});

colorToReplaceToInput.addEventListener('change', () => {
    const colorToReplaceFrom = hexToRgb(colorToReplaceFromInput.value);
    const colorToReplaceTo = hexToRgb(colorToReplaceToInput.value);
    const threshold = parseInt(thresholdInput.value);

    const pixels = replaceColor(rgbPixelsArr, colorToReplaceFrom, colorToReplaceTo, threshold);
    putPixelsInCanvas(rgbCanvas, pixels);
});

thresholdInput.addEventListener('change', () => {
    const colorToReplaceFrom = hexToRgb(colorToReplaceFromInput.value);
    const colorToReplaceTo = hexToRgb(colorToReplaceToInput.value);
    const threshold = parseInt(thresholdInput.value);

    const pixels = replaceColor(rgbPixelsArr, colorToReplaceFrom, colorToReplaceTo, threshold);
    putPixelsInCanvas(rgbCanvas, pixels);
});

let dashOffset = 0;
let isAnimating = false;
let animationRequestId;

function animateDashedRectangle() {
    // Increment the dash offset to make the dashes move
    dashOffset++;
    if (dashOffset > 10) {
        dashOffset = 0;
    }

    // Clear the previous frame
    selectionAreaContext.clearRect(0, 0, selectionArea.width, selectionArea.height);

    const dashLength = 5;
    // Set the dash offset
    selectionAreaContext.setLineDash([dashLength, dashLength]);
    selectionAreaContext.lineDashOffset = dashOffset;

    // Draw the dashed rectangle
    selectArea(selectionAreaContext, selectedAreaX1, selectedAreaY1, selectedAreaX2, selectedAreaY2);

    // Request the next frame
    animationRequestId = requestAnimationFrame(animateDashedRectangle);
}

selectionArea.addEventListener("mousedown", (e) => {
    selectedAreaX1 = e.offsetX;
    selectedAreaY1 = e.offsetY;
    isSelecting = true;
    if (isAnimating) {
        cancelAnimationFrame(animationRequestId);
        isAnimating = false;
    }
});

selectionArea.addEventListener("mousemove", (e) => {
    if (isSelecting) {
        selectionAreaContext.clearRect(0, 0, selectionArea.width, selectionArea.height);
        selectArea(selectionAreaContext, selectedAreaX1, selectedAreaY1, e.offsetX, e.offsetY);

    }
});

const selectedAreaEditor = document.querySelector('.selected-area-editor');

selectionArea.addEventListener("mouseup", (e) => {
    if (isSelecting) {
        selectArea(selectionAreaContext, selectedAreaX1, selectedAreaY1, e.offsetX, e.offsetY);
        selectedAreaX2 = e.offsetX;
        selectedAreaY2 = e.offsetY;
        isSelecting = false;

        if (!isAnimating) {
            isAnimating = true;
            animateDashedRectangle();
        }

        const canvasRect = selectionArea.getBoundingClientRect();
        const canvasX = canvasRect.left;
        const canvasY = canvasRect.top;

        // Convert the canvas-relative coordinates to window-relative coordinates
        const windowX1 = selectedAreaX1 + canvasX;
        const windowY1 = selectedAreaY1 + canvasY;
        const windowX2 = selectedAreaX2 + canvasX;
        const windowY2 = selectedAreaY2 + canvasY;

        selectedAreaEditor.style.top = `${windowY1 - 95}px`;
        selectedAreaEditor.style.left = `${windowX2}px`;

        selectedAreaEditor.style.display = 'block';
    }
});

function selectArea(context, x1, y1, x2, y2) {
    const color = 'red';
    const thickness = 2;
    const dashLength = 5;

    const width = x2 - x1;
    const height = y2 - y1;

    // Save the current line dash setting
    const originalLineDash = context.getLineDash();

    // Set the line dash pattern
    context.setLineDash([dashLength]);

    // Set the line color
    context.strokeStyle = color;

    // Set the line thickness
    context.lineWidth = thickness;

    // Draw the dashed rectangle
    context.beginPath();
    context.rect(x1, y1, width, height);
    context.stroke();

    // Restore the original line dash setting
    context.setLineDash(originalLineDash);
}

document.addEventListener('click', (event) => {
    if (!selectionArea.contains(event.target)) {
        selectedAreaEditor.style.display = "none";
        selectionAreaContext.clearRect(0, 0, selectionArea.width, selectionArea.height);
        if (isAnimating) {
            cancelAnimationFrame(animationRequestId);
            isAnimating = false;
        }
    }
})

function isPink(rgba, threshold) {
    const pink = { r: 232, g: 149, b: 255, a: 255 }
    const pink1 = { r: 245, g: 66, b: 203, a: 255 }
    const pink2 = { r: 242, g: 138, b: 223, a: 255 }
    const pink3 = { r: 199, g: 20, b: 133, a: 255 }

    if (rgbaDifference(rgba, pink) <= threshold || rgbaDifference(rgba, pink1) <= threshold ||
        rgbaDifference(rgba, pink2) <= threshold || rgbaDifference(rgba, pink3) <= threshold) return true;
    else return false;
}

function adjustHsvColorValue(rgbPixels, context, x1, y1, x2, y2) {
    const value = parseInt(document.getElementById('color-value-range').value);
    const hsvPixels = rgbToHsv(rgbPixels);
    let width = context.canvas.width;

    for (let y = y1; y < y2; y++) {
        for (let x = x1; x < x2; x++) {
            let index = (y * width + x) * 4;
            const r = rgbPixels[index] / 255;
            const g = rgbPixels[index + 1] / 255;
            const b = rgbPixels[index + 2] / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const diff = max - min;

            let h = -1;
            let s = -1;

            if (max === min)
                h = 0;
            else if (max === r)
                h = ((60 * ((g - b) / diff)) + 360) % 360;
            else if (max === g)
                h = ((60 * ((b - r) / diff)) + 120) % 360;
            else if (max === b)
                h = ((60 * ((r - g) / diff)) + 240) % 360;

            s = max == 0 ? 0 : (diff / max) * 100;

            let v = max * 100;

            const rgba = getRgbFromHsv(h, s, v);

            if (isPink(rgba, 40)) {
                if (value >= 0)
                    v = v + value > 100 ? 100 : v + value;
                else
                    v = v + value < 0 ? 0 : v + value;
                hsvPixels[index] = h;
                hsvPixels[index + 1] = s;
                hsvPixels[index + 2] = v;
            }
        }
    }
    document.getElementById('color-value-range').value = 0
    return hsvPixels;
}
const colorValueRange = document.getElementById('color-value-range');
colorValueRange.addEventListener('change', () => {
    const hsvPixels = adjustHsvColorValue(rgbPixelsArr, selectionAreaContext, selectedAreaX1, selectedAreaY1, selectedAreaX2, selectedAreaY2);
    const rgbPixelsConvertedFromHsv = hsvToRgb(hsvPixels);
    rgbCanvas.getContext('2d').clearRect(0, 0, rgbCanvas.width, rgbCanvas.height);
    putPixelsInCanvas(rgbCanvas, rgbPixelsConvertedFromHsv);

    // rgbPixelsArr = rgbPixelsConvertedFromHsv;
});

uploadPhotoBtn.addEventListener('click', () => {
    fileInput.click();
})

document.addEventListener('keydown', function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        putPixelsInCanvas(rgbCanvas, rgbPixelsArr);
    }
});