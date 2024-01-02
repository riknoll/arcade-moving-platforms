
const backendEndpoint = "https://makecode.com/api";

main();

async function main() {
    const url = process.argv[2];

    if (!url) {
        console.log("no url");
        process.exit(0);
    }

    console.log(await fetchScript(url));
}


async function fetchScript(url) {
    // https://makecode.com/_UAVXEwU7RAew
    // https://arcade.makecode.com/62736-71028-62577-28752
    let scriptID = url.trim();

    if (scriptID.indexOf("/") !== -1) {
        scriptID = scriptID.substr(scriptID.lastIndexOf("/") + 1)
    }

    const text = await (await fetch(backendEndpoint + "/" + scriptID + "/text")).json();

    const main = text["main.ts"];
    const tilesJres = JSON.parse(text["tilemap.g.jres"]);
    let tilesTs = text["tilemap.g.ts"];

    for (const id of Object.keys(tilesJres)) {
        const entry = tilesJres[id];

        if (id === "*" || entry.mimeType !== "image/x-mkcd-f4") continue;

        const bitmap = jresDataToBitmap(entry.data);
        const literal = bitmapToImageLiteral(bitmap, "typescript");

        tilesTs = tilesTs.replace(`export const ${id} = image.ofBuffer(hex\`\`);`, `export const ${id} = ${literal};`)
    }

    tilesTs = tilesTs.replace(/\/\/% fixedInstance jres blockIdentity=images\._tile/g, "")

    const out = tilesTs + "\n" + main;

    return out;
}

function jresDataToBitmap(jresURL) {
    let data = atob(jresURL.slice(jresURL.indexOf(",") + 1))
    let magic = data.charCodeAt(0);
    let w = data.charCodeAt(1);
    let h = data.charCodeAt(2);

    if (magic === 0x87) {
        magic = 0xe0 | data.charCodeAt(1);
        w = data.charCodeAt(2) | (data.charCodeAt(3) << 8);
        h = data.charCodeAt(4) | (data.charCodeAt(5) << 8);
        data = data.slice(4);
    }

    const out = new Bitmap(w, h);

    let index = 4
    if (magic === 0xe1) {
        // Monochrome
        let mask = 0x01
        let v = data.charCodeAt(index++)
        for (let x = 0; x < w; ++x) {
            for (let y = 0; y < h; ++y) {
                out.set(x, y, (v & mask) ? 1 : 0);
                mask <<= 1
                // eslint-disable-next-line
                if (mask == 0x100) {
                    mask = 0x01
                    v = data.charCodeAt(index++)
                }
            }
        }
    }
    else {
        // Color
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y += 2) {
                let v = data.charCodeAt(index++)
                out.set(x, y, v & 0xf);
                // eslint-disable-next-line
                if (y != h - 1) {
                    out.set(x, y + 1, (v >> 4) & 0xf);
                }
            }
            while (index & 3) index++
        }
    }

    return out;
}

const hexChars = [".", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

function bitmapToImageLiteral(bitmap, fileType) {
    let res = '';
    switch (fileType) {
        case "python":
            res = "img(\"\"\"";
            break;
        default:
            res = "img`";
            break;
    }

    if (bitmap) {
        for (let r = 0; r < bitmap.height; r++) {
            res += "\n"
            for (let c = 0; c < bitmap.width; c++) {
                res += hexChars[bitmap.get(c, r)] + " ";
            }
        }
    }

    res += "\n";

    switch (fileType) {
        case "python":
            res += "\"\"\")";
            break;
        default:
            res += "`";
            break;
    }

    return res;
}

class Bitmap {
    buf;
    width = 0;
    height = 0;
    x0 = 0;
    y0 = 0;

    constructor(width, height, x0 = 0, y0 = 0, buf) {
        this.width = width;
        this.height = height;
        this.x0 = x0;
        this.y0 = y0;
        this.buf = buf || new Uint8ClampedArray(this.dataLength());
    }

    set(col, row, value) {
        if (col < this.width && row < this.height && col >= 0 && row >= 0) {
            const index = this.coordToIndex(col, row);
            this.setCore(index, value);
        }
    }

    get(col, row) {
        if (col < this.width && row < this.height && col >= 0 && row >= 0) {
            const index = this.coordToIndex(col, row);
            return this.getCore(index);
        }
        return 0;
    }

    coordToIndex(col, row) {
        return col + row * this.width;
    }

    getCore(index) {
        const cell = Math.floor(index / 2);
        if (index % 2 === 0) {
            return this.buf[cell] & 0xf;
        }
        else {
            return (this.buf[cell] & 0xf0) >> 4;
        }
    }

    setCore(index, value) {
        const cell = Math.floor(index / 2);
        if (index % 2 === 0) {
            this.buf[cell] = (this.buf[cell] & 0xf0) | (value & 0xf);
        }
        else {
            this.buf[cell] = (this.buf[cell] & 0x0f) | ((value & 0xf) << 4);
        }
    }

    dataLength() {
        return Math.ceil(this.width * this.height / 2);
    }
}