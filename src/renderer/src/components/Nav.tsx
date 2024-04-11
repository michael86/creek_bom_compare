import { NavItems } from '@shared/types'
import { Dispatch, SetStateAction, useState } from 'react'
import '../assets/nav.css'

type Props = { setScene: Dispatch<SetStateAction<number>> }

const Nav: React.FC<Props> = ({ setScene }) => {
  const [show, setShow] = useState({ templates: false, boms: false })

  const onMouseEnter = (targ: NavItems) => {
    if (!show[targ]) {
      setShow((prevShow) => ({ ...prevShow, [targ]: true }))
    }
  }

  const onMouseLeave = (targ: NavItems) => {
    if (show[targ]) {
      setShow((prevShow) => ({ ...prevShow, [targ]: false }))
    }
  }

  return (
    <header>
      <nav>
        <ul className="nav-items">
          <li onClick={() => setScene(0)}>Home</li>
          <li
            onMouseEnter={() => onMouseEnter('templates')}
            onMouseLeave={() => onMouseLeave('templates')}
          >
            <p>Templates</p>

            <ul className={`nav-child ${show.templates ? ' show' : ''}`}>
              <li onClick={() => setScene(1)}>Add</li>
              <li onClick={() => setScene(2)}>Delete</li>
              <li onClick={() => setScene(3)}>Edit</li>
              <li onClick={() => setScene(4)}>test</li>
            </ul>
          </li>
          <li onMouseEnter={() => onMouseEnter('boms')} onMouseLeave={() => onMouseLeave('boms')}>
            <p>Boms</p>
            <ul className={`nav-child ${show.boms ? ' show' : ''}`}>
              <li onClick={() => setScene(5)}>Compare</li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Nav
