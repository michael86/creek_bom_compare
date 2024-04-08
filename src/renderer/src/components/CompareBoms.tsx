import { fetchFiles } from '@renderer/utils'
import { useEffect, useRef, useState } from 'react'
import '../assets/compare_boms.css'
import SelectTemplate from './SelectTemplate'

const CompareBoms = () => {
  const fileRefs = useRef<Array<HTMLInputElement | null>>([null, null])
  const [files, setFiles] = useState<string[] | null>(null)
  const selectRef = useRef<HTMLSelectElement | null>(null)

  //look up currying
  const setRef = (index: number) => (el: HTMLInputElement | null) => {
    fileRefs.current[index] = el
  }

  useEffect(() => {
    ;(async () => {
      const files = await fetchFiles()
      setFiles(files)
    })()
  }, [fetchFiles])

  const onClick = () => {
    if (
      !fileRefs.current[0]?.files ||
      !fileRefs.current[0]?.files[0].path ||
      !fileRefs.current[1]?.files ||
      !fileRefs.current[1]?.files[0].path ||
      !selectRef.current?.value
    )
      return

    const firstFile = fileRefs.current[0].files[0].path
    const secondFile = fileRefs.current[1].files[0].path
    const template = selectRef.current.value
    window.context.compareBoms(firstFile, secondFile, template)
  }

  return (
    <div className="compare-boms-container">
      <h2>Compare Boms</h2>
      {files ? <SelectTemplate files={files} innerRef={selectRef} /> : <p>No templates found</p>}

      <div className="input-container">
        <div>
          <label htmlFor="test-file-1">First file</label>
          <input
            id="test-file-1"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            ref={setRef(0)}
          />
        </div>
        <div>
          <label htmlFor="test-file-1">Second file</label>
          <input
            id="test-file-2"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            ref={setRef(1)}
          />
        </div>
      </div>

      <button onClick={onClick}>Compare boms</button>

      <div className="output-container"></div>
    </div>
  )
}

//for each table find where table starts (row/col)
// iterate both tables and check if each cell = x === x
// create spreadsheet with tables and highlight

export default CompareBoms
