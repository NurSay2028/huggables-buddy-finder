import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ZoomIn } from "lucide-react";

type Props = {
  file: File | null;
  /** width / height ratio of the crop frame (e.g. 1 for square, 16/9 for wide) */
  aspect?: number;
  /** max output width in px (height derived from aspect) */
  maxWidth?: number;
  onCancel: () => void;
  onCropped: (file: File) => void;
};

type Offset = { x: number; y: number };

export function ImageCropDialog({
  file,
  aspect = 1,
  maxWidth = 1600,
  onCancel,
  onCropped,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  // load file into an image
  useEffect(() => {
    if (!file) {
      setSrc(null);
      setImg(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // reset transform when a new image loads
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [img]);

  const getFrameSize = () => {
    const el = frameRef.current;
    if (!el) return { w: 0, h: 0 };
    return { w: el.clientWidth, h: el.clientHeight };
  };

  // base scale so the image always covers the frame
  const baseScale = useCallback(() => {
    if (!img) return 1;
    const { w, h } = getFrameSize();
    if (!w || !h) return 1;
    return Math.max(w / img.naturalWidth, h / img.naturalHeight);
  }, [img]);

  const clamp = useCallback(
    (next: Offset, z: number): Offset => {
      if (!img) return next;
      const { w, h } = getFrameSize();
      const s = baseScale() * z;
      const dispW = img.naturalWidth * s;
      const dispH = img.naturalHeight * s;
      const minX = w - dispW;
      const minY = h - dispH;
      return {
        x: Math.min(0, Math.max(minX, next.x)),
        y: Math.min(0, Math.max(minY, next.y)),
      };
    },
    [img, baseScale],
  );

  useEffect(() => {
    setOffset((o) => clamp(o, zoom));
  }, [zoom, clamp]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    setOffset(clamp({ x: drag.current.ox + dx, y: drag.current.oy + dy }, zoom));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const confirm = async () => {
    if (!img || !file) return;
    setProcessing(true);
    try {
      const { w, h } = getFrameSize();
      const s = baseScale() * zoom;
      // source rect in natural pixels
      const sx = -offset.x / s;
      const sy = -offset.y / s;
      const sw = w / s;
      const sh = h / s;

      const outW = Math.min(maxWidth, Math.round(sw));
      const outH = Math.round(outW / aspect);

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas xatosi");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

      const isPng = file.type === "image/png";
      const mime = isPng ? "image/png" : "image/jpeg";
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Rasmni qirqib bo‘lmadi"))),
          mime,
          0.92,
        ),
      );
      const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
      const ext = isPng ? "png" : "jpg";
      const cropped = new File([blob], `${baseName}-crop.${ext}`, { type: mime });
      onCropped(cropped);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={!!file} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rasmni qirqish</DialogTitle>
        </DialogHeader>

        <div
          ref={frameRef}
          className="relative w-full select-none overflow-hidden rounded-xl border border-border bg-muted touch-none"
          style={{ aspectRatio: String(aspect) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {src && img && (
            <img
              src={src}
              alt="Qirqiladigan rasm"
              draggable={false}
              className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left"
              style={{
                width: img.naturalWidth * baseScale() * zoom,
                height: img.naturalHeight * baseScale() * zoom,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}
          {!img && (
            <div className="absolute inset-0 grid place-items-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/40" />
        </div>

        <div className="flex items-center gap-3 px-1">
          <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
        </div>
        <p className="px-1 text-xs text-muted-foreground">
          Rasmni surib joylang va kattalashtiring.
        </p>

        <DialogFooter>
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={processing}>
            Bekor qilish
          </button>
          <button type="button" onClick={confirm} className="btn-primary" disabled={processing || !img}>
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Qirqish va yuklash
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
