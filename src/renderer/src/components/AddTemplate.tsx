import { TableSchema } from '@shared/types'
import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import '../assets/add_template.css'
import TemplateTable from './TemplateTable'
const AddTemplate: React.FC = () => {
  const templateName = useRef<HTMLInputElement>(null)
  const tableHeader = useRef<HTMLInputElement>(null)

  const [tableNames, setTableNames] = useState<TableSchema[]>([])

  type OnSubmit = (e: React.FormEvent | React.KeyboardEvent<HTMLInputElement>) => void
  const onSubmit: OnSubmit = async (e) => {
    e.preventDefault()

    if ((e as React.KeyboardEvent).key && (e as React.KeyboardEvent).key !== 'Enter') return
    const { current: name } = tableHeader

    if (!name?.value) return

    setTableNames([...tableNames, { name: name.value }])

    name.value = ''
    name.focus()
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

  const deleteRow = (index: number) => {
    tableNames.splice(index, 1)
    setTableNames(structuredClone(tableNames))
  }

  return (
    <>
      <div className="add-template-container">
        <h2 className="add-template-header">Add New Template</h2>

        <form onSubmit={onSubmit} className="add-template container">
          <div className="add-template name">
            <label htmlFor="name">Name</label>
            <input type="text" name="name" id="name" ref={templateName} />
          </div>
          <input
            type="text"
            placeholder="Enter Table Header Name"
            ref={tableHeader}
            onKeyUp={onSubmit}
          />

          <button type="button" onClick={onSubmit}>
            Add New Header
          </button>
        </form>
        {tableNames.length > 0 && (
          <>
            <TemplateTable onClick={onClick} deleteRow={deleteRow} tableNames={tableNames} />
          </>
        )}
      </div>
    </>
  )
}

export default AddTemplate
