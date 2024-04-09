import { useRef } from 'react'

type Props = {
  edit?: boolean
  header: { name: string }
}
const TableRow: React.FC<Props> = ({ edit, header }) => {
  const row = useRef([])

  return (
    <>
      <td>
        {edit ? <input type="text" name="name" id="name" placeholder={header.name} /> : header.name}
      </td>
    </>
  )
}

export default TableRow
