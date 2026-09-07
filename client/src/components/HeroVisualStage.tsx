import React from "react";
import { useNavigate } from "react-router-dom";

export const HeroVisualStage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-[490px] sm:h-[540px] lg:h-[580px] xl:h-[620px] flex items-center justify-center select-none mt-2 lg:-mt-6 xl:-mt-10">

      {/* Orange Glow Behind Student (Centered around upper body/head) */}
      <div className="absolute -top-[2%] sm:-top-[3%] lg:-top-[4%] -right-1 sm:-right-2 lg:-right-4 xl:-right-6 w-[330px] sm:w-[400px] lg:w-[460px] xl:w-[500px] aspect-[1334/1179] pointer-events-none z-0">
        <img
          src="/hero/glow.png"
          alt=""
          className="w-full h-full object-contain opacity-95 animate-pulse"
          style={{ animationDuration: "5s" }}
        />
      </div>


      {/* Student Cutout in Foreground */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 xl:bottom-10 -right-3 sm:-right-4 lg:-right-8 xl:-right-10 h-[400px] sm:h-[470px] lg:h-[525px] xl:h-[565px] z-20 pointer-events-none flex items-end">
        <img
          src="/hero/student.png"
          alt="Job seeker discovering opportunities"
          className="h-full w-auto object-contain object-bottom drop-shadow-[0_25px_45px_rgba(0,0,0,0.85)]"
        />
      </div>

      {/* Floating Job Card 1: Notion (Top Left - Behind Student) */}
      <button
        type="button"
        onClick={() => navigate("/explore?search=Notion")}
        aria-label="View Notion jobs"
        className="absolute top-[2%] sm:top-[2%] lg:top-[2%] xl:top-[3%] -left-[14%] sm:-left-[22%] md:-left-[28%] lg:-left-[35%] xl:-left-[32%] w-[245px] sm:w-[285px] lg:w-[325px] xl:w-[350px] z-[7] cursor-pointer transition-all duration-300 hover:scale-105 hover:z-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
        style={{
          transform: "rotate(-3.8deg)",
          filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.75))"
        }}
        title="View Notion jobs"
      >
        <img
          src="/hero/notion-job-card.png"
          alt="Notion Backend Developer Job Card"
          className="w-full h-auto object-contain pointer-events-none"
        />
      </button>

      {/* Floating Job Card 2: Slack (Middle - Behind Student) */}
      <button
        type="button"
        onClick={() => navigate("/explore?search=Slack")}
        aria-label="View Slack jobs"
        className="absolute top-[23%] sm:top-[23%] lg:top-[23%] xl:top-[24%] -left-[10%] sm:-left-[18%] md:-left-[22%] lg:-left-[29%] xl:-left-[26%] w-[245px] sm:w-[285px] lg:w-[325px] xl:w-[350px] z-[5] cursor-pointer transition-all duration-300 hover:scale-105 hover:z-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
        style={{
          transform: "rotate(2deg)",
          filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.85))"
        }}
        title="View Slack jobs"
      >
        <img
          src="/hero/slack-job-card.png"
          alt="Slack Software Engineer Job Card"
          className="w-full h-auto object-contain pointer-events-none"
        />
      </button>

      {/* Floating Job Card 3: Spotify (Bottom - Behind Student) */}
      <button
        type="button"
        onClick={() => navigate("/explore?search=Spotify")}
        aria-label="View Spotify jobs"
        className="absolute top-[44%] sm:top-[44%] lg:top-[44%] xl:top-[45%] -left-[12%] sm:-left-[20%] md:-left-[25%] lg:-left-[32%] xl:-left-[29%] w-[245px] sm:w-[285px] lg:w-[325px] xl:w-[350px] z-[6] cursor-pointer transition-all duration-300 hover:scale-105 hover:z-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
        style={{
          transform: "rotate(-1.8deg)",
          filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.9))"
        }}
        title="View Spotify jobs"
      >
        <img
          src="/hero/spotiy-job-card.png"
          alt="Spotify Product Engineer Job Card"
          className="w-full h-auto object-contain pointer-events-none"
        />
      </button>

      {/* Editorial Annotation: Top Right */}
      <div className="absolute -top-[1%] sm:-top-[2%] lg:-top-[3%] right-[2%] sm:right-[3%] lg:right-[1%] z-20 pointer-events-none text-amber-200/85 font-caveat text-base sm:text-lg lg:text-xl leading-tight rotate-[6deg] text-right hidden sm:block">
        <p>Real companies.</p>
        <p>Meaningful work.</p>
        <p className="text-amber-100">A brighter you.</p>
        <svg className="w-7 h-7 sm:w-9 sm:h-9 ml-auto mt-1 stroke-amber-200/80 fill-none" viewBox="0 0 40 40">
          <path d="M 30 5 Q 12 14 8 32" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 4 24 L 8 32 L 16 28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>



      {/* Editorial Annotation: Bottom Center */}
      <div className="absolute bottom-[6%] sm:bottom-[8%] lg:bottom-[9%] left-[2%] sm:left-0 md:-left-[2%] lg:-left-[8%] xl:-left-[5%] z-30 pointer-events-none text-amber-200/85 font-caveat text-sm sm:text-base lg:text-lg rotate-[-6deg] text-center hidden sm:block">
        <svg className="w-6 h-6 mx-auto stroke-amber-200/80 fill-none mb-0.5" viewBox="0 0 30 30">
          <path d="M 8 22 Q 18 16 24 6" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 14 6 L 24 6 L 24 16" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="whitespace-nowrap">New opportunities</p>
        <p className="text-amber-100 whitespace-nowrap">every day.</p>
      </div>

      {/* Editorial Annotation: Bottom Right */}
      <div
        className="absolute bottom-[4%] sm:bottom-[5%] lg:bottom-[6%] -right-4 sm:-right-6 lg:-right-10 xl:-right-14 z-30 pointer-events-none text-amber-200/90 font-caveat text-base sm:text-lg lg:text-xl rotate-[-3deg] text-right hidden sm:block"
        style={{ zIndex: 30 }}
      >
        <p className="whitespace-nowrap">Same skills.</p>
        <p className="text-amber-100 whitespace-nowrap">Bigger possibilities.</p>
        <svg className="w-24 sm:w-28 h-2.5 ml-auto stroke-[#FF5500] fill-none mt-1" viewBox="0 0 120 12">
          <path d="M 5 6 Q 60 11 115 4" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Layer 1: Abstract Orange Wave Mesh (Compact corner accent flush against right wall) */}
      <div
        className="absolute bottom-0 -right-14 sm:-right-20 lg:-right-36 xl:-right-48 w-[280px] sm:w-[330px] lg:w-[380px] xl:w-[420px] pointer-events-none z-[25]"
        style={{ zIndex: 25, opacity: 0.7 }}
      >
        <img
          src="/hero/layer1.png"
          alt=""
          className="w-full h-auto object-contain object-bottom-right"
        />
      </div>

    </div>
  );
};
