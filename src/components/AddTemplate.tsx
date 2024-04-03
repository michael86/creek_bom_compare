import React, { useRef, useState } from "react";
import { OnSubmit, TableSchema } from "../types/AddTemplate";
import { ipcRenderer } from "electron";

const AddTemplate: React.FC = () => {
  const templateName = useRef<HTMLInputElement>(null);
  const tableHeader = useRef<HTMLInputElement>(null);
  const tableColumn = useRef<HTMLInputElement>(null);
  const tableRow = useRef<HTMLInputElement>(null);
  const [tableNames, setTableNames] = useState<TableSchema[]>([]);

  const onSubmit: OnSubmit = (e) => {
    e.preventDefault();
  };

  const addTableName: OnSubmit = (e) => {
    e.preventDefault();
    const { current: name } = tableHeader;
    const { current: col } = tableColumn;
    const { current: row } = tableRow;
    if (!name?.value || !col?.value || !row?.value) return;

    setTableNames([...tableNames, { col: col.value, row: row.value, name: name.value }]);
    col.value = "";
    row.value = "";
    name.value = "";

    ipcRenderer.invoke("saveTemplate", [tableNames, ""]);
  };

  return (
    <>
      <h2>Add New Template</h2>
      <form onSubmit={onSubmit} className="flex col width-50">
        <div>
          <label htmlFor="name">Name</label>
          <input type="text" name="name" id="name" ref={templateName} />
        </div>
        <input
          className="mt-1"
          type="text"
          placeholder="Enter Table Header Name"
          ref={tableHeader}
        />
        <input type="text" placeholder="Enter Column" ref={tableColumn} />
        <input type="text" placeholder="Enter Row" ref={tableRow} />

        <button type="button" onClick={addTableName}>
          Add New Header
        </button>
      </form>
      <table>
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
    </>
  );
};

export default AddTemplate;
