import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

const DeleteTemplate = () => {
  const [files, setFiles] = useState<string[] | null>(null)
  const select = useRef<HTMLSelectElement | null>(null)
  useEffect(() => {
    const fetchTemplates = async () => setFiles(await window.context.fetchTemplate())
    fetchTemplates()
  }, [])

  const onClick = async () => {
    if (!select.current || !files) return

    const target = select.current.value
    const deleted = await window.context.deleteTemplate(target)
    if (!deleted) {
      toast.error(`Failed to delete ${target}`)
      return
    }

    setFiles(files.filter((file) => file !== target))
    toast.success(`${target} deleted`)
  }

  return (
    <>
      <h2>Delete Template</h2>
      {files && (
        <>
          <select name="templates" id="templates" ref={select}>
            {files.map((file) => {
              return (
                <option value={file} key={file}>
                  {file}
                </option>
              )
            })}
          </select>
          <button onClick={onClick}>Delete Template</button>
        </>
      )}
    </>
  )
}

export default DeleteTemplate
