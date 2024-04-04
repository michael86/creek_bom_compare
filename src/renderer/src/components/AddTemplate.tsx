import { TableSchema } from '@shared/types'
import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import '../assets/add_template.css'

const AddTemplate: React.FC = () => {
  const templateName = useRef<HTMLInputElement>(null)
  const tableHeader = useRef<HTMLInputElement>(null)
  const tableColumn = useRef<HTMLInputElement>(null)
  const tableRow = useRef<HTMLInputElement>(null)
  const [tableNames, setTableNames] = useState<TableSchema[]>([])

  type OnSubmit = (e: React.FormEvent) => void
  const onSubmit: OnSubmit = async (e) => {
    e.preventDefault()
    const { current: name } = tableHeader
    const { current: col } = tableColumn
    const { current: row } = tableRow
    if (!name?.value || !col?.value || !row?.value) return

    setTableNames([...tableNames, { col: col.value, row: row.value, name: name.value }])
    col.value = ''
    row.value = ''
    name.value = ''
  }

  const onClick = async () => {
    if (!tableNames.length) {
      toast.error("Can't save an empty template")
      return
    }

    if (!templateName.current?.value) {
      toast.error('Template name required')
      return
    }

    const templateSaved = await window.context.saveTemplate(tableNames, templateName.current.value)

    if (!templateSaved) {
      toast.error('Failed to save template, contact michael')
      return
    }
    toast.success('Saved template')
    setTableNames([])
  }

  return (
    <>
      <h2 className="add-template-header">Add New Template</h2>
      <form onSubmit={onSubmit} className="add-template container">
        <div className="add-template name">
          <label htmlFor="name">Name</label>
          <input type="text" name="name" id="name" ref={templateName} />
        </div>
        <input type="text" placeholder="Enter Table Header Name" ref={tableHeader} />
        <input type="text" placeholder="Enter Column" ref={tableColumn} />
        <input type="text" placeholder="Enter Row" ref={tableRow} />

        <button type="button" onClick={onSubmit}>
          Add New Header
        </button>
      </form>
      {tableNames.length > 0 && (
        <>
          <table className="add-template table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Column</th>
                <th>Row</th>
              </tr>
            </thead>
            <tbody>
              {tableNames.map((header, index) => (
                <tr key={index}>
                  <td>{header.name}</td>
                  <td>{header.col}</td>
                  <td>{header.row}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="add-template save" onClick={onClick}>
            Save Template
          </button>
        </>
      )}
    </>
  )
}

export default AddTemplate
