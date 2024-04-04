import { fetchFiles } from '@renderer/utils'
import { TableSchema } from '@shared/types'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import SelectTemplate from './SelectTemplate'
import TemplateTable from './TemplateTable'

const EditTemplate = () => {
  const [files, setFiles] = useState<string[] | null>(null)
  const [file, setFile] = useState<string | null>(null)
  const [template, setTemplate] = useState<TableSchema[] | undefined>(undefined)

  const selectRef = useRef<HTMLSelectElement | null>(null)
  const tableRef = useRef<HTMLTableElement | null>(null)

  useEffect(() => {
    ;(async () => setFiles(await fetchFiles()))()
  }, [setFiles, fetchFiles])

  const onViewTemplate = async () => {
    if (!selectRef.current || !selectRef.current.value) return
    const name = selectRef.current.value
    setFile(name)
    const table = await window.context.fetchTemplate(name)
    setTemplate(table)
  }

  const onClick = async () => {
    const handleError = () => toast.error(`Error Editing ${file}`)
    if (!files?.length || !file || !template || !tableRef.current) return

    const headers = tableRef.current.children[0].children[0].children
    const columns = tableRef.current.children[1].children

    if (!headers || !columns) {
      handleError()
      return
    }
    const saved = await window.context.saveTemplate(template, file)
    if (!saved) {
      handleError()
      return
    }

    toast.success(`${file} saved succesfully`)
  }

  return (
    <>
      <h2>Edit Template</h2>
      {files &&
        (files.length > 0 ? (
          <>
            <SelectTemplate files={files} innerRef={selectRef} />
            <button onClick={onViewTemplate}>View Template</button>

            {template && (
              <TemplateTable
                tableNames={template}
                onClick={onClick}
                edit={true}
                innerRef={tableRef}
              />
            )}
          </>
        ) : (
          <p>No Templates Fount</p>
        ))}
    </>
  )
}

export default EditTemplate
