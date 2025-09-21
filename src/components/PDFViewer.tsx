import React from 'react'

type Props = {
  pdf_url: string
}

const PDFViewer = ({pdf_url}: Props) => {
  return (
    <div>
      <iframe src={`https://docs.google.com/gview?url=${pdf_url}&embeded=true`} className='w-full h-full'>
      </iframe>
    </div>
  )
}

export default PDFViewer