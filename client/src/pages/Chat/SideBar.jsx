import React, { useState, useEffect } from 'react';
import './sidebar.css';

const SideBar = ({ onSelectUser, users: propUsers, loginUserName, loginUserEmail, loginUserId }) => {
  const [users, setUsers] = useState(propUsers || []);

  // Load dynamic users from localStorage on mount
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("dynamicSidebarUsers") || "[]");
    if (storedUsers.length === 0) return;

    setUsers((prevUsers) => {
      const allUsers = [...prevUsers];

      const filtered = storedUsers.filter(u => {
        // exclude the login user itself
        return u.id?.toString() !== loginUserId?.toString();
      });

      filtered.forEach(u => {
        if (!allUsers.find(user => user.id === u.id)) {
          allUsers.push(u);
        }
      });

      return allUsers;
    });
  }, [loginUserId]);



  // Live update: listen to storage changes (from chat.html or another tab)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "dynamicSidebarUsers") {
        const updatedUsers = JSON.parse(event.newValue || "[]");
        setUsers((prevUsers) => {
          const allUsers = [...prevUsers];
          updatedUsers
            .filter(u => u.id?.toString() !== loginUserId?.toString())
            .forEach(u => {
              if (!allUsers.find(user => user.id === u.id)) {
                allUsers.push(u);
              }
            });
          return allUsers;
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Optional: expose addUserToSidebar for live React updates
  useEffect(() => {
    window.addUserToSidebar = (user) => {
      if (!user || !user.id || user.id.toString() === loginUserId?.toString()) return;


      setUsers((prevUsers) => {
        const exists = prevUsers.find(u => u.id === user.id);
        if (exists) return prevUsers;
        return [...prevUsers, user];
      });

      // Update localStorage so other tabs can read
      const current = JSON.parse(localStorage.getItem("dynamicSidebarUsers") || "[]");
      if (!current.find(u => u.id === user.id)) {
        localStorage.setItem("dynamicSidebarUsers", JSON.stringify([...current, user]));
      }

      if (onSelectUser) onSelectUser(user);
    };

    return () => {
      if (window.addUserToSidebar) delete window.addUserToSidebar;
    };
  }, [onSelectUser]);

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Friends</h2>
      <ul className="user-list">
  {users
    .filter(u => u.name !== loginUserName) // exclude login user by name
    .map(user => (
      <li
        key={user.id}
        className="user-item"
        onClick={() => onSelectUser(user)}
      >
        {/* receiver name ကိုသာ ပြရန် */}
        <span className="user-name">{user.receiverName || user.name}</span>
      </li>
    ))}
</ul>

    </div>
  );
};

export default SideBar;
