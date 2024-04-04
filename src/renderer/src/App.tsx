import { useState } from 'react'

function App(): JSX.Element {
  const [dir, setDir] = useState<string | null>(null)

  const getDir = async () => {
    const dir = await window.context.getDir('template')
    setDir(dir)
    setTimeout(() => setDir(null), 1000 * 3)
  }

  return (
    <>
      {dir && <p>Directory: {dir}</p>}

      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={getDir}>
            get template directory
          </a>
        </div>
      </div>
    </>
  )
}

export default App
