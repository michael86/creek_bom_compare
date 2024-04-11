import { TableSchema } from '@shared/types'
import TableRow from './TableRow'

type Props = {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  tableNames: TableSchema[]
  edit?: boolean
  inputRef?: React.RefObject<HTMLTableRowElement[]>
  deleteRow?: (index: number) => void
}

const TemplateTable: React.FC<Props> = ({ onClick, tableNames, edit, inputRef, deleteRow }) => {
  return (
    <>
      <table className="add-template table">
        <thead>
          <tr>
            <th>Name</th>
            {deleteRow && <th>delete</th>}
          </tr>
        </thead>
        <tbody>
          {tableNames.map((header, index) => (
            <tr
              key={index}
              ref={(el) => {
                if (!inputRef?.current || !el) return
                inputRef.current.push(el)
              }}
            >
              <TableRow header={header} edit={edit} index={index} deleteRow={deleteRow} />
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-template save" onClick={onClick}>
        Save Template
      </button>
    </>
  )
}

export default TemplateTable
