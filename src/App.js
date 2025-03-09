import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import OfficerLoginForm from './components/OfficerLoginForm';
import OfficerDashboard from './components/OfficerDashboard';
import DocumentUpload from './components/DocumentUpload';
import RegisteredDocuments from './components/RegisterDocuments';
import AddOfficer from './components/AddOfficer';
import ManageOfficer from './components/ManageOfficer';
import MyNavbar from './components/Navbar';
function App() {
  return (
    <div className="App">
      <Router>
      <MyNavbar />
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route path="/user-login" element={<LoginForm userType="user" />} />
          <Route path="/admin-login" element={<LoginForm userType="admin" />} />
          <Route path="/officer-login" element={<OfficerLoginForm />} />
          <Route path="/user-signup" element={<SignupForm userType="user" />} />
          <Route path="/admin-signup" element={<SignupForm userType="admin" />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/officer-dashboard" element={<OfficerDashboard />} />
          <Route path="/document-upload" element={<DocumentUpload />} />
          <Route path="/registered-documents" element={<RegisteredDocuments />} />  
          <Route path="/add-officer" element={<AddOfficer />} />
          <Route path="/manage-officer" element={<ManageOfficer />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
