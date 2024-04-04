import { TableSchema } from '@shared/types'

type Props = { onClick: React.MouseEventHandler<HTMLButtonElement>; tableNames: TableSchema[] }
const TemplateTable: React.FC<Props> = ({ onClick, tableNames }) => {
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
  )
}

export default TemplateTable
