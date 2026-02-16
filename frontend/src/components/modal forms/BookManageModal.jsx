import React, { useEffect, useRef, useState } from 'react'
import api from '../../api/axios';
import { sanitizeInput } from '../../utils/sanitizeInput'
import CannotReduceCopies from '../pop-up modals/CannotReduceCopies'

function BookManageModal({ isModalOpen, onClose, mode = 'add', setBooks, bookToEdit = null}) {  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    copies: '',
    author: '',
    publishDate: '',
    borrowLimit: 3,
    returnDays: 5
  })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const firstInputRef = useRef(null)
  const [showCannotDeleteModal, setShowCannotDeleteModal] = useState(false)

  useEffect(() => {
    if (isModalOpen) {
      if (mode === 'edit' && bookToEdit) {
        // Pre-fill form with book data for editing
        setFormData({
          title: bookToEdit.title || '',
          genre: bookToEdit.genre || '',
          copies: bookToEdit.total_copies || '',
          author: bookToEdit.author || '',
          publishDate: bookToEdit.published_date ? convertDateForInput(bookToEdit.published_date) : '',
          borrowLimit: bookToEdit.borrow_limit || 3,
          returnDays: bookToEdit.return_days || 5
        })
      } else {
        // Clear form for adding new book
        setFormData({ title: '', genre: '', copies: '', author: '', publishDate: '', borrowLimit: 3, returnDays: 5 })
      }
      setErrors({})
      setTimeout(() => firstInputRef.current?.focus(), 0)
    }
  }, [isModalOpen, mode, bookToEdit])

  // Helper function to convert date from "Mon dd YYYY" to "YYYY-MM-DD" format
  const convertDateForInput = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return '';
    } catch (e) {
      return '';
    }
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isModalOpen) onClose?.()
    }
    if (isModalOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isModalOpen, onClose])
  const handleChange = (e) => {
    const { name, value } = e.target

    // Don't sanitize date fields or numeric fields as it breaks the format
    const sanitizedValue = (name === 'publishDate' || name === 'copies' || name === 'borrowLimit' || name === 'returnDays') 
      ? value 
      : (typeof value === 'string' ? sanitizeInput(value) : value);
    
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }))
  }

  const validate = () => {
    const err = {}
    if (!formData.title.trim()) err.title = 'Title is required'
    if (!formData.author.trim()) err.author = 'Author is required'
    if (!formData.genre.trim()) err.genre = 'Genre is required'
    if (!formData.publishDate.trim()) err.publishDate = 'Publish date is required'
    if (!formData.copies || parseInt(formData.copies) < 1) err.copies = 'Number of copies must be at least 1'
    if (!formData.borrowLimit || parseInt(formData.borrowLimit) < 1) err.borrowLimit = 'Borrow limit must be at least 1'
    if (!formData.returnDays || parseInt(formData.returnDays) < 1) err.returnDays = 'Return days must be at least 1'
    return err
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) {
      setErrors(v)
      return
    }
    setIsSaving(true)
    try {
      if (mode === 'add') {
        const response = await api.post('/books', formData);
        console.log('Book added successfully')
        console.log(response.data)

        // The backend returns { message: "Book added successfully", data: bookObject }
        setBooks((prevBooks) => [...prevBooks, response.data.data]);
      } else if (mode === 'edit') {
        const response = await api.put(`/books/${bookToEdit.book_id}`, formData);
        console.log('Book updated successfully')
        console.log(response.data)

        // Update the book in the list
        setBooks((prevBooks) => 
          prevBooks.map(book => 
            book.book_id === bookToEdit.book_id ? response.data.data : book
          )
        );
      }
      onClose?.()
    } catch (err) {
      console.error(err)

      // Check for specific error message from backend about borrowed copies exceeding total copies
      if (err.response?.data?.message === 'Cannot update book. There are more borrowed copies than the new total copies.') {
        setShowCannotDeleteModal(true);
      }

     
      setErrors({ form: `Failed to ${mode === 'add' ? 'add' : 'update'} book. Try again.` })
    } finally {
      setIsSaving(false)
    }
  }
  if (!isModalOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn' onClick={() => onClose?.()}>

      <div>
        <CannotReduceCopies 
          isOpen={showCannotDeleteModal} 
          onClose={() => setShowCannotDeleteModal(false)} 
        />
      </div>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 transform transition-all duration-300 animate-slideUp' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-start justify-between mb-4'>
          <h2 className='text-2xl font-semibold'>{mode === 'add' ? 'Add New Book' : 'Edit Book'}</h2>
          <button onClick={() => onClose?.()} aria-label='Close' className='text-gray-500 hover:text-gray-700 rounded p-1'>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='title' className='block text-sm font-medium text-gray-700'>Title</label>
              <input
                id='title'
                name='title'
                ref={firstInputRef}
                value={formData.title}
                onChange={handleChange}
                className='flex mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              {errors.title && <p className='mt-1 text-sm text-red-600'>{errors.title}</p>}
            </div>

            

            <div>
              <label htmlFor='genre' className='block text-sm font-medium text-gray-700'>Genre</label>
              <select id='genre' name='genre' value={formData.genre} onChange={handleChange} className='mt-1 block w-full rounded-md border border-gray-300 p-2'>
                <option value=''>Select Genre</option>
                <option value='Fiction'>Fiction</option>
                <option value='Fantasy'>Fantasy</option>
                <option value='History'>History</option>
                <option value='Science'>Science</option>
                <option value='Biography'>Biography</option>
                <option value='Romance'>Romance</option>
                <option value='Mystery'>Mystery</option>
                <option value='Horror'>Horror</option>
                <option value='Self-Help'>Self-Help</option>
              </select>
              {errors.genre && <p className='mt-1 text-sm text-red-600'>{errors.genre}</p>}
            </div>


            <div>
              <label htmlFor='author' className='block text-sm font-medium text-gray-700'>Author</label>
              <input id='author' name='author' type='text' value={formData.author} onChange={handleChange} className='mt-1 block w-full rounded-md border border-gray-300 p-2' />
              {errors.author && <p className='mt-1 text-sm text-red-600'>{errors.author}</p>}
            </div>

            <div>
              <label htmlFor='publishDate' className='block text-sm font-medium text-gray-700'>Publish Date</label>
              <input id='publishDate' name='publishDate' type='date' value={formData.publishDate} onChange={handleChange} className='mt-1 block w-full rounded-md border border-gray-300 p-2' />
              {errors.publishDate && <p className='mt-1 text-sm text-red-600'>{errors.publishDate}</p>}
            </div>            <div>
              <label htmlFor='copies' className='block text-sm font-medium text-gray-700'>Copies</label>
              <input id='copies' name='copies' type='number' min='1' value={formData.copies} onChange={handleChange} className='mt-1 block w-full rounded-md border border-gray-300 p-2' />
              {errors.copies && <p className='mt-1 text-sm text-red-600'>{errors.copies}</p>}
            </div>

            <div>
              <label htmlFor='borrowLimit' className='block text-sm font-medium text-gray-700'>
                Max Borrow Limit
                <span className='ml-2 text-xs text-gray-500'>(per transaction)</span>
              </label>
              <input 
                id='borrowLimit' 
                name='borrowLimit' 
                type='number' 
                min='1' 
                max='10'
                value={formData.borrowLimit} 
                onChange={handleChange} 
                className='mt-1 block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' 
              />
              {errors.borrowLimit && <p className='mt-1 text-sm text-red-600'>{errors.borrowLimit}</p>}
            </div>

            <div>
              <label htmlFor='returnDays' className='block text-sm font-medium text-gray-700'>
                Return Period (Days)
              </label>
              <input 
                id='returnDays' 
                name='returnDays' 
                type='number' 
                min='1' 
                max='30'
                value={formData.returnDays} 
                onChange={handleChange} 
                className='mt-1 block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' 
              />
              {errors.returnDays && <p className='mt-1 text-sm text-red-600'>{errors.returnDays}</p>}
            </div>
          </div>

          {errors.form && <p className='text-sm text-red-600'>{errors.form}</p>}

          <div className='flex justify-end gap-3 mt-4'>
            <button type='button' onClick={() => onClose?.()} className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100'>Cancel</button>
            <button type='submit' disabled={isSaving} className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60'>
              {isSaving ? 'Saving...' : mode === 'add' ? 'Add Book' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookManageModal
