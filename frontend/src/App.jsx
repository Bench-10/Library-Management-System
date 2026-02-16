import { useState, useEffect, use } from 'react'
import { Routes, Route, useNavigate } from "react-router-dom";
import api from './api/axios';
import BookManageModal from './components/modal forms/BookManageModal';
import BookManagement from './pages/BookManagement';
import BookCatalog from './pages/BookCatalog';
import Dashboard from './pages/Dashboard';
import Layout from './layout/Outlet';
import RolePick  from './auth/RolePick';
import BorrowedBooks from './pages/BorrowedBooks';
import Login from './auth/Login';
import Register from './auth/Register';
import RouteProtection from './routes/RouteProtection';
import BorrowingActivities from './pages/BorrowingActivities';
import WalkInBorrowing from './pages/WalkInBorrowing';
import Favorites from './pages/Favorites';
import UserManagement from './pages/UserManagement';

function App() {


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [borrowBook, setBorrowBook] = useState([]);
  const [modalMode, setModalMode] = useState('add');
  const [bookToEdit, setBookToEdit] = useState(null);
  const [currentLoginRole, setCurrentLoginRole] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    // Only check authentication on app initialization
    const storedUserData = localStorage.getItem('userData');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (storedUserData && isLoggedIn === 'true') {
      try {
        const userData = JSON.parse(storedUserData);
        setCurrentLoginRole(userData.role === 'staff' ? 'Staff' : 'Customer');
        setUserRole(userData.role); // Set 'staff' or 'customer'
        
        // Set admin status if user is staff
        if (userData.role === 'staff' && userData.user?.is_admin) {
          setIsAdmin(true);
        }
        
        // Navigate based on role
        if (userData.role === 'staff') {
          if (userData.user?.is_admin) {
            navigate('/dashboard');
          } else {
            navigate('/walk_in_borrowing');
          }
        } else {
          navigate('/book_catalog');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('userData');
        localStorage.removeItem('isLoggedIn');
      
      }
    }
    
  }, []); 


  const openModal = (mode, book = null) => {
    setModalMode(mode);
    setBookToEdit(book);
    setIsModalOpen(true);
  }


  useEffect(() => {
    fetchBooks();
  }, [userRole]);



  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      setBooks(response.data);

    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };



  {/*This handles the routing of Login for Staff and customer*/}
  
  const handleRoleSelection = (role) => {
    
    if (role === 'staff') {
      setCurrentLoginRole('Staff');
    } else if (role === 'customer') {
      setCurrentLoginRole('Customer');
    }
    
    navigate('/login');
  }

  const clearRole = () => {
    setCurrentLoginRole(null);
  }

  const logout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    setCurrentLoginRole(null);
    setUserRole(null);
    setIsAdmin(false);
    navigate("/");
  }
  





  return (
    <>
    <div className="flex min-h-screen" >
     
      <BookManageModal 
        isModalOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode={modalMode} 
        setBooks={setBooks}
        bookToEdit={bookToEdit}
      />

      <Routes>
        <Route path="/" element={<RolePick handleRoleSelection={handleRoleSelection} />} />
        <Route path="/login" element={<Login currentLoginRole={currentLoginRole} clearRole={clearRole} setUserRole={setUserRole} setIsAdmin={setIsAdmin} />} />
        <Route path="/register" element={<Register />} />

        {/*Page Routing (with navbar)*/}
        <Route element={<Layout logout={logout} userRole={userRole} isAdmin={isAdmin} />}>
          {/* Admin Dashboard */}
          <Route path="/dashboard" element={
            <RouteProtection allowedRole="staff" requireAdmin={true}>
              <Dashboard />
            </RouteProtection>
          } />          {/* Admin-only route */}
          <Route path="/book_management" element={
            <RouteProtection allowedRole="staff" requireAdmin={true}>
              <BookManagement openModal={openModal} books={books} setBooks={setBooks} />
            </RouteProtection>
          } />

          {/* User Management - Admin only */}
          <Route path="/user_management" element={
            <RouteProtection allowedRole="staff" requireAdmin={true}>
              <UserManagement />
            </RouteProtection>
          } />

          {/* Customer-only routes */}
          <Route path="/book_catalog" element={
            <RouteProtection allowedRole="customer">
              <BookCatalog books={books} onBorrowSuccess={fetchBooks} />
            </RouteProtection>
          } />

          <Route path="/borrowed_books" element={
            <RouteProtection allowedRole="customer">
              <BorrowedBooks />
            </RouteProtection>
          } />

          <Route path="/favorites" element={
            <RouteProtection allowedRole="customer">
              <Favorites onBorrowSuccess={fetchBooks} />
            </RouteProtection>
          } />

          <Route path="/borrowing_activities" element={
            <RouteProtection allowedRole="staff">
              <BorrowingActivities />
            </RouteProtection>
          } />

          <Route path="/walk_in_borrowing" element={
            <RouteProtection allowedRole="staff">
              <WalkInBorrowing />
            </RouteProtection>
          } />

        </Route>

      </Routes>
       
    </div>
      
    </>
  )
}

export default App
