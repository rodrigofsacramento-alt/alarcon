"use client";

import { useEffect, useRef, useState } from "react";

// CONFIGURAÇÃO: Altere aqui o número total de frames que você exportou
const TOTAL_FRAMES = 100; 

// Função auxiliar para formatar o nome do arquivo (ex: frame_001.jpg)
const getFramePath = (index: number) => {
  const pad = String(index).padStart(3, "0");
  return `/images/frame_${pad}.jpg`; // Certifique-se de que as imagens existam em public/images/
};

export default function ProductScrollCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 1. Pré-carregamento das imagens
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setImagesLoaded(true);
        }
      };
      // Tratamento de erro caso a imagem não exista (para não travar a tela)
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) setImagesLoaded(true);
      }
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // 2. Monitoramento do Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = -rect.top;
      const totalScrollableHeight = rect.height - window.innerHeight;
      
      const progress = Math.max(0, Math.min(1, scrollTop / totalScrollableHeight));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Renderização do Frame correspondente no Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesLoaded || images.length === 0) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const frameIndex = Math.floor(scrollProgress * (TOTAL_FRAMES - 1));
    const activeImage = images[frameIndex];

    if (activeImage && activeImage.complete && activeImage.naturalWidth > 0) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const imgRatio = activeImage.width / activeImage.height;
      const canvasRatio = canvas.width / canvas.height;
      let renderWidth = canvas.width;
      let renderHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        renderHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - renderHeight) / 2;
      } else {
        renderWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - renderWidth) / 2;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(activeImage, offsetX, offsetY, renderWidth, renderHeight);
    } else {
      // Se não houver imagens, desenha um fundo escuro elegante como fallback
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      context.fillStyle = "#0f172a"; // slate-900
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [scrollProgress, imagesLoaded, images]);

  return (
    // Adicionamos 'print:hidden' para que todo o canvas 3D e animações não saiam na impressão PDF
    <div ref={containerRef} className="relative h-[400vh] bg-slate-900 print:hidden">
      
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        {!imagesLoaded && (
          <div className="absolute text-white font-mono text-sm z-50 opacity-50">
            Carregando experiência interativa...
          </div>
        )}

        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
          
          <h2 
            className="text-white text-4xl md:text-6xl font-bold tracking-tight text-center transition-opacity duration-300 absolute"
            style={{ 
              opacity: scrollProgress > 0.05 && scrollProgress < 0.25 ? 1 : 0,
              transform: `translateY(${(0.15 - scrollProgress) * 50}px)`
            }}
          >
            Design Reimaginado.
          </h2>

          <h2 
            className="text-white text-4xl md:text-6xl font-bold tracking-tight text-center transition-opacity duration-300 absolute"
            style={{ 
              opacity: scrollProgress > 0.4 && scrollProgress < 0.6 ? 1 : 0,
              transform: `translateY(${(0.5 - scrollProgress) * 50}px)`
            }}
          >
            Performance Absoluta.
          </h2>

          <h2 
            className="text-white text-4xl md:text-6xl font-bold tracking-tight text-center transition-opacity duration-300 absolute"
            style={{ 
              opacity: scrollProgress > 0.75 && scrollProgress < 0.95 ? 1 : 0,
              transform: `translateY(${(0.85 - scrollProgress) * 50}px)`
            }}
          >
            Disponível Agora.
          </h2>

        </div>
      </div>
    </div>
  );
}
