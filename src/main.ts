import "normalize.css";
import "./style.css";

let ctx: CanvasRenderingContext2D | null = null;
let backgroundCtx: CanvasRenderingContext2D | null = null;

let latestImageBlob: Blob | null = null;

function showLatestImage() {
  if (latestImageBlob === null || ctx === null) {
    window.requestAnimationFrame(showLatestImage);
    return;
  }

  const url = URL.createObjectURL(latestImageBlob);
  const img = new Image();
  img.src = url;

  img.onload = () => {
    ctx!.drawImage(img, 0, 0, ctx!.canvas.width, ctx!.canvas.height);

    const bgInternalWidth = backgroundCtx!.canvas.width;
    const bgInternalHeight = backgroundCtx!.canvas.height;

    const { width: bgActualWidth, height: bgActualHeight } = backgroundCtx!.canvas.getBoundingClientRect();
    const bgActualRatio = bgActualWidth / bgActualHeight;

    const imgRatio = img.width / img.height;

    const actualWidth = bgInternalWidth * 1.25;
    const actualHeight = actualWidth * bgActualRatio / imgRatio;

    const x = (bgInternalWidth - actualWidth) / 2;
    const y = (bgInternalHeight - actualHeight) / 2;

    backgroundCtx!.drawImage(img, x, y, actualWidth, actualHeight);

    URL.revokeObjectURL(url);
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
  };

  window.requestAnimationFrame(showLatestImage);
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d")!;

  const backgroundCanvas = document.getElementById("backgroundCanvas") as HTMLCanvasElement;
  backgroundCtx = backgroundCanvas.getContext("2d")!;

  const socket = new WebSocket(
    location.origin.replace(/^http/, "ws") + "/ws/layers"
  );

  socket.addEventListener("message", (event) => {
    latestImageBlob = event.data as Blob;
  });

  window.addEventListener("resize", () => {
    const sourceWidth = 192;
    const sourceHeight = 320;
    const sourceRatio = sourceWidth / sourceHeight;

    const targetWidth = window.innerWidth * 0.8;
    const targetHeight = window.innerHeight * 0.8;

    ctx!.canvas.width = Math.min(targetWidth, targetHeight * sourceRatio);
    ctx!.canvas.height = canvas.width / sourceRatio;

    ctx!.canvas.style.width = ctx!.canvas.width + "px";
    ctx!.canvas.style.height = ctx!.canvas.height + "px";

    // Reset canvas so it's not blurry
    ctx!.clearRect(0, 0, ctx!.canvas.width, ctx!.canvas.height);
    ctx!.imageSmoothingEnabled = false;
  });
  window.dispatchEvent(new Event("resize"));

  showLatestImage();
});
