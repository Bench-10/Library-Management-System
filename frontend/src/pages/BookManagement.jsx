import React, { useMemo, useState } from 'react';
import { FaEdit, FaTrash, FaSearch, FaSortUp, FaSortDown, FaSort, FaExclamationCircle } from "react-icons/fa";
import axios from 'axios';
import DeleteBookModal from '../components/modal forms/DeleteBookModal';

function BookManagement({openModal, books = [], setBooks}) {
  
  const [searchBooks, setSearchBooks] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open delete modal
  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
    }
  };

  // Confirm delete book
  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    setIsDeleting(true);

    try {
      await axios.delete(`http://localhost:3000/api/books/${bookToDelete.book_id}`);
      
      // Remove book from local state
      setBooks((prevBooks) => prevBooks.filter(book => book.book_id !== bookToDelete.book_id));
      
      // Close modal and show success
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
      alert('Book deleted successfully!');
    } catch (error) {
      console.error('Error deleting book:', error);
      
      let errorMessage = 'Failed to delete book. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || 'Cannot delete this book. It is currently borrowed.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Book not found.';
      }
      
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const genres = useMemo(() => {
    const map = new Map();
    books.filter(b => b && typeof b === 'object').forEach(b => {
      const g = b.genre?.trim();
      if (g) {
        const key = g.toLowerCase();
        if (!map.has(key)) map.set(key, g);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [books]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="ml-1 inline text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="ml-1 inline" /> 
      : <FaSortDown className="ml-1 inline" />;
  };

  const filteredBooks = useMemo(() => {
    const q = searchBooks.trim().toLowerCase();
    let filtered = books.filter((book) => {
      if (!book || typeof book !== 'object') return false;
      const matchesSearch = !q || [book.title, book.author, book.genre].some(f => f?.toLowerCase().includes(q));
      const matchesGenre = !selectedGenre || (book.genre?.toLowerCase() === selectedGenre.toLowerCase());
      return matchesSearch && matchesGenre;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle string comparison for title
        if (sortConfig.key === 'title') {
          aValue = aValue?.toLowerCase() || '';
          bValue = bValue?.toLowerCase() || '';
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric comparison for book_id
        if (sortConfig.key === 'book_id') {
          return sortConfig.direction === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [books, searchBooks, selectedGenre, sortConfig]);
  return (
    <> 
        <DeleteBookModal 
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          bookTitle={bookToDelete?.title || ''}
          isDeleting={isDeleting}
        />

        <div className='p-8'><h1 className='text-3xl font-bold mb-8 text-gray-800'>  
               Book Management Page
            </h1>          
            <div className='flex mb-4 justify-between items-center gap-4'>
              <div className='flex items-center gap-4 flex-1'>
                <div>
                  <select 
                    value={selectedGenre} 
                    onChange={(e) => setSelectedGenre(e.target.value)} 
                    className='p-2 border border-gray-300 rounded h-10'
                  >
                    <option value="">All genres</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div className='relative flex-1 max-w-2xl'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <FaSearch className='text-gray-400' />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, author, or genre"
                    value={searchBooks}
                    onChange={(e) => setSearchBooks(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <button className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-150 font-bold' onClick={() => openModal('add')}>
                  Add Book
                </button>
              </div>
              
            </div>
            <div className='overflow-hidden shadow-md rounded-lg border border-gray-200'>
               <div className='overflow-y-auto max-h-160'>                 <table className='min-w-full bg-white'>                    <thead className='bg-red-600 text-white sticky top-0 z-10'>
                      <tr>
                        <th className='px-3 py-4 text-center text-sm font-semibold uppercase tracking-wider w-12'>
                          {/* Icon column */}
                        </th>
                        <th 
                          className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors'
                          onClick={() => handleSort('book_id')}
                        >
                          Book ID {getSortIcon('book_id')}
                        </th>
                        <th 
                          className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer hover:bg-red-700 transition-colors'
                          onClick={() => handleSort('title')}
                        >
                          Title {getSortIcon('title')}
                        </th>
                        <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Author</th>
                        <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Genre</th>
                        <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Publish Date</th>                        <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Total Copies</th>
                        <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Available Copies</th>
                        <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider'>Rating</th>
                        <th className='px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider'>Actions</th>
                      </tr>
                    </thead>                    <tbody className='divide-y divide-gray-200'>
                    {filteredBooks.map((book, index) => (                      <tr key={book.book_id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-red-50 transition-colors duration-150`}>
                        <td className='px-3 py-4'>
                          <div className='flex justify-center items-center'>
                            {book.available_copies === 0 && (
                              <FaExclamationCircle 
                                className='text-red-600 text-xl' 
                                title='Out of Stock'
                              />
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-900 text-center'>{book.book_id}</td>
                        <td className='px-6 py-4 text-sm text-gray-900'>{book.title}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{book.author}</td>
                        <td className='px-6 py-4 text-sm text-gray-700'>{book.genre}</td>                        <td className='px-6 py-4 text-sm text-gray-900'>{book.published_date}</td>                        <td className='px-6 py-4 text-sm text-gray-900'>{book.total_copies}</td>
                        <td className='px-6 py-4 text-sm text-gray-900 text-center'>
                          <span className={`font-semibold ${book.available_copies === 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {book.available_copies}
                          </span>
                        </td>                        <td className='px-6 py-4 text-sm text-gray-900'>
                          {book.rating ? (
                            <span className='flex items-center gap-1'>
                              <span className='text-yellow-500'>★</span>
                              {book.rating}
                            </span>
                          ) : (
                            "--"
                          )}
                        </td>                        <td className='px-6 py-4'>
                          <div className='flex justify-center gap-3'>
                            <button 
                              onClick={() => openModal('edit', book)}
                              className='hover:scale-110 transition-transform'
                              title='Edit book'
                            >
                              <FaEdit className='text-2xl text-blue-600 hover:text-blue-800' />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(book)}
                              className='hover:scale-110 transition-transform'
                              title='Delete book'
                            >
                              <FaTrash className='text-2xl text-red-600 hover:text-red-800' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
            </div>
           
        </div>
    </>
  )
}

export default BookManagement