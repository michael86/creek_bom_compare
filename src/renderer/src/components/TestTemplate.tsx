import { fetchFiles } from '@renderer/utils'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import SelectTemplate from './SelectTemplate'

const TestTemplate = () => {
  const [files, setFiles] = useState<string[] | null>(null)
  const templateRef = useRef<HTMLSelectElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    ;(async () => setFiles(await fetchFiles()))()
  }, [setFiles, fetchFiles])

  const onClick = async () => {
    if (!fileRef.current || !templateRef.current) return

    if (!fileRef.current.files) {
      toast.error('No file selected')
      return
    }

    const valid = await window.context.testTemplate(
      templateRef.current.value,
      fileRef.current.files[0].path
    )
  }

  return (
    <>
      <h2>Test files</h2>
      {files && (
        <>
          <SelectTemplate files={files} innerRef={templateRef} />
          <input
            id="test-file"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            ref={fileRef}
          />
          <button onClick={onClick}>Test</button>
        </>
      )}
    </>
  )
}

export default TestTemplate
