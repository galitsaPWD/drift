# DRIFT 🛰️🏙️🌑

**Infinite Spatial Navigation for the Editorial Curator.**

DRIFT is a high-fidelity web platform that transforms fashion curation from a static list into a continuous, 2D spatial experience. It is designed for those who view music and style as a single, unified "Vibe."

## 🪐 THE CORE ENGINE

### 1. Spatial Navigation (The "Drift")
Traditional carousels are linear. DRIFT is toroidal. The world of pairings maps onto an infinite 2D grid where:
- **Vertical Axis (Energy)**: Derived from the visual loudness of the outfit.
- **Horizontal Axis (Tempo)**: Derived from the speed and tempo of the curation.
- **Magnetic Auto-Snap**: A nearest-neighbor spatial resolver that perfectly anchors your view to the heart of every pairing.

### 2. Aesthetic Intelligence
The **Capture Console** uses heuristic image scanning to analyze the chromatic and luminance properties of a silhouette. It suggests an initial spatial coordinate (Energy/Tempo) which the curator then refines.

### 3. Editorial proof
Every commit to the stack generates a high-contrast **Share Card**. These cards feature a massive ghost index, rotated Lookbook rails, and horizontal pairing layouts, perfect for social proof of high-end taste.

## 🛠️ TECH STACK

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Audio Engine**: Spotify Web API + Deezer ISRC Fallback
- **Animations**: Framer Motion
- **Style**: Vanilla CSS + Tailwind (Luxury Minimalist)

## 🏗️ ARCHITECTURE

- `/src/components/DriftCanvas`: The spatial resolver and infinite grid engine.
- `/src/lib/useDrift`: The custom hook for toroidal movement and swipe detection.
- `/src/lib/canvas`: The editorial export engine for pairing cards.

---

*“Drift through the noise. Find the vibe.”*
