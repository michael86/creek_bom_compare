import { TableSchema } from '@shared/types'
import TableRow from './TableRow'

type Props = {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  tableNames: TableSchema[]
  edit?: boolean
  inputRef?: React.RefObject<HTMLTableRowElement[]>
}

const TemplateTable: React.FC<Props> = ({ onClick, tableNames, edit, inputRef }) => {
  return (
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
            <tr
              key={index}
              ref={(el) => {
                if (!inputRef?.current || !el) return
                inputRef.current.push(el)
              }}
            >
              <TableRow header={header} edit={edit} />
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
