"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SQRT_5000 = Math.sqrt(5000);

/* Retratos de stock (Unsplash) en ciclo para los avatares */
const FACES = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces&auto=format&q=60",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces&auto=format&q=60",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&auto=format&q=60",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces&auto=format&q=60",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces&auto=format&q=60",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces&auto=format&q=60",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=faces&auto=format&q=60",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces&auto=format&q=60",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces&auto=format&q=60",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces&auto=format&q=60",
];

const RAW = [
  { tempId: 0, testimonial: "Nuestra solución favorita del mercado. Con LocalExpertiz trabajamos 5x más rápido.", by: "Alex, CEO en TechCorp" },
  { tempId: 1, testimonial: "Sé que mis datos están seguros con LocalExpertiz. No puedo decir lo mismo de otros proveedores.", by: "Dan, CTO en SecureNet" },
  { tempId: 2, testimonial: "Sé que suena a cliché, pero estábamos perdidos hasta que encontramos a LocalExpertiz. ¡Mil gracias!", by: "Stephanie, COO en InnovateCo" },
  { tempId: 3, testimonial: "Los servicios de LocalExpertiz hacen que planear el futuro sea sencillo. ¡Súper recomendados!", by: "Marie, CFO en FuturePlanning" },
  { tempId: 4, testimonial: "Si pudiera darles 11 estrellas, les daría 12.", by: "Andre, Head of Design en CreativeSolutions" },
  { tempId: 5, testimonial: "¡QUÉ FELICES DE HABERLOS ENCONTRADO! Me han ahorrado más de 100 horas.", by: "Jeremy, Product Manager en TimeWise" },
  { tempId: 6, testimonial: "Costó convencernos, pero ahora que estamos con LocalExpertiz no volvemos atrás.", by: "Pam, Marketing Director en BrandBuilders" },
  { tempId: 7, testimonial: "Estaría perdido sin la analítica a fondo de LocalExpertiz. El ROI es fácilmente de 100X.", by: "Daniel, Data Scientist en AnalyticsPro" },
  { tempId: 8, testimonial: "Simplemente es lo mejor. Punto.", by: "Fernando, UX Designer en UserFirst" },
  { tempId: 9, testimonial: "Cambié hace 5 años y nunca miré atrás.", by: "Andy, DevOps Engineer en CloudMasters" },
  { tempId: 10, testimonial: "Llevaba AÑOS buscando una solución como LocalExpertiz. ¡Qué alegría haberla encontrado!", by: "Pete, Sales Director en RevenueRockets" },
  { tempId: 11, testimonial: "Es tan simple e intuitivo que pusimos al equipo al día en 10 minutos.", by: "Marina, HR Manager en TalentForge" },
  { tempId: 12, testimonial: "El soporte de LocalExpertiz no tiene comparación. Siempre están cuando los necesitas.", by: "Olivia, Customer Success Manager en ClientCare" },
  { tempId: 13, testimonial: "¡La eficiencia que ganamos desde que implementamos LocalExpertiz es altísima!", by: "Raj, Operations Manager en StreamlineSolutions" },
  { tempId: 14, testimonial: "LocalExpertiz revolucionó cómo manejamos nuestro flujo de trabajo. ¡Un cambio total!", by: "Lila, Workflow Specialist en ProcessPro" },
  { tempId: 15, testimonial: "La escalabilidad de la solución de LocalExpertiz es impresionante. Crece con el negocio sin fricciones.", by: "Trevor, Scaling Officer en GrowthGurus" },
  { tempId: 16, testimonial: "Me encanta cómo LocalExpertiz innova constantemente. Siempre van un paso adelante.", by: "Naomi, Innovation Lead en FutureTech" },
  { tempId: 17, testimonial: "El ROI con LocalExpertiz es increíble. Se ha pagado solo muchas veces.", by: "Victor, Finance Analyst en ProfitPeak" },
  { tempId: 18, testimonial: "La plataforma de LocalExpertiz es robusta y a la vez fácil de usar. El balance perfecto.", by: "Yuki, Tech Lead en BalancedTech" },
  { tempId: 19, testimonial: "Probamos muchas soluciones, pero LocalExpertiz destaca en confiabilidad y rendimiento.", by: "Zoe, Performance Manager en ReliableSystems" },
];

const testimonials = RAW.map((t) => ({
  ...t,
  imgSrc: FACES[t.tempId % FACES.length],
}));

interface TestimonialCardProps {
  position: number;
  testimonial: typeof testimonials[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  testimonial,
  handleMove,
  cardSize
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter
          ? "z-10 bg-primary text-primary-foreground border-primary"
          : "z-0 bg-card text-card-foreground border-border hover:border-primary/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%)
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px hsl(var(--border))" : "0px 0px 0px 0px transparent"
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2
        }}
      />
      <img
        src={testimonial.imgSrc}
        alt={`${testimonial.by.split(',')[0]}`}
        className="mb-4 h-14 w-12 bg-muted object-cover object-top"
        style={{
          boxShadow: "3px 3px 0px hsl(var(--background))"
        }}
      />
      <h3 className={cn(
        "text-base sm:text-xl font-medium",
        isCenter ? "text-primary-foreground" : "text-foreground"
      )}>
        "{testimonial.testimonial}"
      </h3>
      <p className={cn(
        "absolute bottom-8 left-8 right-8 mt-2 text-sm italic",
        isCenter ? "text-primary-foreground/80" : "text-muted-foreground"
      )}>
        - {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-muted/30"
      style={{ height: 600 }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Testimonio anterior"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Siguiente testimonio"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
