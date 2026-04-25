import { Pairing } from "./data";

export async function generateShareCard(pairing: Pairing, activePicIndex: number = 0, currentIndex?: number): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920; 
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  // 1. Gather & Load all Lookbook Images
  const rawImages = [pairing.image_url, ...(pairing.additional_images || [])];
  const images = rawImages.filter(url => url && url.trim() !== "");
  const totalPics = images.length;

  const loadedImages = await Promise.all(
    images.map((src) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    })
  );

  // 2. Clear Canvas
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, 1080, 1920);

  // 3. Draw Mosaic Geometry
  const GUTTER = 6;
  const drawImageProp = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
    const scale = Math.max(w / img.width, h / img.height);
    const ix = (w - img.width * scale) / 2;
    const iy = (h - img.height * scale) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(img, x + ix, y + iy, img.width * scale, img.height * scale);
    ctx.restore();
  };

  if (totalPics === 1) {
    // Single Picture: Full Bleed
    drawImageProp(loadedImages[0], 0, 0, 1080, 1920);
  } else if (totalPics === 2) {
    // 2 Pictures: Horizontal Split (Main Top 1150px, Accent Bottom 770px)
    const mainImg = loadedImages[activePicIndex];
    const otherImg = loadedImages[activePicIndex === 0 ? 1 : 0];
    
    drawImageProp(mainImg, 0, 0, 1080, 1150);
    drawImageProp(otherImg, 0, 1150 + GUTTER, 1080, 770 - GUTTER);
  } else {
    // 3 Pictures: Cinematic Mosaic (Main Left 64%, Accents Right stack)
    const mainImg = loadedImages[activePicIndex];
    const others = loadedImages.filter((_, i) => i !== activePicIndex);
    
    const MAIN_W = 690;
    const SIDE_W = 1080 - MAIN_W - GUTTER;
    const SIDE_H = (1920 - GUTTER) / 2;

    drawImageProp(mainImg, 0, 0, MAIN_W, 1920);
    drawImageProp(others[0], MAIN_W + GUTTER, 0, SIDE_W, SIDE_H);
    drawImageProp(others[1], MAIN_W + GUTTER, SIDE_H + GUTTER, SIDE_W, SIDE_H);
  }

  // 4. Cinematic Gradients ensures Text Readability
  const gradientTop = ctx.createLinearGradient(0, 0, 0, 500);
  gradientTop.addColorStop(0, "rgba(0,0,0,0.85)");
  gradientTop.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradientTop;
  ctx.fillRect(0, 0, 1080, 500);

  const gradientBottom = ctx.createLinearGradient(0, 1000, 0, 1920);
  gradientBottom.addColorStop(0, "rgba(0,0,0,0)");
  gradientBottom.addColorStop(0.5, "rgba(0,0,0,0.8)");
  gradientBottom.addColorStop(1, "rgba(0,0,0,0.95)");
  ctx.fillStyle = gradientBottom;
  ctx.fillRect(0, 1000, 1080, 1920);

  // 5. Branding
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = "400 24px sans-serif";
  (ctx as any).letterSpacing = "15px"; 
  ctx.textAlign = "center";
  ctx.fillText("D R I F T", 540, 100);

  // Vertical Lookbook Rail (Right Edge)
  if (totalPics > 1) {
    ctx.save();
    ctx.translate(1030, 960);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    (ctx as any).letterSpacing = "8px";
    ctx.font = "400 18px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.fillText(`LOOKBOOK // ${(activePicIndex + 1).toString().padStart(2, '0')} — ${totalPics.toString().padStart(2, '0')}`, 0, 0);
    ctx.restore();
  }

  // 6. Massive Ghost Index 
  const displayIndex = currentIndex !== undefined 
    ? (currentIndex + 1).toString().padStart(2, '0')
    : pairing.ghost_index || '01';

  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.font = "italic 450px serif";
  (ctx as any).letterSpacing = "0px";
  ctx.textAlign = "right";
  ctx.fillText(displayIndex, 1040, 1680);

  // 7. Primary Text Details
  ctx.textAlign = "left";
  
  // The Vibe
  ctx.fillStyle = "#ffffff";
  ctx.font = "italic 90px serif"; 
  ctx.fillText(pairing.vibe, 80, 1600);

  // Clean Divider
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(80, 1650, 920, 2);

  // Music Meta
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 32px sans-serif";
  (ctx as any).letterSpacing = "4px";
  ctx.fillText(pairing.song_title.toUpperCase(), 80, 1730);

  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = "400 22px sans-serif";
  ctx.fillText(pairing.artist.toUpperCase(), 80, 1780);

  // Audio DNA Coordinates (Bottom Right)
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "400 20px sans-serif";
  (ctx as any).letterSpacing = "8px";
  ctx.fillText(`ENG: ${Math.round(pairing.energy * 100)}%`, 1000, 1730);
  ctx.fillText(`TMP: ${Math.round(pairing.tempo * 100)}%`, 1000, 1780);

  return canvas.toDataURL("image/jpeg", 0.9);
}

