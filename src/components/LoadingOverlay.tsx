interface LoadingOverlayProps {
  message?: string
}

export default function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  const spinKeyframes = `
    @keyframes loadingSpinner {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: spinKeyframes }} />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3498db',
              borderRadius: '50%',
              animation: 'loadingSpinner 1s linear infinite',
            }}
          />
          <div style={{ fontSize: '16px', color: '#333' }}>{message}</div>
        </div>
      </div>
    </>
  )
}
