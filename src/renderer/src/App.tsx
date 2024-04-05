import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import AddTemplate from './components/AddTemplate'
import CompareBoms from './components/CompareBoms'
import DeleteTemplate from './components/DeleteTemplate'
import EditTemplate from './components/EditTemplate'
import Home from './components/Home'
import Nav from './components/Nav'
import TestTemplate from './components/TestTemplate'
import ViewBoms from './components/ViewBoms'

function App(): JSX.Element {
  const [scene, setScene] = useState(1)

  return (
    <>
      <ToastContainer />
      <Nav setScene={setScene} />
      <main>
        {scene === 0 && <Home />}
        {scene === 1 && <AddTemplate />}
        {scene === 2 && <DeleteTemplate />}
        {scene === 3 && <EditTemplate />}
        {scene === 4 && <TestTemplate />}
        {scene === 5 && <CompareBoms />}
        {scene === 6 && <ViewBoms />}
      </main>
    </>
  )
}

export default App
