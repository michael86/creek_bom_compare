import { TableSchema } from '@shared/types'
import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import '../assets/add_template.css'
import infoImage from '../assets/icons8-info-48.png'
import AddTemplateInfo from './AddTemplateInfo'
import TemplateTable from './TemplateTable'

const AddTemplate: React.FC = () => {
  const templateName = useRef<HTMLInputElement>(null)
  const tableHeader = useRef<HTMLInputElement>(null)
  const tableColumn = useRef<HTMLInputElement>(null)
  const tableRow = useRef<HTMLInputElement>(null)
  const [tableNames, setTableNames] = useState<TableSchema[]>([])
  const [showInfo, setShowInfo] = useState<boolean>(false)

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

  const onMouseEnter = () => setShowInfo(true)
  const onMouseLeave = () => setShowInfo(false)

  return (
    <>
      <div className="add-template-container">
        <div className="add-template-header-container">
          <h2 className="add-template-header">Add New Template</h2>
          <img src={infoImage} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
        </div>
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
            <TemplateTable onClick={onClick} tableNames={tableNames} />
          </>
        )}
        {showInfo && <AddTemplateInfo />}
      </div>
    </>
  )
}

export default AddTemplate
