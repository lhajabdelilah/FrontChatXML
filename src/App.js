import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [image, setImage] = useState(null); // State for image
    const [video, setVideo] = useState(null); // State for video
    const [document, setDocument] = useState(null); // State for document
    const [username, setUsername] = useState(''); // State for username
    const [password, setPassword] = useState(''); // State for password

    // Login handler
    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3000/login', { username, password });
            setToken(response.data.token);
        } catch (error) {
            setError('Login failed');
        }
    };

    // Initialize socket
    useEffect(() => {
        if (token) {
            const newSocket = io('http://localhost:3000', {
                query: { token }
            });
            setSocket(newSocket);

            newSocket.on('receiveMessage', (messageData) => {
                setMessages((prevMessages) => [...prevMessages, messageData]);
            });

            return () => newSocket.disconnect();
        }
    }, [token]);

    // Send text message
    const sendMessage = () => {
        if (message.trim()) {
            const messageData = { from: username, to: 'user2', type: 'text', content: message }; // Include 'from'
            socket.emit('sendMessage', messageData);
            setMessage(''); // Clear input after sending
        }
    };

    // Handle image upload
    const handleImageUpload = async () => {
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post('http://localhost:3000/upload', formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const messageData = { 
                from: username, // Include 'from'
                to: 'user2', 
                type: 'image', 
                content: response.data.filename 
            };
            socket.emit('sendMessage', messageData);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    // Handle video upload
    const handleVideoUpload = async () => {
        const formData = new FormData();
        formData.append('video', video);

        try {
            const response = await axios.post('http://localhost:3000/upload', formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const messageData = { 
                from: username, // Include 'from'
                to: 'user2', 
                type: 'video', 
                content: response.data.filename 
            };
            socket.emit('sendMessage', messageData);
        } catch (error) {
            console.error('Error uploading video:', error);
        }
    };

    // Handle document upload
    const handleDocumentUpload = async () => {
        const formData = new FormData();
        formData.append('document', document);

        try {
            const response = await axios.post('http://localhost:3000/upload', formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });
            const messageData = { 
                from: username, // Include 'from'
                to: 'user2', 
                type: 'document', 
                content: response.data.filename 
            };
            socket.emit('sendMessage', messageData);
        } catch (error) {
            console.error('Error uploading document:', error);
        }
    };

    return (
      <div className="container-fluid bg-light min-vh-100 py-4">
          <div className="container bg-white rounded-3 shadow-lg p-0" style={{ maxWidth: '800px' }}>
              <h1 className="text-center bg-primary text-white py-3 mb-0 rounded-top">Chat Application</h1>
              
              {error && <div className="alert alert-danger m-3">{error}</div>}
              
              {token ? (
                  <div className="p-3">
                      <div className="chat-box bg-light border rounded p-3 mb-4" 
                           style={{ height: '400px', overflowY: 'auto' }}>
                          {messages.map((msg, index) => (
                              <div key={index} className={`mb-3 d-flex ${msg.from === username ? 'justify-content-end' : 'justify-content-start'}`}>
                                  <div className={`p-2 rounded-3 ${msg.from === username ? 'bg-primary text-white' : 'bg-info text-dark'}`}
                                       style={{ maxWidth: '70%' }}>
                                      <small className="d-block mb-1 fw-bold">{msg.from}</small> {/* Display username */}
                                      {msg.type === 'image' ? (
                                          <img src={msg.content} alt="Uploaded" className="img-fluid rounded" />
                                      ) : msg.type === 'video' ? (
                                          <video controls className="w-100 rounded">
                                              <source src={msg.content} type="video/mp4" />
                                              Your browser does not support the video tag.
                                          </video>
                                      ) : msg.type === 'document' ? (
                                          <a href={msg.content} target="_blank" rel="noopener noreferrer" 
                                             className="btn btn-sm btn-light">
                                              📎 View Document
                                          </a>
                                      ) : (
                                          msg.content
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
  
                      <div className="input-group mb-3">
                          <input
                              type="text"
                              className="form-control"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Type your message"
                          />
                          <button className="btn btn-primary" onClick={sendMessage}>
                              Send
                          </button>
                      </div>
  
                      <div className="row g-3">
                          <div className="col-md-4">
                              <div className="card h-100">
                                  <div className="card-body">
                                      <h5 className="card-title">Image Upload</h5>
                                      <input
                                          type="file"
                                          className="form-control mb-2"
                                          accept=".jpg,.jpeg,.png,.gif"
                                          onChange={(e) => setImage(e.target.files[0])}
                                      />
                                      <button className="btn btn-outline-primary w-100" onClick={handleImageUpload}>
                                          Upload Image
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="p-4">
                      <div className="card shadow-sm">
                          <div className="card-body">
                              <h2 className="card-title text-center mb-4">Login</h2>
                              <div className="mb-3">
                                  <input
                                      type="text"
                                      className="form-control form-control-lg"
                                      placeholder="Username"
                                      value={username}
                                      onChange={(e) => setUsername(e.target.value)}
                                  />
                              </div>
                              <div className="mb-4">
                                  <input
                                      type="password"
                                      className="form-control form-control-lg"
                                      placeholder="Password"
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}
                                  />
                              </div>
                              <button className="btn btn-primary btn-lg w-100" onClick={handleLogin}>
                                  Login
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );
};

export default Chat;
