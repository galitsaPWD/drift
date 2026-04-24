import { Pairing } from "@/lib/data";

interface MinimapProps {
  px: number;
  py: number;
  pairings: Pairing[];
}

export function Minimap({ px, py, pairings }: MinimapProps) {

  return (
    <div className="absolute bottom-6 right-6 lg:bottom-12 lg:right-12 w-[54px] h-[54px] border border-white/5 bg-transparent pointer-events-none z-40 overflow-hidden">
      {/* Background Dots */}
      <div className="absolute inset-0">
        {pairings.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: "1.5px",
              height: "1.5px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              left: `${p.tempo * 100}%`,
              bottom: `${p.energy * 100}%`,
              transform: "translate(-50%, 50%)",
            }}
          />
        ))}
      </div>

      {/* User Indicator */}
      <div
        className="absolute rounded-full bg-white transition-all duration-200"
        style={{
          width: "4px",
          height: "4px",
          left: `${px * 100}%`,
          bottom: `${py * 100}%`,
          transform: "translate(-50%, 50%)",
        }}
      />
    </div>
  );
}
