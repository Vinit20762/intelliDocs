import React from 'react'

type Props = {
  pdf_url: string
}

const PDFViewer = ({pdf_url}: Props) => {
  return (
    <div>
      <iframe
        src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}
        className="w-full h-full"
        style={{ minHeight: "100vh" }}
      />

    </div>
  )
}

export default PDFViewer