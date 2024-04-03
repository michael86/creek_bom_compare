import React, { Dispatch, MouseEventHandler, SetStateAction, useState } from "react";
import "./App.css";
import "./styles/header.css";
import AddTemplate from "./components/AddTemplate";

export const App: React.FC = () => {
  const [hide, setHide] = useState(true);
  const [scene, setScene] = useState(1);
  return (
    <>
      <header className="header">
        <nav>
          <ul className="template-nav">
            <li
              className="parent-nav-item"
              onMouseEnter={() => setHide(false)}
              onMouseLeave={() => setHide(true)}
            >
              Templates
              <ul className={`child-nav${hide ? " hide" : ""}`}>
                <li className="cursor" onClick={() => setScene(1)}>
                  add template
                </li>
                <li className="cursor" onClick={() => setScene(2)}>
                  view template
                </li>
                <li className="cursor" onClick={() => setScene(3)}>
                  edit template
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        {scene === 0 && <p>Home</p>}
        {scene === 1 && <AddTemplate />}
      </main>
    </>
  );
};
