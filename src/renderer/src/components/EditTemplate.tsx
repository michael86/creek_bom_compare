import { fetchFiles } from '@renderer/utils'
import { useEffect, useRef, useState } from 'react'
import SelectTemplate from './SelectTemplate'

const EditTemplate = () => {
  const [files, setFiles] = useState<string[] | null>(null)
  const selectRef = useRef<HTMLSelectElement | null>(null)
  useEffect(() => {
    ;(async () => setFiles(await fetchFiles()))()
  })

  const onViewTemplate = async () => {
    if (!selectRef.current || !selectRef.current.value) return
    const file = selectRef.current.value
    const table = await window.context.fetchTemplateNames(file)
  }

  return (
    <>
      <h2>Edit Template</h2>
      {files &&
        (files.length > 0 ? (
          <>
            <SelectTemplate files={files} innerRef={selectRef} />
            <button onClick={onViewTemplate}>View Template</button>

            {/* <TemplateTable tableNames={tableNames}/> */}
          </>
        ) : (
          <p>No Templates Fount</p>
        ))}
    </>
  )
}

export default EditTemplate
