import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import AddTemplate from './components/AddTemplate'
import CompareBoms from './components/CompareBoms'
import DeleteTemplate from './components/DeleteTemplate'
import EditTemplate from './components/EditTemplate'
import Home from './components/Home'
import Nav from './components/Nav'
import ViewBoms from './components/ViewBoms'

function App(): JSX.Element {
  const [scene, setScene] = useState(1)
  // const [dir, setDir] = useState<string | null>(null)

  // const getDir = async () => {
  //   const dir = await window.context.getDir('template')
  //   setDir(dir)
  //   setTimeout(() => setDir(null), 1000 * 3)
  // }

  return (
    <>
      <ToastContainer />
      <Nav setScene={setScene} />
      <main>
        {scene === 0 && <Home />}
        {scene === 1 && <AddTemplate />}
        {scene === 2 && <DeleteTemplate />}
        {scene === 3 && <EditTemplate />}
        {scene === 4 && <CompareBoms />}
        {scene === 5 && <ViewBoms />}
      </main>
    </>
  )
}

export default App
