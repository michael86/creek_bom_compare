import { fetchFiles } from '@renderer/utils'
import { TableSchema } from '@shared/types'
import { useEffect, useRef, useState } from 'react'
import SelectTemplate from './SelectTemplate'
import TemplateTable from './TemplateTable'

const EditTemplate = () => {
  const [files, setFiles] = useState<string[] | null>(null)
  const selectRef = useRef<HTMLSelectElement | null>(null)
  const [template, setTemplate] = useState<TableSchema[] | undefined>(undefined)
  useEffect(() => {
    ;(async () => setFiles(await fetchFiles()))()
  })

  const onViewTemplate = async () => {
    if (!selectRef.current || !selectRef.current.value) return
    const file = selectRef.current.value
    const table = await window.context.fetchTemplate(file)
    setTemplate(table)
  }

  const onClick = (e) => {
    console.log(e)
  }

  return (
    <>
      <h2>Edit Template</h2>
      {files &&
        (files.length > 0 ? (
          <>
            <SelectTemplate files={files} innerRef={selectRef} />
            <button onClick={onViewTemplate}>View Template</button>

            {template && <TemplateTable tableNames={template} onClick={onClick} edit={true} />}
          </>
        ) : (
          <p>No Templates Fount</p>
        ))}
    </>
  )
}

export default EditTemplate
