import { fetchFiles } from '@renderer/utils'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import SelectTemplate from './SelectTemplate'

const DeleteTemplate = () => {
  const [files, setFiles] = useState<string[] | null>(null)
  const select = useRef<HTMLSelectElement | null>(null)

  useEffect(() => {
    ;(async () => {
      const files = await fetchFiles()
      setFiles(files)
    })()
  }, [fetchFiles])

  const onClick = async () => {
    console.log('select.current', select.current)
    console.log('files', files)
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
          {files.length > 0 ? (
            <>
              <SelectTemplate innerRef={select} files={files} />
              <button onClick={onClick}>Delete Template</button>
            </>
          ) : (
            <p>No Templates</p>
          )}
        </>
      )}
    </>
  )
}

export default DeleteTemplate
