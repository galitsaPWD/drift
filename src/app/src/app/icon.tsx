import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050505',
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <div 
          style={{ 
            width: '6px', 
            height: '6px', 
            background: '#ffffff', 
            borderRadius: '50%',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
          }} 
        />
      </div>
    ),
    { ...size }
  )
}
