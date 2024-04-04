import { TableSchema } from '@shared/types'

type Props = {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  tableNames: TableSchema[]
  edit?: boolean
}
const TemplateTable: React.FC<Props> = ({ onClick, tableNames, edit = false }) => {
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
            <tr key={index}>
              <td>
                {edit ? (
                  <input type="text" name="name" id="name" placeholder={header.name} />
                ) : (
                  header.name
                )}
              </td>
              <td>
                {edit ? (
                  <input type="text" name="col" id="col" placeholder={header.col} />
                ) : (
                  header.col
                )}
              </td>
              <td>
                {edit ? (
                  <input type="text" name="row" id="row" placeholder={header.row} />
                ) : (
                  header.row
                )}
              </td>
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
