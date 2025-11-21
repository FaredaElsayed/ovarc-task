import React from 'react'
import Searchbar from './Searchbar'

const Header = ({
  addNew,
  title = 'List',
  buttonTitle,
  buttonDisabled = false,
  buttonHint,
}) => {
  const handleAddNew = () => {
    if (buttonDisabled || typeof addNew !== 'function') return
    addNew()
  }

  const computedTitle = buttonTitle || `Add New ${title.split(' ')[0] || 'Item'}`

  return (
    <div className='flex justify-between items-center flex-wrap gap-4'>
      <div className='flex items-center gap-2'>
        <h1 className='text-lg'>{title}</h1>
        <Searchbar />
      </div>
      <button
        className={`rounded px-4 py-2 text-sm font-medium ${
          buttonDisabled
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-main text-white'
        }`}
        onClick={handleAddNew}
        disabled={buttonDisabled}
        title={buttonDisabled ? buttonHint : undefined}
      >
        {computedTitle}
      </button>
    </div>
  )
}

export default Header
