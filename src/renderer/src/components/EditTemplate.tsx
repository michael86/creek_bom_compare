import { fetchFiles } from '@renderer/utils'
import { TableSchema } from '@shared/types'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import '../assets/edit_template.css'
import infoImage from '../assets/icons8-info-48.png'
import SelectTemplate from './SelectTemplate'
import TemplateTable from './TemplateTable'

const EditTemplate = () => {
  const [files, setFiles] = useState<string[] | null>(null)
  const [file, setFile] = useState<string | null>(null)

  const [template, setTemplate] = useState<TableSchema[] | undefined>(undefined)
  const [showInfo, setShowInfo] = useState<boolean>(false)

  const selectRef = useRef<HTMLSelectElement | null>(null)
  const inputRef = useRef<HTMLTableRowElement[]>([])

  useEffect(() => {
    ;(async () => setFiles(await fetchFiles()))()
  }, [setFiles, fetchFiles])

  const onViewTemplate = async (spread = false) => {
    if (!selectRef.current || !selectRef.current.value) return
    const name = selectRef.current.value
    setFile(name)
    const table = await window.context.fetchTemplate(name)
    setTemplate(spread ? structuredClone(table) : table)
  }

  const onClick = async () => {
    if (!files?.length || !file || !template || !inputRef.current) {
      return
    }

    // Map table rows and extract data from inputs
    const tableRows = inputRef.current.map((td) => [...td.children])

    const data = tableRows.map((td) =>
      td.map((t) =>
        [...t.children]
          .map(
            (input) => (input as HTMLInputElement).value || (input as HTMLInputElement).placeholder
          )
          .join()
      )
    )

    // Convert data to new template format
    const newTemplate = data.map((entry) => ({ name: entry[0], col: entry[1], row: entry[2] }))

    // Check if new template is empty
    if (!newTemplate.length) {
      toast.error(`Error Editing ${file}`)
      return
    }

    // Save the new template
    const saved = await window.context.saveTemplate(newTemplate, file)

    // Show success or error message
    if (saved) {
      toast.success(`${file} saved successfully`)
      onViewTemplate(true)
    } else {
      toast.error(`Error Editing ${file}`)
    }
    inputRef.current = []
  }

  const onMouseEnter = () => setShowInfo(true)
  const onMouseLeave = () => setShowInfo(false)

  return (
    <div className="edit-template-container">
      <div className="edit-template-header">
        <h2>Edit Template</h2>
        <img src={infoImage} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
      </div>
      {files &&
        (files.length > 0 ? (
          <>
            <SelectTemplate files={files} innerRef={selectRef} />
            <button onClick={() => onViewTemplate()}>View Template</button>

            {showInfo && (
              <>
                <p>To edit a template, simply change the field required</p>
                <p>any fields you don't want to change can be left as they are</p>
              </>
            )}

            {template && (
              <TemplateTable
                tableNames={template}
                onClick={onClick}
                edit={true}
                inputRef={inputRef}
              />
            )}
          </>
        ) : (
          <p>No Templates Fount</p>
        ))}
    </div>
  )
}

export default EditTemplate
