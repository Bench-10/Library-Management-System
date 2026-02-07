import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'

function BookManageModal({ isModalOpen, onClose, mode = 'add', setBooks, bookToEdit = null}) {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    copies: '',
    author: '',
    publishDate: '',
    price: ''
  })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const firstInputRef = useRef(null)

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
          price: bookToEdit.price || ''
        })
      } else {
        // Clear form for adding new book
        setFormData({ title: '', genre: '', copies: '', author: '', publishDate: '', price: '' })
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
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const err = {}
    if (!formData.title.trim()) err.title = 'Title is required'
    if (!formData.author.trim()) err.author = 'Author is required'
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
        const response = await axios.post('http://localhost:3000/api/books', formData);
        console.log('Book added successfully')
        console.log(response.data)

        // The backend returns { message: "Book added successfully", data: bookObject }
        setBooks((prevBooks) => [...prevBooks, response.data.data]);
      } else if (mode === 'edit') {
        const response = await axios.put(`http://localhost:3000/api/books/${bookToEdit.book_id}`, formData);
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
      setErrors({ form: `Failed to ${mode === 'add' ? 'add' : 'update'} book. Try again.` })
    } finally {
      setIsSaving(false)
    }
  }
  if (!isModalOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn' onClick={() => onClose?.()}>
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
              </select>
            </div>


            <div>
              <label htmlFor='author' className='block text-sm font-medium text-gray-700'>Author</label>
              <input id='author' name='author' type='text' value={formData.author} onChange={handleChange} className='mt-1 block w-full rounded-md border border-gray-300 p-2' />
              {errors.author && <p className='mt-1 text-sm text-red-600'>{errors.author}</p>}
            </div>

            <div>
              <label htmlFor='publishDate' className='block text-sm font-medium text-gray-700'>Publish Date</label>
              <input id='publishDate' name='publishDate' type='date' value={formData.publishDate} onChange={handleChange} className='mt-1 block w-full rounded-md border border-gray-300 p-2' />
            </div>

            <div>
              <label htmlFor='copies' className='block text-sm font-medium text-gray-700'>Copies</label>
              <input id='copies' name='copies' type='number' value={formData.copies} onChange={handleChange} className='mt-1 block w-full rounded-md border border-gray-300 p-2' />
            </div>

            <div>
              <label htmlFor='price' className='block text-sm font-medium text-gray-700'>Price</label>
              <input id='price' name='price' type='number' step='0.01' value={formData.price} onChange={handleChange} className='mt-1 block w-full rounded-md border border-gray-300 p-2' />
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