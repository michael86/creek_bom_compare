import { fetchFiles } from '@renderer/utils'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import infoImage from '../assets/icons8-info-48.png'
import '../assets/test_template.css'
import SelectTemplate from './SelectTemplate'

const TestTemplate = () => {
  const [files, setFiles] = useState<string[] | null>(null)
  const templateRef = useRef<HTMLSelectElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const autoFind = useRef<HTMLInputElement | null>(null)

  const [showInfo, setShowInfo] = useState<boolean>()

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

  const onMouseEnter = () => setShowInfo(true)
  const onMouseLeave = () => setShowInfo(false)

  return (
    <div className="test-template-container">
      <div className="test-template-header">
        <h2>Test files</h2>
        <img src={infoImage} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
      </div>
      {files && (
        <>
          <div>
            <SelectTemplate files={files} innerRef={templateRef} />
          </div>

          <input
            id="test-file"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            ref={fileRef}
          />

          <label htmlFor="auto-find">Auto find table</label>
          <input type="checkbox" name="auto-find" id="auto-find" ref={autoFind} />

          <button onClick={onClick}>Test</button>
        </>
      )}
      {showInfo && (
        <>
          <p>This is to ensure your templates find the table in the selected template.</p>
          <p>To use, select the template required, and the file you want to test</p>
          <p>Click test, and await the results</p>
          <p>
            If the test fails, try enabling <span>auto find</span>. This will attempt to
            automatically find the table headings. If succesful, it will automatically update the
            table locations in the file.
          </p>
          <p>This helps when boms have a revision and the table row has changed</p>
        </>
      )}
    </div>
  )
}

export default TestTemplate
