type Props = {
  edit?: boolean
  header: { name: string }
  index: number
  deleteRow?: (index: number) => void
}
const TableRow: React.FC<Props> = ({ edit, header, index, deleteRow }) => {
  return (
    <>
      <td>
        {edit ? <input type="text" name="name" id="name" placeholder={header.name} /> : header.name}
      </td>

      {deleteRow && (
        <td>
          <button onClick={() => deleteRow(index)}>Delete</button>
        </td>
      )}
    </>
  )
}

export default TableRow
