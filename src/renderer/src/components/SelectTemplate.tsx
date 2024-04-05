import React from 'react'

type Props = { innerRef?: React.RefObject<HTMLSelectElement>; files: string[] }
const SelectTemplate: React.FC<Props> = ({ innerRef, files }) => {
  return (
    <select name="templates" id="templates" ref={innerRef}>
      {files.map((file) => {
        return (
          <option value={file} key={file}>
            {file}
          </option>
        )
      })}
    </select>
  )
}

export default SelectTemplate
