import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import '../assets/how_to.css'
import pdf from '../assets/how_to.pdf'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

const HowTo = () => {
  const [numPages, setNumPages] = useState<number>()
  const [pageNumber, setPageNumber] = useState<number>(1)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages)
  }

  return (
    <div className="how-to-container">
      <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}>
        {[...Array(numPages).keys()].map((i) => {
          return <Page pageNumber={i + 1} />
        })}
      </Document>
    </div>
  )
}

export default HowTo
