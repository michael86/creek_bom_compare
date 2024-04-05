import { useRef } from 'react'

type Props = {
  edit?: boolean
  header: { row: string; col: string; name: string }
}
const TableRow: React.FC<Props> = ({ edit, header }) => {
  const row = useRef([])

  return (
    <>
      <td>
        {edit ? <input type="text" name="name" id="name" placeholder={header.name} /> : header.name}
      </td>
      <td>
        {edit ? <input type="text" name="col" id="col" placeholder={header.col} /> : header.col}
      </td>
      <td>
        {edit ? <input type="text" name="row" id="row" placeholder={header.row} /> : header.row}
      </td>
    </>
  )
}

export default TableRow
