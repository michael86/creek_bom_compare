import { fetchFiles } from '@renderer/utils'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import SelectTemplate from './SelectTemplate'

const TestTemplate = () => {
  const [files, setFiles] = useState<string[] | null>(null)
  const templateRef = useRef<HTMLSelectElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const autoFind = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    ;(async () => setFiles(await fetchFiles()))()
  }, [setFiles, fetchFiles])

  const onClick = async () => {
    if (!fileRef.current || !templateRef.current || !autoFind.current) return

    if (!fileRef.current.files) {
      toast.error('No file selected')
      return
    }

    const valid = await window.context.testTemplate(
      templateRef.current.value,
      fileRef.current.files[0].path,
      autoFind.current.checked
    )

    if (!valid) {
      toast.error('Failed to find table')
      return
    }

    toast.success('test passed')
  }

  useEffect(() => {
    window.context.onTestTemplateResult(async (data) => {
      if (!templateRef.current?.value) {
        toast.error('Table found, but failed to save. You probably want to contact Michael.')
        return
      }

      const file = templateRef.current.value
      const fileUpdated = await window.context.saveTemplate(data, file)
      if (!fileUpdated) {
        toast.error('Table found, but failed to save. You probably want to contact Michael.')
        return
      }

      toast.success(`File ${file} auto updated`)
    })
    return () => window.context.onRemoveTestTemplate()
  }, [])

  return (
    <>
      <h2>Test files</h2>
      {files && (
        <>
          <div>
            <SelectTemplate files={files} innerRef={templateRef} />
          </div>
          <div>
            <input
              id="test-file"
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              ref={fileRef}
            />
          </div>
          <div>
            <label htmlFor="auto-find">Auto find table</label>
            <input type="checkbox" name="auto-find" id="auto-find" ref={autoFind} />
            <div>
              <small>
                Enabling this will attempt to find the table if the selected template fails
              </small>
            </div>
          </div>
          <button onClick={onClick}>Test</button>
        </>
      )}
    </>
  )
}

export default TestTemplate
