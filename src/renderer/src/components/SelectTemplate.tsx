import React from 'react'

type Props = { innerRef?: React.RefObject<HTMLSelectElement>; files: string[] }
const SelectTemplate: React.FC<Props> = ({ innerRef, files }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
      <p style={{ marginRight: '0.5rem' }}>Select template</p>
      <select name="templates" id="templates" ref={innerRef}>
        {files.map((file) => {
          return (
            <option value={file} key={file}>
              {file}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default SelectTemplate
